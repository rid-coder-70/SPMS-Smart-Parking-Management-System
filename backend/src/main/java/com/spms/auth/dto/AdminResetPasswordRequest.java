package com.spms.auth.dto;

/** Admin-only: body for PUT /{id}/reset-password */
public record AdminResetPasswordRequest(String newPassword) {}
