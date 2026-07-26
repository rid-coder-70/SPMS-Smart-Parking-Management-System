package com.spms.common.util;

import com.spms.auth.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility to extract the authenticated user's ID from the JWT-backed
 * SecurityContext. Call from any service layer to get the logged-in user's id.
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    /**
     * Returns the userId embedded in the JWT via JwtAuthenticationFilter.
     * Assumes the principal is a {@link User} instance set by the filter.
     *
     * @throws IllegalStateException if no authenticated user is present.
     */
    public static Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof User user) {
            return user.getId();
        }
        return null;
    }

    public static String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return "SYSTEM";
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof User user) {
            return user.getUsername();
        }
        if (principal instanceof String s) {
            return s;
        }
        return "SYSTEM";
    }
}
