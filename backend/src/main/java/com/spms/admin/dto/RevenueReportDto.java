package com.spms.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class RevenueReportDto {
    private String period;
    private BigDecimal totalRevenue;
}
