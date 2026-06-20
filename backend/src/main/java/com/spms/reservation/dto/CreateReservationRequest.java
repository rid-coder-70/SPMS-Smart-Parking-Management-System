package com.spms.reservation.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Inbound payload for creating a reservation.
 * Duration must be ≥ 30 and divisible by 30 (validated in service).
 */
@Data
public class CreateReservationRequest {

    @NotNull(message = "slotId is required")
    private Long slotId;

    @NotNull(message = "startTime is required")
    @Future(message = "startTime must be in the future")
    private LocalDateTime startTime;

    @NotNull(message = "durationMinutes is required")
    @Min(value = 30, message = "durationMinutes must be at least 30")
    private Integer durationMinutes;
}
