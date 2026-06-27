package com.spms.parking.dto;

import com.spms.common.enums.VehicleType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkCreateSlotsRequest {

    @Min(value = 1, message = "Count must be at least 1")
    private int count;

    private String prefix; // e.g., "A-"

    @NotNull(message = "Slot type is required")
    private VehicleType slotType;
}
