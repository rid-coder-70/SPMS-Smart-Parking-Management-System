package com.spms.auth.dto;

import com.spms.common.enums.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request body for POST /api/v1/auth/register.
 * Email format and phone format are validated in AuthService (business logic),
 * not via Bean Validation, so the service can return the exact error message spec requires.
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3-50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Email is required")
    private String email;           // format validated in service

    private String phone;           // format validated in service (optional)

    private VehicleType vehicleType;

    private String vehicleNumber;
}
