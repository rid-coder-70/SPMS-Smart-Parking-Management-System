package com.spms.admin;

import com.spms.admin.dto.PricingConfigDto;
import com.spms.admin.entity.PricingConfig;
import com.spms.admin.repository.PricingConfigRepository;
import com.spms.admin.service.PricingConfigService;
import com.spms.admin.service.ReportingService;
import com.spms.admin.dto.UtilizationReportDto;
import com.spms.billing.entity.Transaction;
import com.spms.billing.repository.TransactionRepository;
import com.spms.parking.repository.ParkingSlotRepository;
import com.spms.reservation.entity.Reservation;
import com.spms.reservation.repository.ReservationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminModuleTests {

    @Mock private PricingConfigRepository pricingConfigRepository;
    @Mock private ReservationRepository reservationRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private ParkingSlotRepository parkingSlotRepository;

    @InjectMocks private PricingConfigService pricingConfigService;
    @InjectMocks private ReportingService reportingService;

    @Test
    void testGetPricingConfig() {
        PricingConfig config = new PricingConfig();
        config.setBaseRate(new BigDecimal("2.00"));
        when(pricingConfigRepository.findAll()).thenReturn(Collections.singletonList(config));

        PricingConfigDto dto = pricingConfigService.get();
        assertEquals(new BigDecimal("2.00"), dto.getBaseRate());
    }

    @Test
    void testUtilizationReportMath() {
        Reservation r1 = new Reservation();
        r1.setStartTime(LocalDateTime.now().minusHours(2));
        r1.setEndTime(LocalDateTime.now().minusHours(1));

        Reservation r2 = new Reservation();
        r2.setStartTime(LocalDateTime.now().minusHours(4));
        r2.setEndTime(LocalDateTime.now().minusHours(2));

        when(reservationRepository.findAll()).thenReturn(Arrays.asList(r1, r2));

        UtilizationReportDto report = reportingService.getUtilizationReport(
                LocalDateTime.now().minusDays(1), LocalDateTime.now(), null);

        assertEquals(2, report.getTotalReservations());
        assertEquals(90.0, report.getAverageDurationMinutes(), 0.01);
    }
}
