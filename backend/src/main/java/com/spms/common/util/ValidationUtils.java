package com.spms.common.util;

import com.spms.common.exception.SpmsException;
import org.springframework.http.HttpStatus;

import java.util.regex.Pattern;

/**
 * Shared validation helpers used by AuthService and UserService.
 *
 * Centralizing these patterns avoids duplicating regex logic across services
 * and ensures consistent validation rules throughout the application.
 */
public final class ValidationUtils {

    // Matches: user@example.com, user+tag@sub.domain.co
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    // Matches: 10-15 digits, optionally starting with '+'
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^(\\+?\\d{10,15})$");

    private ValidationUtils() {} // Prevent instantiation

    /**
     * Validates an email address format.
     * Throws SpmsException (400) if the format is invalid.
     */
    public static void validateEmail(String email) {
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new SpmsException("Invalid email format: " + email, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Validates a phone number format (optional field).
     * Only validates if the phone value is non-null and non-blank.
     * Throws SpmsException (400) if the format is invalid.
     */
    public static void validatePhone(String phone) {
        if (phone != null && !phone.isBlank()
                && !PHONE_PATTERN.matcher(phone).matches()) {
            throw new SpmsException(
                    "Invalid phone format. Expected 10-15 digits, optionally prefixed with '+'.",
                    HttpStatus.BAD_REQUEST);
        }
    }
}
