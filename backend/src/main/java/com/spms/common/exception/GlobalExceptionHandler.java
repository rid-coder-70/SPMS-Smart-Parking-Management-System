package com.spms.common.exception;


import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

/**
 * Global exception handler.
 * All error responses conform to: { "error": "...", "message": "..." }
 * Handles: 400, 401, 403, 404, 409, 423, 500
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 400 Bad Request ───────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        // Return the first field-level validation message
        String firstMessage = ex.getBindingResult().getAllErrors().stream()
                .map(err -> {
                    if (err instanceof FieldError fe) {
                        return fe.getField() + ": " + fe.getDefaultMessage();
                    }
                    return err.getDefaultMessage();
                })
                .findFirst()
                .orElse("Validation failed");

        return ResponseEntity.badRequest()
                .body(new ErrorResponse("VALIDATION_ERROR", firstMessage));
    }

    @ExceptionHandler(SpmsException.class)
    public ResponseEntity<ErrorResponse> handleSpmsException(SpmsException ex) {
        log.warn("Business rule violation: {}", ex.getMessage());
        return ResponseEntity.status(ex.getStatus())
                .body(new ErrorResponse(ex.getStatus().name(), ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse("BAD_REQUEST", ex.getMessage()));
    }

    // ── 401 Unauthorized ──────────────────────────────────────

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("UNAUTHORIZED", "Invalid username or password"));
    }

    // ── 403 Forbidden ─────────────────────────────────────────

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("FORBIDDEN", "You do not have permission to access this resource"));
    }



    // ── 423 Locked (via ResponseStatusException) ──────────────

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex) {
        String errorCode = ex.getStatusCode().value() == 423
                ? "ACCOUNT_LOCKED"
                : ex.getStatusCode().toString();
        return ResponseEntity.status(ex.getStatusCode())
                .body(new ErrorResponse(errorCode, ex.getReason() != null
                        ? ex.getReason() : ex.getMessage()));
    }



    // ── 500 Internal Server Error ─────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred"));
    }
}
