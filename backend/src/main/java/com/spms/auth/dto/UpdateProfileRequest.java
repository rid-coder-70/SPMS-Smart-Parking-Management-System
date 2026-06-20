package com.spms.auth.dto;

import com.spms.common.enums.VehicleType;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Request body for PUT /api/v1/users/me — all fields are optional patches. */
@Data
public class UpdateProfileRequest {

    @Size(max = 100)
    private String email;           // format validated in service if provided

    private String phone;           // format validated in service if provided

    private VehicleType vehicleType;

    @Size(max = 20)
    private String vehicleNumber;
}
