package com.spms.reservation.service;


import com.spms.common.enums.ReservationStatus;
import com.spms.common.enums.SlotStatus;
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

    private static final List<ReservationStatus> ACTIVE_STATUSES =
            List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED);

    private final ReservationRepository reservationRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final ParkingSlotService parkingSlotService;

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

        // Update slot status to RESERVED if not already
        if (slot.getStatus() == SlotStatus.AVAILABLE) {
            parkingSlotService.updateSlotStatus(slot.getId(), SlotStatus.RESERVED);
        }

        log.info("Reservation created: id={}, userId={}, slotId={}", reservation.getId(), userId, slot.getId());
        return mapToDto(reservation);
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
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);
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
        long duration = ChronoUnit.MINUTES.between(start, end);
        if (duration < 30) {
            throw SpmsException.badRequest("Duration must be at least 30 minutes");
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
        return ReservationDto.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .slotId(slot.getId())
                .slotNumber(slot.getSlotNumber())
                .lotName(slot.getParkingLot().getLotName())
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .checkInTime(r.getCheckInTime())
                .status(r.getStatus())
                .vehicleNumber(r.getVehicleNumber())
                .createdDate(r.getCreatedDate())
                .build();
    }
}
