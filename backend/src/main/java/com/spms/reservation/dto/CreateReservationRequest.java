package com.spms.reservation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Request body for POST /api/v1/reservations. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReservationRequest {

    @NotNull(message = "Slot ID is required")
    private Long slotId;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    /** Optional — overrides the user's registered vehicle number. */
    private String vehicleNumber;
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
