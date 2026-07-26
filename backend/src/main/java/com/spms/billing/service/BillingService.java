package com.spms.billing.service;

import com.spms.billing.entity.PricingConfig;
import com.spms.billing.repository.PricingConfigRepository;
import com.spms.common.enums.VehicleType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final PricingConfigRepository pricingConfigRepository;

    public FeeBreakdown calculateFee(LocalDateTime checkIn, LocalDateTime checkOut, VehicleType vehicleType) {
        PricingConfig config = pricingConfigRepository.getActive();

        int totalMinutes = (int) Duration.between(checkIn, checkOut).toMinutes();
        int billedHours = (int) Math.ceil(totalMinutes / 60.0);
        if (billedHours < 1) billedHours = 1;

        int baseHours = Math.min(billedHours, config.getBaseHoursThreshold());
        int extendedHours = Math.max(0, billedHours - config.getBaseHoursThreshold());

        BigDecimal baseCost = config.getBaseHourlyRate().multiply(BigDecimal.valueOf(baseHours));
        BigDecimal extendedCost = config.getExtendedHourlyRate().multiply(BigDecimal.valueOf(extendedHours));
        BigDecimal subtotal = baseCost.add(extendedCost);

        BigDecimal multiplier = getMultiplier(config, vehicleType);
        BigDecimal withMultiplier = subtotal.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);

        int fullDays = billedHours / 24;
        int remainderHours = billedHours % 24;

        BigDecimal dailyCapTotal = config.getDailyMaxCap().multiply(multiplier)
                .setScale(2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(fullDays));

        BigDecimal remainderBase = Math.min(remainderHours, config.getBaseHoursThreshold()) > 0
                ? config.getBaseHourlyRate().multiply(BigDecimal.valueOf(Math.min(remainderHours, config.getBaseHoursThreshold())))
                : BigDecimal.ZERO;
        BigDecimal remainderExtended = Math.max(0, remainderHours - config.getBaseHoursThreshold()) > 0
                ? config.getExtendedHourlyRate().multiply(BigDecimal.valueOf(Math.max(0, remainderHours - config.getBaseHoursThreshold())))
                : BigDecimal.ZERO;
        BigDecimal remainderCost = remainderBase.add(remainderExtended).multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
        BigDecimal remainderCapped = remainderCost.min(config.getDailyMaxCap().multiply(multiplier).setScale(2, RoundingMode.HALF_UP));

        BigDecimal totalFee;
        if (fullDays > 0) {
            totalFee = dailyCapTotal.add(remainderCapped);
        } else {
            BigDecimal singleDayCap = config.getDailyMaxCap().multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
            totalFee = withMultiplier.min(singleDayCap);
        }

        return new FeeBreakdown(
                totalMinutes, billedHours,
                config.getBaseHourlyRate(), config.getExtendedHourlyRate(),
                multiplier, withMultiplier, config.getDailyMaxCap(),
                totalFee.setScale(2, RoundingMode.HALF_UP)
        );
    }

    private BigDecimal getMultiplier(PricingConfig config, VehicleType type) {
        if (type == null) return config.getStandardMultiplier();
        return switch (type) {
            case MOTORCYCLE -> config.getMotorcycleMultiplier();
            case LARGE -> config.getLargeMultiplier();
            default -> config.getStandardMultiplier();
        };
    }

    public record FeeBreakdown(
            int durationMinutes,
            int billedHours,
            BigDecimal baseRate,
            BigDecimal extendedRate,
            BigDecimal vehicleMultiplier,
            BigDecimal subtotal,
            BigDecimal dailyCap,
            BigDecimal totalFee
    ) {}
}
