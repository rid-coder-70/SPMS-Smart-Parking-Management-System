package com.spms.billing.service;

import com.spms.common.enums.VehicleType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/**
 * Single-responsibility fee calculator.
 *
 * Pricing strategy (from SRS):
 *   Base rate       = 50 BDT per hour
 *   MOTORCYCLE      = base × 0.5
 *   STANDARD        = base × 1.0
 *   LARGE           = base × 1.5
 *   Minimum charge  = 1 hour (anything under 60 minutes is rounded up)
 *
 * This class is stateless and has no side effects — easy to unit test.
 */
@Component
public class FeeCalculator {

    private static final BigDecimal BASE_RATE_PER_HOUR = new BigDecimal("50.00");
    private static final long MINIMUM_BILLABLE_MINUTES = 60L;

    /** Multipliers per vehicle type — adding a new type only requires a new map entry. */
    private static final Map<VehicleType, BigDecimal> MULTIPLIERS = Map.of(
            VehicleType.MOTORCYCLE, new BigDecimal("0.5"),
            VehicleType.STANDARD,   new BigDecimal("1.0"),
            VehicleType.LARGE,      new BigDecimal("1.5")
    );

    /**
     * Calculate the parking fee.
     *
     * @param durationMinutes actual parking duration in minutes
     * @param vehicleType     the type of vehicle
     * @return fee in BDT, rounded to 2 decimal places
     */
    public BigDecimal calculate(long durationMinutes, VehicleType vehicleType) {
        // Enforce minimum charge of 1 hour
        long billableMinutes = Math.max(durationMinutes, MINIMUM_BILLABLE_MINUTES);

        // Convert minutes to hours as a decimal
        BigDecimal hours = BigDecimal.valueOf(billableMinutes)
                .divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);

        BigDecimal multiplier = MULTIPLIERS.getOrDefault(vehicleType, BigDecimal.ONE);

        return BASE_RATE_PER_HOUR
                .multiply(multiplier)
                .multiply(hours)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
