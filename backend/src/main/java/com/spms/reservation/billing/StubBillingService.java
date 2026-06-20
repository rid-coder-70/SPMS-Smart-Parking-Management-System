package com.spms.reservation.billing;

import com.spms.common.enums.VehicleType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Stub implementation of BillingService.
 *
 * Active only when no other BillingService bean is present in the context
 * (i.e., when the Billing module teammate hasn't provided their implementation yet).
 *
 * Computes a simple flat rate so the system is functional end-to-end for testing:
 *   MOTORCYCLE  → $2.00 / 30 min
 *   STANDARD    → $3.00 / 30 min
 *   LARGE       → $4.00 / 30 min
 *
 * The Billing teammate's @Service will take precedence once added, because
 * Spring will then have a primary candidate and this @ConditionalOnMissingBean
 * bean will not be registered.
 */
@Slf4j
@Service
@ConditionalOnMissingBean(name = "billingServiceImpl")
public class StubBillingService implements BillingService {

    @Override
    public TransactionResult processCheckout(
            Long reservationId,
            LocalDateTime checkInTime,
            LocalDateTime checkOutTime,
            VehicleType vehicleType) {

        long minutes = Duration.between(checkInTime, checkOutTime).toMinutes();
        long halfHours = Math.max(1, (minutes + 29) / 30); // ceiling to nearest 30 min

        BigDecimal ratePerHalfHour = switch (vehicleType) {
            case MOTORCYCLE -> new BigDecimal("2.00");
            case LARGE      -> new BigDecimal("4.00");
            default         -> new BigDecimal("3.00"); // STANDARD
        };

        BigDecimal fee = ratePerHalfHour.multiply(BigDecimal.valueOf(halfHours));
        Long receiptId = System.currentTimeMillis(); // placeholder receipt ID

        log.info("[StubBilling] reservationId={} duration={}min fee={} receiptId={}",
                reservationId, minutes, fee, receiptId);

        return new TransactionResult(fee, receiptId);
    }
}
