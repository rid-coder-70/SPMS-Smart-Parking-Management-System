package com.spms.reservation.billing;

import com.spms.common.enums.VehicleType;

import java.time.LocalDateTime;

/**
 * Contract between the Reservation module and the Billing module.
 *
 * ReservationService depends on this interface only — it does NOT implement it.
 * The Billing teammate provides a {@code @Service} implementation in
 * {@code com.spms.billing}. Spring autowires the concrete bean at runtime.
 *
 * If Billing is not yet deployed, a {@code @Primary} stub can be registered
 * in a Spring @Configuration or test @MockBean to unblock development.
 */
public interface BillingService {

    /**
     * Processes checkout for a completed reservation.
     *
     * @param reservationId the reservation that is being checked out
     * @param checkInTime   the time the user checked in (from Reservation entity)
     * @param checkOutTime  now — the current server time at checkout
     * @param vehicleType   the user's vehicle type (determines rate tier)
     * @return a {@link TransactionResult} containing the fee and receipt ID
     */
    TransactionResult processCheckout(
            Long reservationId,
            LocalDateTime checkInTime,
            LocalDateTime checkOutTime,
            VehicleType vehicleType
    );
}
