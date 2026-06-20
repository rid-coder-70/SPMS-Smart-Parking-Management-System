package com.spms.auth.dto;

import lombok.Builder;
import lombok.Data;

/** Response body for successful login — contains JWT + user info. */
@Data
@Builder
public class AuthResponse {
    private String         token;
    private String         tokenType;      // "Bearer"
    private long           expiresIn;      // seconds
    private UserSummaryDto user;
}
