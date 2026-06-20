package com.spms.reservation.dto;

import com.spms.common.enums.ReservationStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReservationDto {
    private Long id;
    private Long slotId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime checkInTime;
    private ReservationStatus status;
}
