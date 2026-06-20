package com.spms.auth.dto;

import com.spms.common.enums.AccountStatus;
import com.spms.common.enums.Role;
import com.spms.common.enums.VehicleType;
import lombok.Builder;
import lombok.Data;

/** Safe user projection — never exposes passwordHash. */
@Data
@Builder
public class UserSummaryDto {
    private Long          id;
    private String        username;
    private String        email;
    private String        phone;
    private Role          role;
    private VehicleType   vehicleType;
    private String        vehicleNumber;
    private AccountStatus accountStatus;
}
