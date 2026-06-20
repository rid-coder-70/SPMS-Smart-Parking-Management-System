package com.spms.reservation.dto;

import com.spms.common.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Outbound DTO representing a reservation — returned by all read endpoints.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDto {

    private Long id;
    private Long slotId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime checkInTime;  // null until checked in
    private ReservationStatus status;
    private LocalDateTime createdDate;
}
