package com.spms.billing.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "pricing_config")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PricingConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal baseHourlyRate = new BigDecimal("40.00");

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal extendedHourlyRate = new BigDecimal("30.00");

    @Column(nullable = false)
    @Builder.Default
    private int baseHoursThreshold = 3;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal dailyMaxCap = new BigDecimal("300.00");

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal motorcycleMultiplier = new BigDecimal("0.50");

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal standardMultiplier = new BigDecimal("1.00");

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal largeMultiplier = new BigDecimal("1.50");
}
