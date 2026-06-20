package com.spms.admin.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PricingConfigDto {
    private BigDecimal baseRate;
    private BigDecimal extendedRate;
    private BigDecimal dailyCap;
    private BigDecimal motorcycleMultiplier;
    private BigDecimal largeMultiplier;
}
