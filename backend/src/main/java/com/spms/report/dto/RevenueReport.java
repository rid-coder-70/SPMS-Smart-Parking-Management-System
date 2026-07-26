package com.spms.report.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RevenueReport {
    private BigDecimal totalRevenue;
    private long totalTransactions;
    private BigDecimal avgTransactionValue;
    private Map<String, BigDecimal> dailyRevenue;
}
