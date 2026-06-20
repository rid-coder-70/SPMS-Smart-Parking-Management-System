package com.spms.billing;

import com.spms.billing.service.FeeCalculator;
import com.spms.common.enums.VehicleType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class FeeCalculatorTests {

    @Test
    void testExactlyOneHourStandard() {
        assertEquals(new BigDecimal("2.00"), FeeCalculator.calculate(60, VehicleType.STANDARD));
    }

    @Test
    void testThreeHoursStandard() {
        assertEquals(new BigDecimal("6.00"), FeeCalculator.calculate(180, VehicleType.STANDARD));
    }

    @Test
    void testFourHoursStandard() {
        assertEquals(new BigDecimal("7.50"), FeeCalculator.calculate(240, VehicleType.STANDARD));
    }

    @Test
    void testSixtyOneMinutesStandard() {
        assertEquals(new BigDecimal("4.00"), FeeCalculator.calculate(61, VehicleType.STANDARD));
    }

    @Test
    void testTwoHourMotorcycle() {
        assertEquals(new BigDecimal("2.00"), FeeCalculator.calculate(120, VehicleType.MOTORCYCLE));
    }

    @Test
    void testTwoHourLarge() {
        assertEquals(new BigDecimal("6.00"), FeeCalculator.calculate(120, VehicleType.LARGE));
    }

    @Test
    void testTenHourStandardHitsCap() {
        assertEquals(new BigDecimal("15.00"), FeeCalculator.calculate(600, VehicleType.STANDARD));
    }

    @Test
    void testThirtyHourStandard() {
        assertEquals(new BigDecimal("25.50"), FeeCalculator.calculate(1800, VehicleType.STANDARD));
    }
}
