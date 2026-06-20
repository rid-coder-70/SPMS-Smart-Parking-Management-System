package com.spms.reservation.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateReservationRequest {
    @NotNull
    private Long slotId;
    @NotNull @Future
    private LocalDateTime startTime;
    @Min(30)
    private int durationMinutes;
}
