package com.spms.parking.dto;

import com.spms.common.enums.LotStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParkingLotDto {
    private Long id;
    private String lotName;
    private String location;
    private int totalCapacity;
    private LotStatus status;
    private LocalDateTime createdDate;
}
