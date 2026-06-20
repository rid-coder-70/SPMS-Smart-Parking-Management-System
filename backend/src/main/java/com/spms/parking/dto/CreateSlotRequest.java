package com.spms.parking.dto;

import com.spms.common.enums.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateSlotRequest {
    @NotBlank
    private String slotNumber;
    
    @NotNull
    private VehicleType slotType;
}
