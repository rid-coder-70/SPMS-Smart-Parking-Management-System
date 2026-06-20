package com.spms.reservation;

import com.spms.common.enums.VehicleType;
import java.time.LocalDateTime;

public interface BillingService {
    TransactionResult processCheckout(Long reservationId, LocalDateTime checkInTime, LocalDateTime checkOutTime, VehicleType vehicleType);
}
