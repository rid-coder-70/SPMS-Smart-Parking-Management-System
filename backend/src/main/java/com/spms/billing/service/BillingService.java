package com.spms.billing.service;

import com.spms.billing.dto.TransactionDto;
import com.spms.billing.entity.Transaction;
import com.spms.billing.repository.TransactionRepository;
import com.spms.common.enums.PaymentStatus;
import com.spms.common.enums.ReservationStatus;
import com.spms.common.enums.SlotStatus;
import com.spms.common.exception.SpmsException;
import com.spms.parking.entity.ParkingSlot;
import com.spms.parking.service.ParkingSlotService;
import com.spms.reservation.entity.Reservation;
import com.spms.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Billing service — check-in, check-out, and fee computation.
 *
 * Check-in:  reservation must be CONFIRMED → creates Transaction, slot → OCCUPIED.
 * Check-out: computes duration and fee via FeeCalculator, slot → AVAILABLE.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BillingService {

    private final TransactionRepository  transactionRepository;
    private final ReservationRepository  reservationRepository;
    private final ParkingSlotService     parkingSlotService;
    private final FeeCalculator          feeCalculator;

    // ── Check-In ──────────────────────────────────────────────

    @Transactional
    public TransactionDto checkIn(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> SpmsException.notFound("Reservation", reservationId));

        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new SpmsException(
                    "Only CONFIRMED reservations can be checked in (current: " + reservation.getStatus() + ")",
                    HttpStatus.BAD_REQUEST);
        }

        if (transactionRepository.existsByReservationId(reservationId)) {
            throw new SpmsException("Check-in already recorded for this reservation", HttpStatus.CONFLICT);
        }

        Transaction transaction = Transaction.builder()
                .reservation(reservation)
                .checkInTime(LocalDateTime.now())
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        transaction = transactionRepository.save(transaction);

        // Slot transitions from RESERVED → OCCUPIED
        parkingSlotService.updateSlotStatus(reservation.getParkingSlot().getId(), SlotStatus.OCCUPIED);

        log.info("Check-in recorded: transactionId={}, reservationId={}", transaction.getId(), reservationId);
        return mapToDto(transaction);
    }

    // ── Check-Out ─────────────────────────────────────────────

    @Transactional
    public TransactionDto checkOut(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> SpmsException.notFound("Transaction", transactionId));

        if (transaction.getCheckOutTime() != null) {
            throw new SpmsException("Vehicle has already checked out", HttpStatus.BAD_REQUEST);
        }

        LocalDateTime checkOutTime = LocalDateTime.now();
        long durationMinutes = Duration.between(transaction.getCheckInTime(), checkOutTime).toMinutes();

        // Determine vehicle type from the slot
        ParkingSlot slot = transaction.getReservation().getParkingSlot();
        BigDecimal fee = feeCalculator.calculate(durationMinutes, slot.getSlotType());

        transaction.setCheckOutTime(checkOutTime);
        transaction.setDurationMinutes(durationMinutes);
        transaction.setAmount(fee);
        transaction.setPaymentStatus(PaymentStatus.PAID);
        transactionRepository.save(transaction);

        // Mark reservation as COMPLETED
        Reservation reservation = transaction.getReservation();
        reservation.setStatus(ReservationStatus.COMPLETED);
        reservationRepository.save(reservation);

        // Release slot back to AVAILABLE
        parkingSlotService.updateSlotStatus(slot.getId(), SlotStatus.AVAILABLE);

        log.info("Check-out completed: transactionId={}, duration={}min, fee={}",
                transaction.getId(), durationMinutes, fee);
        return mapToDto(transaction);
    }

    // ── Query Methods ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public TransactionDto getTransactionById(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> SpmsException.notFound("Transaction", transactionId));
        return mapToDto(transaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getUserTransactions(Long userId) {
        return transactionRepository.findByUserId(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // ── Mapping ───────────────────────────────────────────────

    private TransactionDto mapToDto(Transaction t) {
        Reservation res = t.getReservation();
        ParkingSlot slot = res.getParkingSlot();

        return TransactionDto.builder()
                .id(t.getId())
                .reservationId(res.getId())
                .userId(res.getUserId())
                .slotNumber(slot.getSlotNumber())
                .lotName(slot.getParkingLot().getLotName())
                .checkInTime(t.getCheckInTime())
                .checkOutTime(t.getCheckOutTime())
                .durationMinutes(t.getDurationMinutes())
                .amount(t.getAmount())
                .paymentStatus(t.getPaymentStatus())
                .createdDate(t.getCreatedDate())
                .build();
    }
}
