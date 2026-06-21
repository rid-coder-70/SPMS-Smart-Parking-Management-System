package com.spms.reservation.controller;

import com.spms.auth.entity.User;
import com.spms.reservation.dto.CreateReservationRequest;
import com.spms.reservation.dto.ReservationDto;
import com.spms.reservation.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Reservation endpoints.
 *
 * POST   /api/v1/reservations       — book a slot (authenticated)
 * GET    /api/v1/reservations/my     — user's own reservations
 * GET    /api/v1/reservations/{id}   — single reservation detail
 * DELETE /api/v1/reservations/{id}   — cancel own reservation
 */
@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationDto> createReservation(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody CreateReservationRequest request) {
        ReservationDto dto = reservationService.createReservation(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReservationDto>> getMyReservations(
            @AuthenticationPrincipal User principal) {
        return ResponseEntity.ok(reservationService.getUserReservations(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationDto> getReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ReservationDto> cancelReservation(
            @AuthenticationPrincipal User principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(reservationService.cancelReservation(principal.getId(), id));
    }

    /** Admin-only: cancel any reservation regardless of owner. */
    @DeleteMapping("/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReservationDto> adminCancelReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.adminCancelReservation(id));
    }
}
