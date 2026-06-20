package com.spms.reservation.service;

import com.spms.common.enums.ReservationStatus;
import com.spms.common.enums.SlotStatus;
import com.spms.auth.repository.UserRepository;
import com.spms.auth.entity.User;
import com.spms.parking.entity.ParkingSlot;
import com.spms.parking.repository.ParkingSlotRepository;
import com.spms.parking.service.ParkingSlotService;
import com.spms.reservation.BillingService;
import com.spms.reservation.TransactionResult;
import com.spms.reservation.dto.CancelResponse;
import com.spms.reservation.dto.CreateReservationRequest;
import com.spms.reservation.dto.ReservationDto;
import com.spms.reservation.entity.Reservation;
import com.spms.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ParkingSlotService parkingSlotService;
    private final ParkingSlotRepository parkingSlotRepository;
    private final BillingService billingService;
    private final UserRepository userRepository;

    @Transactional
    public ReservationDto createReservation(Long userId, CreateReservationRequest req) {
        if (req.getDurationMinutes() < 30 || req.getDurationMinutes() % 30 != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duration must be at least 30 minutes and divisible by 30");
        }
        if (req.getStartTime().isAfter(LocalDateTime.now().plusDays(30))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "StartTime must be within the next 30 days");
        }

        LocalDateTime endTime = req.getStartTime().plusMinutes(req.getDurationMinutes());

        List<Reservation> overlaps = reservationRepository.findOverlapping(req.getSlotId(), req.getStartTime(), endTime);
        if (!overlaps.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slot is already reserved for this time");
        }

        ParkingSlot slot = parkingSlotRepository.findById(req.getSlotId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slot not found"));

        List<Reservation> activeInLot = reservationRepository.findActiveByUserAndLot(userId, slot.getLotId());
        if (!activeInLot.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already has an active reservation in this lot");
        }

        Reservation res = Reservation.builder()
                .userId(userId)
                .slotId(req.getSlotId())
                .startTime(req.getStartTime())
                .endTime(endTime)
                .status(ReservationStatus.PENDING)
                .build();
        
        parkingSlotService.updateSlotStatus(req.getSlotId(), SlotStatus.RESERVED);
        return mapToDto(reservationRepository.save(res));
    }

    @Transactional
    public CancelResponse cancelReservation(Long reservationId, Long userId) {
        Reservation res = getReservation(reservationId, userId);
        boolean feeApplied = false;

        if (res.getStartTime().minusMinutes(60).isBefore(LocalDateTime.now())) {
            feeApplied = true;
        }

        res.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(res);
        parkingSlotService.updateSlotStatus(res.getSlotId(), SlotStatus.AVAILABLE);

        return new CancelResponse(true, feeApplied);
    }

    @Transactional
    public ReservationDto checkIn(Long reservationId, Long userId) {
        Reservation res = getReservation(reservationId, userId);

        if (res.getStatus() != ReservationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation is not pending");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(res.getStartTime()) || now.isAfter(res.getStartTime().plusMinutes(30))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Check-in only allowed within 30 minutes of start time");
        }

        res.setCheckInTime(now);
        res.setStatus(ReservationStatus.CONFIRMED);
        reservationRepository.save(res);
        parkingSlotService.updateSlotStatus(res.getSlotId(), SlotStatus.OCCUPIED);

        return mapToDto(res);
    }

    @Transactional
    public Object checkOut(Long reservationId, Long userId) {
        Reservation res = getReservation(reservationId, userId);

        if (res.getStatus() != ReservationStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation must be confirmed to check out");
        }

        User user = userRepository.findById(userId).orElseThrow();
        LocalDateTime now = LocalDateTime.now();
        
        TransactionResult tr = billingService.processCheckout(reservationId, res.getCheckInTime(), now, user.getVehicleType());
        
        res.setStatus(ReservationStatus.COMPLETED);
        reservationRepository.save(res);
        parkingSlotService.updateSlotStatus(res.getSlotId(), SlotStatus.AVAILABLE);

        return tr;
    }

    public List<ReservationDto> getHistoryForUser(Long userId) {
        return reservationRepository.findByUserIdOrderByStartTimeDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ReservationDto getReservationById(Long reservationId, Long userId) {
        return mapToDto(getReservation(reservationId, userId));
    }

    private Reservation getReservation(Long reservationId, Long userId) {
        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));
        if (!res.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return res;
    }

    private ReservationDto mapToDto(Reservation res) {
        ReservationDto dto = new ReservationDto();
        dto.setId(res.getId());
        dto.setSlotId(res.getSlotId());
        dto.setStartTime(res.getStartTime());
        dto.setEndTime(res.getEndTime());
        dto.setCheckInTime(res.getCheckInTime());
        dto.setStatus(res.getStatus());
        return dto;
    }
}
