package com.spms.parking.dto;

import lombok.Data;

@Data
public class ParkingLotDto {
    private Long id;
    private String lotName;
    private String location;
    private Integer totalCapacity;
    private String status;
}
