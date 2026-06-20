package com.spms.reservation.service;

import com.spms.auth.entity.User;
import com.spms.auth.repository.UserRepository;
import com.spms.common.enums.ReservationStatus;
import com.spms.common.enums.SlotStatus;
import com.spms.common.exception.SpmsException;
import com.spms.parking.repository.ParkingSlotRepository;
import com.spms.parking.service.ParkingSlotService;
import com.spms.reservation.billing.BillingService;
import com.spms.reservation.billing.TransactionResult;
import com.spms.reservation.dto.*;
import com.spms.reservation.entity.Reservation;
import com.spms.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core Reservation Service implementing all booking lifecycle operations:
 * create → check-in → check-out / cancel, plus scheduled no-show cleanup.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository    reservationRepository;
    private final ParkingSlotService       parkingSlotService;
    private final ParkingSlotRepository    parkingSlotRepository;
    private final UserRepository           userRepository;
    private final BillingService           billingService;

    // ── Create ────────────────────────────────────────────────────────────────

    /**
     * Creates a reservation after enforcing:
     * <ul>
     *   <li>durationMinutes ≥ 30 and divisible by 30</li>
     *   <li>startTime within the next 30 days</li>
     *   <li>No overlapping active reservation on the same slot</li>
     *   <li>User has no active reservation in the same lot</li>
     * </ul>
     */
    @Transactional
    public ReservationDto createReservation(Long userId, CreateReservationRequest request) {

        // ── Validate duration ────────────────────────────────────────────────
        int duration = request.getDurationMinutes();
        if (duration < 30 || duration % 30 != 0) {
            throw SpmsException.badRequest(
                    "durationMinutes must be ≥ 30 and divisible by 30, got: " + duration);
        }

        // ── Validate startTime is within the next 30 days ────────────────────
        LocalDateTime now   = LocalDateTime.now();
        LocalDateTime limit = now.plusDays(30);
        LocalDateTime start = request.getStartTime();
        LocalDateTime end   = start.plusMinutes(duration);

        if (start.isAfter(limit)) {
            throw SpmsException.badRequest(
                    "startTime must be within the next 30 days.");
        }

        // ── Check for slot-level overlap ─────────────────────────────────────
        List<Reservation> overlapping = reservationRepository.findOverlapping(
                request.getSlotId(), start, end);
        if (!overlapping.isEmpty()) {
            throw SpmsException.conflict(
                    "Slot " + request.getSlotId() + " is already reserved during the requested time window.");
        }

        // ── Check one-active-reservation-per-lot rule ────────────────────────
        Long lotId = parkingSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> SpmsException.notFound("ParkingSlot", request.getSlotId()))
                .getParkingLot()
                .getId();

        List<Long> slotIdsInLot = parkingSlotRepository.findByParkingLotId(lotId)
                .stream().map(s -> s.getId()).collect(Collectors.toList());

        List<Reservation> existingInLot = reservationRepository
                .findActiveByUserAndLot(userId, slotIdsInLot);
        if (!existingInLot.isEmpty()) {
            throw SpmsException.conflict(
                    "You already have an active reservation in this parking lot.");
        }

        // ── Create & persist ─────────────────────────────────────────────────
        Reservation reservation = Reservation.builder()
                .userId(userId)
                .slotId(request.getSlotId())
                .startTime(start)
                .endTime(end)
                .status(ReservationStatus.PENDING)
                .build();

        reservation = reservationRepository.save(reservation);

        // Mark the slot as RESERVED
        parkingSlotService.updateSlotStatus(request.getSlotId(), SlotStatus.RESERVED);

        log.info("Reservation {} created: userId={}, slotId={}, window=[{},{}]",
                reservation.getId(), userId, request.getSlotId(), start, end);

        return mapToDto(reservation);
    }

    // ── Cancel ────────────────────────────────────────────────────────────────

    /**
     * Cancels a reservation.
     * If more than 60 minutes remain until start → no fee.
     * Otherwise → fee flagged (Billing module computes the amount).
     */
    @Transactional
    public CancelResponse cancelReservation(Long reservationId, Long userId) {
        Reservation reservation = findOwnedReservation(reservationId, userId);

        if (reservation.getStatus() == ReservationStatus.CANCELLED
                || reservation.getStatus() == ReservationStatus.COMPLETED
                || reservation.getStatus() == ReservationStatus.NO_SHOW) {
            throw SpmsException.badRequest(
                    "Cannot cancel a reservation with status: " + reservation.getStatus());
        }

        LocalDateTime now = LocalDateTime.now();
        boolean feeApplied = !now.plusMinutes(60).isBefore(reservation.getStartTime());

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        // Free the slot
        parkingSlotService.updateSlotStatus(reservation.getSlotId(), SlotStatus.AVAILABLE);

        log.info("Reservation {} cancelled: userId={}, feeApplied={}", reservationId, userId, feeApplied);
        return CancelResponse.builder()
                .cancelled(true)
                .feeApplied(feeApplied)
                .build();
    }

    // ── Check-In ──────────────────────────────────────────────────────────────

    /**
     * Check in to a PENDING reservation.
     * Valid only if current time is within [startTime, startTime + 30 min].
     */
    @Transactional
    public ReservationDto checkIn(Long reservationId, Long userId) {
        Reservation reservation = findOwnedReservation(reservationId, userId);

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw SpmsException.badRequest(
                    "Check-in is only allowed for PENDING reservations. Current status: "
                            + reservation.getStatus());
        }

        LocalDateTime now            = LocalDateTime.now();
        LocalDateTime checkInDeadline = reservation.getStartTime().plusMinutes(30);

        if (now.isBefore(reservation.getStartTime())) {
            throw SpmsException.badRequest(
                    "Check-in window has not opened yet. Start time: " + reservation.getStartTime());
        }
        if (now.isAfter(checkInDeadline)) {
            throw SpmsException.conflict(
                    "Check-in window has closed (must check in within 30 minutes of start time).");
        }

        reservation.setCheckInTime(now);
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservationRepository.save(reservation);

        parkingSlotService.updateSlotStatus(reservation.getSlotId(), SlotStatus.OCCUPIED);

        log.info("Reservation {} checked in: userId={}, checkInTime={}", reservationId, userId, now);
        return mapToDto(reservation);
    }

    // ── Check-Out ─────────────────────────────────────────────────────────────

    /**
     * Check out from a CONFIRMED reservation.
     * Calls BillingService to compute the fee, then completes the reservation
     * and frees the slot.
     */
    @Transactional
    public CheckOutResponse checkOut(Long reservationId, Long userId) {
        Reservation reservation = findOwnedReservation(reservationId, userId);

        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw SpmsException.badRequest(
                    "Check-out requires CONFIRMED status. Current status: " + reservation.getStatus());
        }

        // Fetch user's vehicleType for billing rate calculation
        User user = userRepository.findById(userId)
                .orElseThrow(() -> SpmsException.notFound("User", userId));

        LocalDateTime checkOutTime = LocalDateTime.now();

        // Delegate fee computation to Billing module
        TransactionResult result = billingService.processCheckout(
                reservationId,
                reservation.getCheckInTime(),
                checkOutTime,
                user.getVehicleType()
        );

        reservation.setStatus(ReservationStatus.COMPLETED);
        reservationRepository.save(reservation);

        parkingSlotService.updateSlotStatus(reservation.getSlotId(), SlotStatus.AVAILABLE);

        log.info("Reservation {} checked out: userId={}, fee={}, receiptId={}",
                reservationId, userId, result.totalFee(), result.receiptId());

        return CheckOutResponse.builder()
                .reservation(mapToDto(reservation))
                .transaction(result)
                .build();
    }

    // ── History ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ReservationDto> getHistoryForUser(Long userId) {
        return reservationRepository.findByUserIdOrderByCreatedDateDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReservationDto getById(Long reservationId, Long userId) {
        Reservation reservation = findOwnedReservation(reservationId, userId);
        return mapToDto(reservation);
    }

    // ── Scheduled No-Show Cleanup ─────────────────────────────────────────────

    /**
     * Runs every 60 seconds.
     * PENDING reservations whose check-in window (startTime + 30 min) has
     * already closed are marked NO_SHOW and their slot is freed.
     */
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void markNoShows() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);
        List<Reservation> noShows = reservationRepository.findPendingNoShows(cutoff);

        for (Reservation r : noShows) {
            r.setStatus(ReservationStatus.NO_SHOW);
            reservationRepository.save(r);
            parkingSlotService.updateSlotStatus(r.getSlotId(), SlotStatus.AVAILABLE);
            log.info("Reservation {} marked NO_SHOW (slotId={})", r.getId(), r.getSlotId());
        }

        if (!noShows.isEmpty()) {
            log.info("No-show sweep complete: {} reservation(s) updated.", noShows.size());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Reservation findOwnedReservation(Long reservationId, Long userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> SpmsException.notFound("Reservation", reservationId));

        if (!reservation.getUserId().equals(userId)) {
            throw new SpmsException("Access denied: reservation does not belong to you.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }
        return reservation;
    }

    private ReservationDto mapToDto(Reservation r) {
        return ReservationDto.builder()
                .id(r.getId())
                .slotId(r.getSlotId())
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .checkInTime(r.getCheckInTime())
                .status(r.getStatus())
                .createdDate(r.getCreatedDate())
                .build();
    }
}
