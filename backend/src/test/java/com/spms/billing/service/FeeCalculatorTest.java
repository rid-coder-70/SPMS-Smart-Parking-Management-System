package com.spms.billing.service;

import com.spms.common.enums.VehicleType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for FeeCalculator — no mocks needed (pure function).
 *
 * Pricing:
 *   Base = 50 BDT/hour
 *   MOTORCYCLE = 0.5x, STANDARD = 1.0x, LARGE = 1.5x
 *   Minimum charge = 1 hour
 */
class FeeCalculatorTest {

    private final FeeCalculator calculator = new FeeCalculator();

    @Test
    @DisplayName("1. STANDARD vehicle, 60 minutes → 50.00 BDT")
    void standardOneHour() {
        BigDecimal fee = calculator.calculate(60, VehicleType.STANDARD);
        assertThat(fee).isEqualByComparingTo("50.00");
    }

    @Test
    @DisplayName("2. MOTORCYCLE, 120 minutes → 50.00 BDT (0.5 × 50 × 2)")
    void motorcycleTwoHours() {
        BigDecimal fee = calculator.calculate(120, VehicleType.MOTORCYCLE);
        assertThat(fee).isEqualByComparingTo("50.00");
    }

    @Test
    @DisplayName("3. LARGE vehicle, 90 minutes → 112.50 BDT (1.5 × 50 × 1.5h)")
    void largeNinetyMinutes() {
        BigDecimal fee = calculator.calculate(90, VehicleType.LARGE);
        assertThat(fee).isEqualByComparingTo("112.50");
    }

    @Test
    @DisplayName("4. Duration < 60 minutes → charged minimum 1 hour (STANDARD = 50.00)")
    void minimumOneHourCharge() {
        BigDecimal fee = calculator.calculate(15, VehicleType.STANDARD);
        assertThat(fee).isEqualByComparingTo("50.00");
    }

    @Test
    @DisplayName("5. Zero duration → charged minimum 1 hour")
    void zeroDuration() {
        BigDecimal fee = calculator.calculate(0, VehicleType.STANDARD);
        assertThat(fee).isEqualByComparingTo("50.00");
    }

    @Test
    @DisplayName("6. MOTORCYCLE, 30 minutes → minimum 1 hour × 0.5 = 25.00 BDT")
    void motorcycleUnderMinimum() {
        BigDecimal fee = calculator.calculate(30, VehicleType.MOTORCYCLE);
        assertThat(fee).isEqualByComparingTo("25.00");
    }
}
