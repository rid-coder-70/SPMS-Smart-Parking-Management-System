package com.spms.parking.dto;

import com.spms.common.enums.SlotStatus;
import com.spms.common.enums.VehicleType;
import lombok.Data;

@Data
public class ParkingSlotDto {
    private Long id;
    private Long lotId;
    private String slotNumber;
    private VehicleType slotType;
    private SlotStatus status;
}
