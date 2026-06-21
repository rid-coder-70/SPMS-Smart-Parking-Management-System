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
}
