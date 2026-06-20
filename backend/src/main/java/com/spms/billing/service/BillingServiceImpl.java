package com.spms.billing.service;

import com.spms.common.enums.PaymentStatus;
import com.spms.common.enums.VehicleType;
import com.spms.billing.entity.Payment;
import com.spms.billing.entity.Transaction;
import com.spms.billing.repository.PaymentRepository;
import com.spms.billing.repository.TransactionRepository;
import com.spms.reservation.BillingService;
import com.spms.reservation.TransactionResult;
import com.spms.auth.entity.User;
import com.spms.reservation.entity.Reservation;
import com.spms.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {

    private final TransactionRepository transactionRepository;
    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;

    @Override
    @Transactional
    public TransactionResult processCheckout(Long reservationId, LocalDateTime checkInTime, LocalDateTime checkOutTime, VehicleType vehicleType) {
        Reservation res = reservationRepository.findById(reservationId).orElseThrow();
        
        int durationMinutes = (int) Duration.between(checkInTime, checkOutTime).toMinutes();
        if (durationMinutes < 0) durationMinutes = 0;

        BigDecimal fee = FeeCalculator.calculate(durationMinutes, vehicleType);

        Transaction tx = Transaction.builder()
                .reservationId(reservationId)
                .userId(res.getUserId())
                .checkInTime(checkInTime)
                .checkOutTime(checkOutTime)
                .durationMinutes(durationMinutes)
                .totalFee(fee)
                .paymentStatus(PaymentStatus.PENDING)
                .build();
        
        tx = transactionRepository.save(tx);

        Payment payment = Payment.builder()
                .transactionId(tx.getId())
                .amount(fee)
                .paymentStatus(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        return new TransactionResult(fee, tx.getId());
    }
}
