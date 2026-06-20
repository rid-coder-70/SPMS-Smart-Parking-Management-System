package com.spms.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UtilizationReportDto {
    private Long lotId;
    private Long totalReservations;
    private Double occupancyRatePercent;
    private Double averageDurationMinutes;
}
