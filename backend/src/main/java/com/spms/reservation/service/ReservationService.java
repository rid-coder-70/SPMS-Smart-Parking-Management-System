package com.spms.reservation.service;

import com.spms.common.enums.ReservationStatus;
import com.spms.common.enums.SlotStatus;
import com.spms.common.exception.SpmsException;
import com.spms.parking.entity.ParkingSlot;
import com.spms.parking.repository.ParkingSlotRepository;
import com.spms.parking.service.ParkingSlotService;
import com.spms.reservation.dto.CreateReservationRequest;
import com.spms.reservation.dto.ReservationDto;
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
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Reservation service — booking, cancellation, and history retrieval.
 *
 * Double-booking prevention is handled via a JPQL overlap query
 * in ReservationRepository, not by manual iteration.
 * Core Reservation Service implementing all booking lifecycle operations:
 * create → check-in → check-out / cancel, plus scheduled no-show cleanup.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {

    private static final List<ReservationStatus> ACTIVE_STATUSES =
            List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED);

    private final ReservationRepository reservationRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final ParkingSlotService    parkingSlotService;

    // ── Create Reservation ────────────────────────────────────

    @Transactional
    public ReservationDto createReservation(Long userId, CreateReservationRequest req) {

        validateTimeWindow(req.getStartTime(), req.getEndTime());

        ParkingSlot slot = parkingSlotRepository.findById(req.getSlotId())
                .orElseThrow(() -> SpmsException.notFound("ParkingSlot", req.getSlotId()));

        if (slot.getStatus() != SlotStatus.AVAILABLE) {
            throw new SpmsException(
                    "Slot '" + slot.getSlotNumber() + "' is not available (current: " + slot.getStatus() + ")",
                    HttpStatus.CONFLICT);
        }

        boolean hasOverlap = reservationRepository.existsOverlapping(
                slot.getId(), req.getStartTime(), req.getEndTime(), ACTIVE_STATUSES);

        if (hasOverlap) {
            throw new SpmsException(
                    "Slot '" + slot.getSlotNumber() + "' is already reserved for the requested time window",
                    HttpStatus.CONFLICT);
        }

        Reservation reservation = Reservation.builder()
                .userId(userId)
                .parkingSlot(slot)
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .status(ReservationStatus.CONFIRMED)
                .vehicleNumber(req.getVehicleNumber())
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

        // Update slot status to RESERVED
        parkingSlotService.updateSlotStatus(slot.getId(), SlotStatus.RESERVED);

        log.info("Reservation created: id={}, userId={}, slotId={}", reservation.getId(), userId, slot.getId());
        return mapToDto(reservation);
    }

    // ── Cancel Reservation ────────────────────────────────────

    @Transactional
    public ReservationDto cancelReservation(Long userId, Long reservationId) {
        Reservation reservation = findById(reservationId);

        // Only the owner or an ADMIN can cancel (ADMIN check is done at controller level via @PreAuthorize)
        if (!reservation.getUserId().equals(userId)) {
            throw new SpmsException("You can only cancel your own reservations", HttpStatus.FORBIDDEN);
        }

        return doCancellation(reservation);
    }

    @Transactional
    public ReservationDto adminCancelReservation(Long reservationId) {
        Reservation reservation = findById(reservationId);
        return doCancellation(reservation);
    }

    // ── Query Methods ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ReservationDto> getUserReservations(Long userId) {
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
    public ReservationDto getReservationById(Long reservationId) {
        return mapToDto(findById(reservationId));
    }

    // ── Internal Helpers ──────────────────────────────────────

    private ReservationDto doCancellation(Reservation reservation) {
        if (reservation.getStatus() != ReservationStatus.PENDING
                && reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new SpmsException(
                    "Only PENDING or CONFIRMED reservations can be cancelled (current: " + reservation.getStatus() + ")",
                    HttpStatus.BAD_REQUEST);
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        // Release slot back to AVAILABLE
        parkingSlotService.updateSlotStatus(reservation.getParkingSlot().getId(), SlotStatus.AVAILABLE);

        log.info("Reservation cancelled: id={}", reservation.getId());
        return mapToDto(reservation);
    }

    private void validateTimeWindow(LocalDateTime start, LocalDateTime end) {
        if (!end.isAfter(start)) {
            throw SpmsException.badRequest("End time must be after start time");
        }
        if (!start.isAfter(LocalDateTime.now())) {
            throw SpmsException.badRequest("Start time must be in the future");
        }
    }

    private Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> SpmsException.notFound("Reservation", id));
    }

    private ReservationDto mapToDto(Reservation r) {
        ParkingSlot slot = r.getParkingSlot();
        return ReservationDto.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .slotId(slot.getId())
                .slotNumber(slot.getSlotNumber())
                .lotName(slot.getParkingLot().getLotName())
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .status(r.getStatus())
                .vehicleNumber(r.getVehicleNumber())
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
