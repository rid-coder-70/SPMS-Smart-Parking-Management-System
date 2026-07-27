package com.spms.auth.service;

import com.spms.auth.dto.AuthResponse;
import com.spms.auth.dto.LoginRequest;
import com.spms.auth.dto.RegisterRequest;
import com.spms.auth.dto.UserMapper;
import com.spms.auth.dto.UserSummaryDto;
import com.spms.auth.entity.User;
import com.spms.auth.repository.UserRepository;
import com.spms.common.enums.AccountStatus;
import com.spms.common.enums.Role;
import com.spms.common.exception.SpmsException;
import com.spms.common.util.JwtUtil;
import com.spms.common.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

/**
 * Authentication service — register, login.
 *
 * login() is intentionally NOT @Transactional.
 * All DB writes that must survive a thrown exception are delegated to
 * LoginLockService which uses REQUIRES_NEW propagation — each write
 * commits in its own independent transaction so a subsequent throw
 * cannot roll back the persisted lock state.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository   userRepository;
    private final PasswordEncoder  passwordEncoder;
    private final JwtUtil          jwtUtil;
    private final LoginLockService lockService;

    @Transactional
    public UserSummaryDto register(RegisterRequest req) {
        ValidationUtils.validateEmail(req.getEmail());
        ValidationUtils.validatePhone(req.getPhone());

        if (userRepository.existsByUsername(req.getUsername())) {
            throw new SpmsException(
                    "Username '" + req.getUsername() + "' is already taken",
                    HttpStatus.CONFLICT);
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new SpmsException(
                    "Email '" + req.getEmail() + "' is already registered",
                    HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .username(req.getUsername())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .email(req.getEmail())
                .phone(req.getPhone())
                .vehicleType(req.getVehicleType())
                .vehicleNumber(req.getVehicleNumber())
                .role(Role.USER)
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: id={}, username={}", user.getId(), user.getUsername());
        return UserMapper.toSummary(user);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new SpmsException("Invalid username or password",
                        HttpStatus.UNAUTHORIZED));

        if (user.getAccountStatus() == AccountStatus.LOCKED) {
            LocalDateTime until = user.getLockedUntil();
            if (until != null && LocalDateTime.now().isBefore(until)) {
                throw new ResponseStatusException(HttpStatus.LOCKED,
                        "Account is locked until " + until + ". Try again later.");
            }
            // Lock window expired — re-activate in its own transaction before continuing
            lockService.unlockExpired(user);
            user = userRepository.findByUsername(req.getUsername()).orElseThrow();
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            lockService.recordFailAndLockIfNeeded(user);
            throw new SpmsException("Invalid username or password", HttpStatus.UNAUTHORIZED);
        }

        lockService.resetFailedAttempts(user);

        String token = jwtUtil.generateToken(user);
        log.info("User '{}' logged in successfully", user.getUsername());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpirySeconds())
                .user(UserMapper.toSummary(user))
                .build();
    }
}
