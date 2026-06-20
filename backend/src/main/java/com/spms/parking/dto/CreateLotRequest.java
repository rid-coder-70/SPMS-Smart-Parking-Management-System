package com.spms.parking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateLotRequest {
    @NotBlank(message = "Lot name is required")
    private String lotName;

    @NotBlank(message = "Location is required")
    private String location;

    @Min(value = 1, message = "Total capacity must be at least 1")
    private int totalCapacity;
}
