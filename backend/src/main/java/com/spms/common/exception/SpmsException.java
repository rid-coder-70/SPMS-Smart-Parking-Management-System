package com.spms.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Domain-specific exception. Throw this from any service layer to produce
 * a controlled HTTP error response via GlobalExceptionHandler.
 *
 * Example:
 *   throw new SpmsException("Slot already reserved", HttpStatus.CONFLICT);
 */
@Getter
public class SpmsException extends RuntimeException {

    private final HttpStatus status;

    public SpmsException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public static SpmsException notFound(String entity, Long id) {
        return new SpmsException(entity + " not found with id: " + id, HttpStatus.NOT_FOUND);
    }

    public static SpmsException conflict(String message) {
        return new SpmsException(message, HttpStatus.CONFLICT);
    }

    public static SpmsException badRequest(String message) {
        return new SpmsException(message, HttpStatus.BAD_REQUEST);
    }
}
