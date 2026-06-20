package com.spms.auth.controller;

import com.spms.auth.dto.*;
import com.spms.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * User management endpoints.
 *
 * GET    /api/v1/users/me                  — authenticated user's own profile
 * PUT    /api/v1/users/me                  — update own profile
 * PUT    /api/v1/users/me/password         — change own password
 * GET    /api/v1/users                     — admin: list all users (paginated)
 * PUT    /api/v1/users/{id}/activate       — admin: activate account
 * PUT    /api/v1/users/{id}/deactivate     — admin: deactivate account
 * PUT    /api/v1/users/{id}/reset-password — admin: set a new password
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ── Own Profile ───────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<UserSummaryDto> getMe(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(userService.getMe(principal.getUsername()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserSummaryDto> updateMe(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(userService.updateProfile(principal.getUsername(), req));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(principal.getUsername(), req);
        return ResponseEntity.noContent().build();
    }

    // ── Admin Endpoints ───────────────────────────────────────

    /** GET /users?page=0&size=20&sort=username,asc */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserSummaryDto>> listUsers(
            @PageableDefault(size = 20, sort = "username") Pageable pageable) {
        return ResponseEntity.ok(userService.listAllUsers(pageable));
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserSummaryDto> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.activateUser(id));
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserSummaryDto> deactivateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deactivateUser(id));
    }

    @PutMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Long id,
            @RequestBody AdminResetPasswordRequest req) {
        userService.adminResetPassword(id, req);
        return ResponseEntity.noContent().build();
    }
}
