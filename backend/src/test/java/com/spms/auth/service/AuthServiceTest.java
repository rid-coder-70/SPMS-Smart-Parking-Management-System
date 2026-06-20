package com.spms.auth.service;

import com.spms.auth.dto.LoginRequest;
import com.spms.auth.dto.RegisterRequest;
import com.spms.auth.dto.UserSummaryDto;
import com.spms.auth.dto.AuthResponse;
import com.spms.auth.entity.User;
import com.spms.auth.repository.UserRepository;
import com.spms.common.enums.AccountStatus;
import com.spms.common.enums.Role;
import com.spms.common.exception.AccountLockedException;
import com.spms.common.exception.SpmsException;
import com.spms.common.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * JUnit 5 unit tests for AuthService.
 * Repository and dependencies are mocked — no Spring context, no DB.
 *
 * Test cases:
 *  1. Successful registration
 *  2. Duplicate username rejected (409)
 *  3. Duplicate email rejected (409)
 *  4. Invalid email format rejected (400)
 *  5. Successful login
 *  6. Wrong password increments failedLoginAttempts
 *  7. Account locks after 3 failed logins (status=LOCKED, lockedUntil set)
 *  8. Locked account rejects login even with correct password (423)
 *  9. Locked account with expired lock auto-unlocks on next login
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository  userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil         jwtUtil;

    @InjectMocks
    private AuthService authService;

    // ─────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────

    private User buildActiveUser() {
        return User.builder()
                .id(1L)
                .username("ridoy")
                .passwordHash("$2a$10$hashedpassword")
                .email("ridoy@example.com")
                .role(Role.USER)
                .accountStatus(AccountStatus.ACTIVE)
                .failedLoginAttempts(0)
                .build();
    }

    private RegisterRequest buildRegisterRequest() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("ridoy");
        req.setPassword("secret123");
        req.setEmail("ridoy@example.com");
        req.setPhone("+8801712345678");
        return req;
    }

    private LoginRequest buildLoginRequest() {
        LoginRequest req = new LoginRequest();
        req.setUsername("ridoy");
        req.setPassword("secret123");
        return req;
    }

    // ─────────────────────────────────────────────────────────
    //  REGISTER
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("register()")
    class RegisterTests {

        @Test
        @DisplayName("1. Successful registration returns UserSummaryDto")
        void successfulRegistration() {
            // arrange
            RegisterRequest req = buildRegisterRequest();
            when(userRepository.existsByUsername("ridoy")).thenReturn(false);
            when(userRepository.existsByEmail("ridoy@example.com")).thenReturn(false);
            when(passwordEncoder.encode("secret123")).thenReturn("$2a$10$hashed");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                u.setId(1L);
                return u;
            });

            // act
            UserSummaryDto result = authService.register(req);

            // assert
            assertThat(result).isNotNull();
            assertThat(result.getUsername()).isEqualTo("ridoy");
            assertThat(result.getEmail()).isEqualTo("ridoy@example.com");
            assertThat(result.getRole()).isEqualTo(Role.USER);
            assertThat(result.getAccountStatus()).isEqualTo(AccountStatus.ACTIVE);

            verify(userRepository).save(argThat(u ->
                    u.getPasswordHash().equals("$2a$10$hashed")
                    && u.getRole() == Role.USER
                    && u.getAccountStatus() == AccountStatus.ACTIVE
            ));
        }

        @Test
        @DisplayName("2. Duplicate username rejected with 409 CONFLICT")
        void duplicateUsernameRejected() {
            RegisterRequest req = buildRegisterRequest();
            when(userRepository.existsByUsername("ridoy")).thenReturn(true);

            SpmsException ex = catchThrowableOfType(
                    () -> authService.register(req), SpmsException.class);

            assertThat(ex).isNotNull();
            assertThat(ex.getStatus()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(ex.getMessage()).contains("ridoy");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("3. Duplicate email rejected with 409 CONFLICT")
        void duplicateEmailRejected() {
            RegisterRequest req = buildRegisterRequest();
            when(userRepository.existsByUsername("ridoy")).thenReturn(false);
            when(userRepository.existsByEmail("ridoy@example.com")).thenReturn(true);

            SpmsException ex = catchThrowableOfType(
                    () -> authService.register(req), SpmsException.class);

            assertThat(ex.getStatus()).isEqualTo(HttpStatus.CONFLICT);
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("4. Invalid email format rejected with 400 BAD_REQUEST")
        void invalidEmailRejected() {
            RegisterRequest req = buildRegisterRequest();
            req.setEmail("not-an-email");

            SpmsException ex = catchThrowableOfType(
                    () -> authService.register(req), SpmsException.class);

            assertThat(ex.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(ex.getMessage()).containsIgnoringCase("email");
            verify(userRepository, never()).existsByUsername(any());
        }
    }

    // ─────────────────────────────────────────────────────────
    //  LOGIN
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("login()")
    class LoginTests {

        @Test
        @DisplayName("5. Successful login returns AuthResponse with token")
        void successfulLogin() {
            User user = buildActiveUser();
            LoginRequest req = buildLoginRequest();

            when(userRepository.findByUsername("ridoy")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("secret123", user.getPasswordHash())).thenReturn(true);
            when(jwtUtil.generateToken(user)).thenReturn("jwt.token.here");
            when(jwtUtil.getExpirySeconds()).thenReturn(1800L);
            when(userRepository.save(any())).thenReturn(user);

            AuthResponse response = authService.login(req);

            assertThat(response.getToken()).isEqualTo("jwt.token.here");
            assertThat(response.getTokenType()).isEqualTo("Bearer");
            assertThat(response.getExpiresIn()).isEqualTo(1800L);
            assertThat(response.getUser().getUsername()).isEqualTo("ridoy");
            assertThat(user.getFailedLoginAttempts()).isEqualTo(0);
        }

        @Test
        @DisplayName("6. Wrong password increments failedLoginAttempts")
        void wrongPasswordIncrementsCounter() {
            User user = buildActiveUser();
            user.setFailedLoginAttempts(1);
            LoginRequest req = buildLoginRequest();

            when(userRepository.findByUsername("ridoy")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("secret123", user.getPasswordHash())).thenReturn(false);
            when(userRepository.save(any())).thenReturn(user);

            catchThrowableOfType(() -> authService.login(req), SpmsException.class);

            assertThat(user.getFailedLoginAttempts()).isEqualTo(2);
            assertThat(user.getAccountStatus()).isEqualTo(AccountStatus.ACTIVE); // not yet locked
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("7. Account locks after 3rd failed login (status=LOCKED, lockedUntil set)")
        void accountLocksAfterThreeFailedAttempts() {
            User user = buildActiveUser();
            user.setFailedLoginAttempts(2);  // 2 previous failures → 3rd attempt will lock
            LoginRequest req = buildLoginRequest();

            when(userRepository.findByUsername("ridoy")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("secret123", user.getPasswordHash())).thenReturn(false);
            when(userRepository.save(any())).thenReturn(user);

            // The 3rd failure should lock the account AND throw AccountLockedException
            AccountLockedException lockEx = catchThrowableOfType(
                    () -> authService.login(req), AccountLockedException.class);

            assertThat(lockEx).isNotNull();
            assertThat(user.getAccountStatus()).isEqualTo(AccountStatus.LOCKED);
            assertThat(user.getLockedUntil()).isNotNull();
            assertThat(user.getLockedUntil()).isAfter(LocalDateTime.now());
            assertThat(user.getFailedLoginAttempts()).isEqualTo(3);
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("8. Locked account rejects login with 423 even with correct password")
        void lockedAccountRejectsLoginWithCorrectPassword() {
            User user = buildActiveUser();
            user.setAccountStatus(AccountStatus.LOCKED);
            user.setFailedLoginAttempts(3);
            user.setLockedUntil(LocalDateTime.now().plusMinutes(14)); // lock still active
            LoginRequest req = buildLoginRequest();

            when(userRepository.findByUsername("ridoy")).thenReturn(Optional.of(user));

            AccountLockedException lockEx = catchThrowableOfType(
                    () -> authService.login(req), AccountLockedException.class);

            assertThat(lockEx).isNotNull();
            assertThat(lockEx.getLockedUntil()).isAfter(LocalDateTime.now());

            // Password check must never be reached
            verify(passwordEncoder, never()).matches(any(), any());
            verify(jwtUtil, never()).generateToken(any());
        }

        @Test
        @DisplayName("9. Locked account with expired lock auto-unlocks on login")
        void expiredLockAutoUnlocksOnLogin() {
            User user = buildActiveUser();
            user.setAccountStatus(AccountStatus.LOCKED);
            user.setFailedLoginAttempts(3);
            user.setLockedUntil(LocalDateTime.now().minusMinutes(1)); // lock expired
            LoginRequest req = buildLoginRequest();

            when(userRepository.findByUsername("ridoy")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("secret123", user.getPasswordHash())).thenReturn(true);
            when(jwtUtil.generateToken(user)).thenReturn("new.jwt.token");
            when(jwtUtil.getExpirySeconds()).thenReturn(1800L);
            when(userRepository.save(any())).thenReturn(user);

            AuthResponse response = authService.login(req);

            // Should auto-unlock and succeed
            assertThat(response.getToken()).isEqualTo("new.jwt.token");
            assertThat(user.getAccountStatus()).isEqualTo(AccountStatus.ACTIVE);
            assertThat(user.getFailedLoginAttempts()).isEqualTo(0);
            assertThat(user.getLockedUntil()).isNull();
        }
    }
}
