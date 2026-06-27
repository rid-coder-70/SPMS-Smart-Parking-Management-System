package com.spms.auth.dto;

import com.spms.auth.entity.User;

/**
 * Converts a User entity into a UserSummaryDto.
 *
 * This mapper is a standalone utility so that multiple services
 * (AuthService, UserService) can reuse it without depending on each other.
 */
public final class UserMapper {

    private UserMapper() {} // Prevent instantiation

    /**
     * Maps a User entity to a safe DTO that never exposes the password hash.
     */
    public static UserSummaryDto toSummary(User user) {
        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .vehicleType(user.getVehicleType())
                .vehicleNumber(user.getVehicleNumber())
                .accountStatus(user.getAccountStatus())
                .build();
    }
}
