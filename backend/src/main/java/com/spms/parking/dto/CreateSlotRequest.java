package com.spms.parking.dto;

import com.spms.common.enums.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSlotRequest {

    @NotBlank(message = "Slot number is required")
    private String slotNumber;

    @NotNull(message = "Slot type is required")
    private VehicleType slotType;
}
