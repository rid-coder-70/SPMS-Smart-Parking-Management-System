package com.spms.common.exception;

/**
 * Standard error envelope: { "error": "...", "message": "..." }
 * Returned by GlobalExceptionHandler for all 4xx/5xx responses.
 */
public record ErrorResponse(String error, String message) {}
