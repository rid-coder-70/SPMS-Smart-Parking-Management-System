package com.spms.report.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UtilizationReport {
    private long totalReservations;
    private long completedReservations;
    private long cancelledReservations;
    private long noShowReservations;
    private double avgDurationMinutes;
    private double occupancyRatePercent;
}
