package com.spms.billing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PricingConfigDto {

    private Long id;

    @NotNull @DecimalMin("1.00")
    private BigDecimal baseHourlyRate;

    @NotNull @DecimalMin("1.00")
    private BigDecimal extendedHourlyRate;

    @NotNull @Min(1)
    private Integer baseHoursThreshold;

    @NotNull @DecimalMin("1.00")
    private BigDecimal dailyMaxCap;

    @NotNull @DecimalMin("0.01")
    private BigDecimal motorcycleMultiplier;

    @NotNull @DecimalMin("0.01")
    private BigDecimal standardMultiplier;

    @NotNull @DecimalMin("0.01")
    private BigDecimal largeMultiplier;
}
