package com.spms.reservation.dto;

import com.spms.common.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDto {

    private Long id;
    private Long userId;
    private Long slotId;
    private String slotNumber;
    private String lotName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime checkInTime;
    private ReservationStatus status;
    private String vehicleNumber;
    private LocalDateTime createdDate;
}
