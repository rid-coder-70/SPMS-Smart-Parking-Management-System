package com.spms.common.exception;

/**
 * Thrown when a user tries to log in but their account is temporarily
 * locked (lockedUntil is still in the future).
 * Maps to HTTP 423 Locked in GlobalExceptionHandler.
 */
public class AccountLockedException extends RuntimeException {

    private final java.time.LocalDateTime lockedUntil;

    public AccountLockedException(java.time.LocalDateTime lockedUntil) {
        super("Account is locked until " + lockedUntil);
        this.lockedUntil = lockedUntil;
    }

    public java.time.LocalDateTime getLockedUntil() { return lockedUntil; }
}
