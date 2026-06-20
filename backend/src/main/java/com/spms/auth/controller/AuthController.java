package com.spms.auth.controller;

import com.spms.auth.dto.*;
import com.spms.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * POST /api/v1/auth/register  — open (no auth required)
 * POST /api/v1/auth/login     — open (no auth required)
 *
 * Mapped relative to server.servlet.context-path=/api/v1
 * so the paths in SecurityConfig are "/auth/**".
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user account.
     * Returns 201 Created with the UserSummaryDto (no token — user must log in next).
     */
    @PostMapping("/register")
    public ResponseEntity<UserSummaryDto> register(
            @Valid @RequestBody RegisterRequest req) {
        UserSummaryDto created = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Authenticate and receive a JWT.
     * Returns 200 OK with AuthResponse { token, tokenType, expiresIn, user }.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest req) {
        AuthResponse response = authService.login(req);
        return ResponseEntity.ok(response);
    }
}
