package com.spms.reservation.controller;

import com.spms.auth.entity.User;
import com.spms.reservation.dto.CancelResponse;
import com.spms.reservation.dto.CheckOutResponse;
import com.spms.reservation.dto.CreateReservationRequest;
import com.spms.reservation.dto.ReservationDto;
import com.spms.reservation.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationDto createReservation(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody CreateReservationRequest request) {
        return reservationService.createReservation(principal.getId(), request);
    }

    @GetMapping("/me")
    public List<ReservationDto> getMyReservations(
            @AuthenticationPrincipal User principal) {
        return reservationService.getHistoryForUser(principal.getId());
    }

    @GetMapping("/{id}")
    public ReservationDto getReservation(
            @AuthenticationPrincipal User principal,
            @PathVariable Long id) {
        return reservationService.getById(id, principal.getId());
    }

    @PutMapping("/{id}/cancel")
    public CancelResponse cancelReservation(
            @AuthenticationPrincipal User principal,
            @PathVariable Long id) {
        return reservationService.cancelReservation(id, principal.getId());
    }

    @DeleteMapping("/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public CancelResponse adminCancelReservation(@PathVariable Long id) {
        return reservationService.adminCancelReservation(id);
    }

    @PutMapping("/{id}/check-in")
    public ReservationDto checkIn(
            @AuthenticationPrincipal User principal,
            @PathVariable Long id) {
        return reservationService.checkIn(id, principal.getId());
    }

    @PutMapping("/{id}/check-out")
    public CheckOutResponse checkOut(
            @AuthenticationPrincipal User principal,
            @PathVariable Long id) {
        return reservationService.checkOut(id, principal.getId());
    }
}
