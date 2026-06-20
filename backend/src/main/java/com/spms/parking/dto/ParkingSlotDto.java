package com.spms.parking.dto;

import com.spms.common.enums.SlotStatus;
import com.spms.common.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParkingSlotDto {
    private Long id;
    private Long lotId;
    private String slotNumber;
    private VehicleType slotType;
    private SlotStatus status;
}
