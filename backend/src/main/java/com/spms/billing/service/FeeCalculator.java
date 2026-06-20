package com.spms.billing.service;

import com.spms.common.enums.VehicleType;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class FeeCalculator {

    public static BigDecimal calculate(int durationMinutes, VehicleType vehicleType) {
        if (durationMinutes <= 0) return BigDecimal.ZERO;

        int totalHours = (int) Math.ceil(durationMinutes / 60.0);
        
        int fullDays = totalHours / 24;
        int remainderHours = totalHours % 24;

        BigDecimal baseFee = BigDecimal.ZERO;
        
        baseFee = baseFee.add(new BigDecimal("15.00").multiply(new BigDecimal(fullDays)));

        BigDecimal remainderFee = BigDecimal.ZERO;
        if (remainderHours <= 3) {
            remainderFee = new BigDecimal("2.00").multiply(new BigDecimal(remainderHours));
        } else {
            remainderFee = new BigDecimal("6.00");
            int extraHours = remainderHours - 3;
            remainderFee = remainderFee.add(new BigDecimal("1.50").multiply(new BigDecimal(extraHours)));
        }

        if (remainderFee.compareTo(new BigDecimal("15.00")) > 0) {
            remainderFee = new BigDecimal("15.00");
        }

        baseFee = baseFee.add(remainderFee);

        BigDecimal multiplier = switch (vehicleType) {
            case MOTORCYCLE -> new BigDecimal("0.5");
            case LARGE -> new BigDecimal("1.5");
            default -> new BigDecimal("1.0");
        };

        return baseFee.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
    }
}
