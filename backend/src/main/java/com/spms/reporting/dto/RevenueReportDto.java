package com.spms.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Revenue report summary for a date range. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueReportDto {

    private BigDecimal totalRevenue;
    private long totalTransactions;
    private BigDecimal averageFee;
    private LocalDate fromDate;
    private LocalDate toDate;
}
