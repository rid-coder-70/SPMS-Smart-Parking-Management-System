package com.spms.reservation.dto;

import com.spms.common.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for reservation data.
 * Includes denormalized slotNumber and lotName for frontend convenience.
 */
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
    private ReservationStatus status;
    private String vehicleNumber;
    private LocalDateTime createdDate;
}
