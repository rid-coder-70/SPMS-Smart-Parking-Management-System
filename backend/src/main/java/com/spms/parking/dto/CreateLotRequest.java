package com.spms.parking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateLotRequest {
    @NotBlank
    private String lotName;
    
    @NotBlank
    private String location;
    
    @Min(1)
    private Integer totalCapacity;
}
