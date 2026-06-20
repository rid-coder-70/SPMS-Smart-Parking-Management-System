package com.spms.auth.service;

import com.spms.auth.dto.*;
import com.spms.auth.entity.User;
import com.spms.auth.repository.UserRepository;
import com.spms.common.enums.AccountStatus;
import com.spms.common.enums.Role;
import com.spms.common.exception.SpmsException;
import com.spms.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

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

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^(\\+?\\d{10,15})$");

    private final UserRepository   userRepository;
    private final PasswordEncoder  passwordEncoder;
    private final JwtUtil          jwtUtil;
    private final LoginLockService lockService;

    // ── Register ──────────────────────────────────────────────

    @Transactional
    public UserSummaryDto register(RegisterRequest req) {

        if (!EMAIL_PATTERN.matcher(req.getEmail()).matches()) {
            throw new SpmsException("Invalid email format: " + req.getEmail(),
                    HttpStatus.BAD_REQUEST);
        }
        if (req.getPhone() != null && !req.getPhone().isBlank()
                && !PHONE_PATTERN.matcher(req.getPhone()).matches()) {
            throw new SpmsException(
                    "Invalid phone format. Expected 10-15 digits, optionally prefixed with '+'.",
                    HttpStatus.BAD_REQUEST);
        }
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
        return toSummary(user);
    }

    // ── Login ─────────────────────────────────────────────────
    //
    // NOT @Transactional — DB writes are delegated to LoginLockService
    // (REQUIRES_NEW) so each write commits before any exception is thrown.
    // This guarantees the lock persists even when ResponseStatusException(423)
    // is thrown immediately afterwards.

    public AuthResponse login(LoginRequest req) {

        // Fresh read — no outer transaction, so Hibernate uses its own short tx
        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new SpmsException("Invalid username or password",
                        HttpStatus.UNAUTHORIZED));

        // ── 423: Already locked and lock still active? ────────
        if (user.getAccountStatus() == AccountStatus.LOCKED) {
            LocalDateTime until = user.getLockedUntil();
            if (until != null && LocalDateTime.now().isBefore(until)) {
                throw new ResponseStatusException(HttpStatus.LOCKED,
                        "Account is locked until " + until + ". Try again later.");
            }
            // Lock window has expired — re-activate (REQUIRES_NEW)
            lockService.unlockExpired(user);
            // Re-read fresh state after the committed unlock
            user = userRepository.findByUsername(req.getUsername()).orElseThrow();
        }

        // ── Verify password ───────────────────────────────────
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            // recordFailAndLockIfNeeded commits in REQUIRES_NEW, then throws 423 on 3rd fail
            lockService.recordFailAndLockIfNeeded(user);
            // Only reached if not yet at limit (< 3 attempts) — throw 401
            throw new SpmsException("Invalid username or password", HttpStatus.UNAUTHORIZED);
        }

        // ── Success — reset counter ───────────────────────────
        lockService.resetFailedAttempts(user);

        String token = jwtUtil.generateToken(user);
        log.info("User '{}' logged in successfully", user.getUsername());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpirySeconds())
                .user(toSummary(user))
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────

    public static UserSummaryDto toSummary(User user) {
        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .vehicleType(user.getVehicleType())
                .vehicleNumber(user.getVehicleNumber())
                .accountStatus(user.getAccountStatus())
                .build();
    }
}
