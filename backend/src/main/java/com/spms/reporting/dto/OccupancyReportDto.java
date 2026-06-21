package com.spms.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Occupancy snapshot for a single parking lot. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyReportDto {

    private Long lotId;
    private String lotName;
    private int totalCapacity;
    private long occupiedSlots;
    private long availableSlots;
    private double occupancyPercent;
}
