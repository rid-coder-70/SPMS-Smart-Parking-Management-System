package com.spms.billing.service;

import com.spms.billing.entity.PricingConfig;
import com.spms.billing.repository.PricingConfigRepository;
import com.spms.common.enums.VehicleType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock
    private PricingConfigRepository pricingConfigRepository;

    @InjectMocks
    private BillingService billingService;

    private PricingConfig config;

    @BeforeEach
    void setUp() {
        config = PricingConfig.builder()
                .baseHourlyRate(new BigDecimal("40.00"))
                .extendedHourlyRate(new BigDecimal("30.00"))
                .baseHoursThreshold(3)
                .dailyMaxCap(new BigDecimal("300.00"))
                .motorcycleMultiplier(new BigDecimal("0.50"))
                .standardMultiplier(new BigDecimal("1.00"))
                .largeMultiplier(new BigDecimal("1.50"))
                .build();
    }

    @Test
    @DisplayName("1 hour standard vehicle: ৳40")
    void testStandardOneHour() {
        when(pricingConfigRepository.getActive()).thenReturn(config);

        LocalDateTime now = LocalDateTime.now();
        var result = billingService.calculateFee(now, now.plusHours(1), VehicleType.STANDARD);

        assertEquals(new BigDecimal("40.00"), result.totalFee());
        assertEquals(1, result.billedHours());
    }

    @Test
    @DisplayName("3 hours motorcycle: ৳60 (40 * 3 * 0.5)")
    void testMotorcycleThreeHours() {
        when(pricingConfigRepository.getActive()).thenReturn(config);

        LocalDateTime now = LocalDateTime.now();
        var result = billingService.calculateFee(now, now.plusHours(3), VehicleType.MOTORCYCLE);

        assertEquals(new BigDecimal("60.00"), result.totalFee());
        assertEquals(3, result.billedHours());
    }

    @Test
    @DisplayName("5 hours large vehicle: (120 + 60) * 1.5 = ৳270")
    void testLargeFiveHours() {
        when(pricingConfigRepository.getActive()).thenReturn(config);

        LocalDateTime now = LocalDateTime.now();
        var result = billingService.calculateFee(now, now.plusHours(5), VehicleType.LARGE);

        assertEquals(new BigDecimal("270.00"), result.totalFee());
        assertEquals(5, result.billedHours());
    }

    @Test
    @DisplayName("25 hours standard vehicle: capped at ৳300 daily cap")
    void testDailyCap() {
        when(pricingConfigRepository.getActive()).thenReturn(config);

        LocalDateTime now = LocalDateTime.now();
        var result = billingService.calculateFee(now, now.plusHours(25), VehicleType.STANDARD);

        assertEquals(new BigDecimal("340.00"), result.totalFee());
    }

    @Test
    @DisplayName("Partial hour rounds up: 2 hours 15 mins -> 3 hours = ৳120")
    void testPartialHourRounding() {
        when(pricingConfigRepository.getActive()).thenReturn(config);

        LocalDateTime now = LocalDateTime.now();
        var result = billingService.calculateFee(now, now.plusHours(2).plusMinutes(15), VehicleType.STANDARD);

        assertEquals(new BigDecimal("120.00"), result.totalFee());
        assertEquals(3, result.billedHours());
    }
}
