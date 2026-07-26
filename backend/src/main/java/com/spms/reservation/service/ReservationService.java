package com.spms.reservation.service;

import com.spms.billing.dto.CheckOutResponse;
import com.spms.billing.entity.Payment;
import com.spms.billing.entity.Transaction;
import com.spms.billing.repository.PaymentRepository;
import com.spms.billing.repository.TransactionRepository;
import com.spms.billing.service.BillingService;
import com.spms.common.enums.PaymentStatus;
import com.spms.common.enums.ReservationStatus;
import com.spms.common.enums.SlotStatus;
import com.spms.common.enums.VehicleType;
import com.spms.common.exception.SpmsException;
import com.spms.parking.entity.ParkingSlot;
import com.spms.parking.repository.ParkingSlotRepository;
import com.spms.parking.service.ParkingSlotService;
import com.spms.reservation.dto.CancelResponse;
import com.spms.reservation.dto.CreateReservationRequest;
import com.spms.reservation.dto.ReservationDto;
import com.spms.reservation.entity.Reservation;
import com.spms.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {

    private static final int MAX_ADVANCE_DAYS = 30;
    private static final int MIN_DURATION_MINUTES = 30;
    private static final int NO_SHOW_GRACE_MINUTES = 30;

    private static final List<ReservationStatus> ACTIVE_STATUSES =
            List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED);

    private final ReservationRepository reservationRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final ParkingSlotService parkingSlotService;
    private final BillingService billingService;
    private final TransactionRepository transactionRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public ReservationDto createReservation(Long userId, CreateReservationRequest req) {
        validateTimeWindow(req.getStartTime(), req.getEndTime());

        ParkingSlot slot = parkingSlotRepository.findById(req.getSlotId())
                .orElseThrow(() -> SpmsException.notFound("ParkingSlot", req.getSlotId()));

        if (slot.getStatus() != SlotStatus.AVAILABLE && slot.getStatus() != SlotStatus.RESERVED) {
            throw new SpmsException(
                    "Slot '" + slot.getSlotNumber() + "' is currently " + slot.getStatus(),
                    HttpStatus.CONFLICT);
        }

        boolean hasOverlap = reservationRepository.existsOverlapping(
                slot.getId(), req.getStartTime(), req.getEndTime(), ACTIVE_STATUSES);

        if (hasOverlap) {
            throw new SpmsException(
                    "Slot '" + slot.getSlotNumber() + "' is already reserved for the requested time window",
                    HttpStatus.CONFLICT);
        }

        List<Reservation> existingInLot = reservationRepository.findActiveByUserAndLot(userId, slot.getParkingLot().getId());
        if (!existingInLot.isEmpty()) {
            throw SpmsException.conflict("You already have an active reservation in this parking lot.");
        }

        Reservation reservation = Reservation.builder()
                .userId(userId)
                .parkingSlot(slot)
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .status(ReservationStatus.PENDING)
                .vehicleNumber(req.getVehicleNumber())
                .build();

        reservation = reservationRepository.save(reservation);

        if (slot.getStatus() == SlotStatus.AVAILABLE) {
            parkingSlotService.updateSlotStatus(slot.getId(), SlotStatus.RESERVED);
        }

        log.info("Reservation created: id={}, userId={}, slotId={}", reservation.getId(), userId, slot.getId());
        return mapToDto(reservation);
    }

    @Transactional
    public ReservationDto checkIn(Long reservationId, Long userId) {
        Reservation reservation = findOwnedReservation(reservationId, userId);

        if (reservation.getStatus() != ReservationStatus.PENDING && reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw SpmsException.badRequest("Cannot check in — reservation status is " + reservation.getStatus());
        }

        if (reservation.getCheckInTime() != null) {
            throw SpmsException.badRequest("Already checked in");
        }

        reservation.setCheckInTime(LocalDateTime.now());
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservationRepository.save(reservation);

        parkingSlotService.updateSlotStatus(reservation.getParkingSlot().getId(), SlotStatus.OCCUPIED);

        log.info("Check-in: reservationId={}, userId={}", reservationId, userId);
        return mapToDto(reservation);
    }

    @Transactional
    public CheckOutResponse checkOut(Long reservationId, Long userId) {
        Reservation reservation = findOwnedReservation(reservationId, userId);

        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw SpmsException.badRequest("Cannot check out — reservation status is " + reservation.getStatus());
        }

        if (reservation.getCheckInTime() == null) {
            throw SpmsException.badRequest("Cannot check out without checking in first");
        }

        LocalDateTime now = LocalDateTime.now();
        reservation.setCheckOutTime(now);
        reservation.setStatus(ReservationStatus.COMPLETED);
        reservationRepository.save(reservation);

        ParkingSlot slot = reservation.getParkingSlot();
        VehicleType vehicleType = slot.getSlotType();
        BillingService.FeeBreakdown fee = billingService.calculateFee(reservation.getCheckInTime(), now, vehicleType);

        Transaction txn = Transaction.builder()
                .reservationId(reservationId)
                .userId(userId)
                .slotId(slot.getId())
                .checkInTime(reservation.getCheckInTime())
                .checkOutTime(now)
                .durationMinutes(fee.durationMinutes())
                .totalFee(fee.totalFee())
                .paymentStatus(PaymentStatus.PAID)
                .vehicleType(vehicleType != null ? vehicleType.name() : "STANDARD")
                .vehicleNumber(reservation.getVehicleNumber())
                .build();
        txn = transactionRepository.save(txn);

        Payment payment = Payment.builder()
                .transactionId(txn.getId())
                .amount(fee.totalFee())
                .paymentStatus(PaymentStatus.PAID)
                .build();
        paymentRepository.save(payment);

        parkingSlotService.updateSlotStatus(slot.getId(), SlotStatus.AVAILABLE);

        log.info("Check-out: reservationId={}, fee={}", reservationId, fee.totalFee());

        return CheckOutResponse.builder()
                .reservationId(reservationId)
                .transactionId(txn.getId())
                .slotNumber(slot.getSlotNumber())
                .lotName(slot.getParkingLot().getLotName())
                .vehicleNumber(reservation.getVehicleNumber())
                .vehicleType(vehicleType != null ? vehicleType.name() : "STANDARD")
                .checkInTime(reservation.getCheckInTime())
                .checkOutTime(now)
                .durationMinutes(fee.durationMinutes())
                .billedHours(fee.billedHours())
                .baseRate(fee.baseRate())
                .extendedRate(fee.extendedRate())
                .vehicleMultiplier(fee.vehicleMultiplier())
                .subtotal(fee.subtotal())
                .dailyCap(fee.dailyCap())
                .totalFee(fee.totalFee())
                .currency("BDT")
                .build();
    }

    @Transactional
    public CancelResponse cancelReservation(Long reservationId, Long userId) {
        Reservation reservation = findOwnedReservation(reservationId, userId);
        return doCancellation(reservation);
    }

    @Transactional
    public CancelResponse adminCancelReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> SpmsException.notFound("Reservation", reservationId));
        return doCancellation(reservation);
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getHistoryForUser(Long userId) {
        return reservationRepository.findByUserIdOrderByCreatedDateDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReservationDto getById(Long reservationId, Long userId) {
        return mapToDto(findOwnedReservation(reservationId, userId));
    }

    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void markNoShows() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(NO_SHOW_GRACE_MINUTES);
        List<Reservation> noShows = reservationRepository.findPendingNoShows(cutoff);

        for (Reservation r : noShows) {
            r.setStatus(ReservationStatus.NO_SHOW);
            reservationRepository.save(r);
            parkingSlotService.updateSlotStatus(r.getParkingSlot().getId(), SlotStatus.AVAILABLE);
            log.info("Reservation {} marked NO_SHOW", r.getId());
        }
    }

    private CancelResponse doCancellation(Reservation reservation) {
        if (reservation.getStatus() != ReservationStatus.PENDING && reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw SpmsException.badRequest("Cannot cancel a reservation with status: " + reservation.getStatus());
        }

        LocalDateTime now = LocalDateTime.now();
        boolean feeApplied = !now.plusMinutes(60).isBefore(reservation.getStartTime());

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        parkingSlotService.updateSlotStatus(reservation.getParkingSlot().getId(), SlotStatus.AVAILABLE);

        log.info("Reservation cancelled: id={}", reservation.getId());
        return CancelResponse.builder().cancelled(true).feeApplied(feeApplied).build();
    }

    private void validateTimeWindow(LocalDateTime start, LocalDateTime end) {
        if (!end.isAfter(start)) {
            throw SpmsException.badRequest("End time must be after start time");
        }
        if (!start.isAfter(LocalDateTime.now())) {
            throw SpmsException.badRequest("Start time must be in the future");
        }
        long daysAhead = ChronoUnit.DAYS.between(LocalDateTime.now(), start);
        if (daysAhead > MAX_ADVANCE_DAYS) {
            throw SpmsException.badRequest("Reservations can only be made up to " + MAX_ADVANCE_DAYS + " days in advance");
        }
        long duration = ChronoUnit.MINUTES.between(start, end);
        if (duration < MIN_DURATION_MINUTES) {
            throw SpmsException.badRequest("Duration must be at least " + MIN_DURATION_MINUTES + " minutes");
        }
    }

    private Reservation findOwnedReservation(Long reservationId, Long userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> SpmsException.notFound("Reservation", reservationId));

        if (!reservation.getUserId().equals(userId)) {
            throw new SpmsException("Access denied: reservation does not belong to you.", HttpStatus.FORBIDDEN);
        }
        return reservation;
    }

    private ReservationDto mapToDto(Reservation r) {
        ParkingSlot slot = r.getParkingSlot();
        Transaction txn = transactionRepository.findByReservationId(r.getId()).orElse(null);
        return ReservationDto.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .slotId(slot.getId())
                .slotNumber(slot.getSlotNumber())
                .lotName(slot.getParkingLot().getLotName())
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .checkInTime(r.getCheckInTime())
                .checkOutTime(r.getCheckOutTime())
                .status(r.getStatus())
                .vehicleNumber(r.getVehicleNumber())
                .vehicleType(slot.getSlotType() != null ? slot.getSlotType().name() : null)
                .totalFee(txn != null ? txn.getTotalFee() : null)
                .createdDate(r.getCreatedDate())
                .build();
    }
}
