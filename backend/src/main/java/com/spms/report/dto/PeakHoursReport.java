package com.spms.report.dto;

import lombok.*;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PeakHoursReport {
    private Map<Integer, Long> hourlyDistribution;
    private Map<String, Long> dayOfWeekDistribution;
    private int peakHour;
    private String peakDay;
}
