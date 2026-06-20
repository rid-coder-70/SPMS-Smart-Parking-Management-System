package com.spms.auth.service;

import com.spms.auth.entity.User;
import com.spms.auth.repository.UserRepository;
import com.spms.common.enums.AccountStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

/**
 * Handles the lock-write in its OWN separate transaction (REQUIRES_NEW).
 *
 * WHY A SEPARATE BEAN?
 * Spring's @Transactional AOP proxy only applies when a method is called from
 * OUTSIDE the bean. Calling a @Transactional method from within the same bean
 * (self-invocation) bypasses the proxy — the transaction annotation is ignored.
 *
 * By placing the lock-write in a different Spring bean, the outer login() method
 * can call it and be sure:
 *  1. The lock is committed to the DB before login() returns.
 *  2. ResponseStatusException(423) thrown AFTER the write is NOT rolled back.
 *  3. @ControllerAdvice sees it cleanly as a ResponseStatusException.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginLockService {

    private final UserRepository userRepository;

    private static final int  MAX_FAILED_ATTEMPTS = 3;
    private static final long LOCK_DURATION_MIN   = 15L;

    /**
     * Increments failedLoginAttempts and, if MAX is reached,
     * commits LOCKED status + lockedUntil in a NEW transaction before
     * throwing 423.  Returns false if not yet at max (caller throws 401).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailAndLockIfNeeded(User user) {
        // Re-load within THIS transaction's session to get a managed entity
        User managed = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        int attempts = managed.getFailedLoginAttempts() + 1;
        managed.setFailedLoginAttempts(attempts);

        if (attempts >= MAX_FAILED_ATTEMPTS) {
            LocalDateTime lockUntil = LocalDateTime.now().plusMinutes(LOCK_DURATION_MIN);
            managed.setAccountStatus(AccountStatus.LOCKED);
            managed.setLockedUntil(lockUntil);
            userRepository.saveAndFlush(managed);
            log.warn("Account '{}' LOCKED after {} failed attempts until {}",
                    managed.getUsername(), attempts, lockUntil);
            throw new ResponseStatusException(HttpStatus.LOCKED,
                    "Account locked due to too many failed login attempts. " +
                    "Try again after " + lockUntil);
        }

        userRepository.saveAndFlush(managed);
    }

    /**
     * Resets failed attempts on successful login (REQUIRES_NEW so it
     * commits independently of the outer read).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void resetFailedAttempts(User user) {
        User managed = userRepository.findById(user.getId()).orElseThrow();
        managed.setFailedLoginAttempts(0);
        userRepository.saveAndFlush(managed);
    }

    /**
     * Re-activates an expired lock (REQUIRES_NEW).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void unlockExpired(User user) {
        User managed = userRepository.findById(user.getId()).orElseThrow();
        managed.setAccountStatus(AccountStatus.ACTIVE);
        managed.setFailedLoginAttempts(0);
        managed.setLockedUntil(null);
        userRepository.saveAndFlush(managed);
    }
}
