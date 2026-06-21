package com.spms.reservation.service;

import com.spms.common.enums.ReservationStatus;
import com.spms.common.enums.SlotStatus;
import com.spms.common.exception.SpmsException;
import com.spms.parking.entity.ParkingSlot;
import com.spms.parking.repository.ParkingSlotRepository;
import com.spms.parking.service.ParkingSlotService;
import com.spms.reservation.dto.CreateReservationRequest;
import com.spms.reservation.dto.ReservationDto;
import com.spms.reservation.entity.Reservation;
import com.spms.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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
                .createdDate(r.getCreatedDate())
                .build();
    }
}
