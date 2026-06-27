package com.spms.auth.service;

import com.spms.auth.dto.*;
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

    // --- Register ---

    @Transactional
    public UserSummaryDto register(RegisterRequest req) {

        // Validate input formats using shared utility
        ValidationUtils.validateEmail(req.getEmail());
        ValidationUtils.validatePhone(req.getPhone());

        // Check for duplicate username / email
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

        // Build and save the new user
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

    // --- Login ---
    //
    // NOT @Transactional — DB writes are delegated to LoginLockService
    // (REQUIRES_NEW) so each write commits before any exception is thrown.

    public AuthResponse login(LoginRequest req) {

        // Look up the user by username
        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new SpmsException("Invalid username or password",
                        HttpStatus.UNAUTHORIZED));

        // Check if the account is currently locked
        if (user.getAccountStatus() == AccountStatus.LOCKED) {
            LocalDateTime until = user.getLockedUntil();
            if (until != null && LocalDateTime.now().isBefore(until)) {
                throw new ResponseStatusException(HttpStatus.LOCKED,
                        "Account is locked until " + until + ". Try again later.");
            }
            // Lock window has expired — re-activate (commits in its own transaction)
            lockService.unlockExpired(user);
            user = userRepository.findByUsername(req.getUsername()).orElseThrow();
        }

        // Verify the password
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            // Records the failure and locks the account if max attempts reached
            lockService.recordFailAndLockIfNeeded(user);
            throw new SpmsException("Invalid username or password", HttpStatus.UNAUTHORIZED);
        }

        // Password correct — reset any failed attempt counter
        lockService.resetFailedAttempts(user);

        // Generate and return a JWT token
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
