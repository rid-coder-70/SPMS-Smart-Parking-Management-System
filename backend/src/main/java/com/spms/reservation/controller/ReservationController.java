package com.spms.reservation.controller;

import com.spms.auth.entity.User;
import com.spms.reservation.dto.CreateReservationRequest;
import com.spms.reservation.dto.ReservationDto;
import com.spms.common.util.SecurityUtils;
import com.spms.reservation.dto.*;
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
 * REST controller for the Reservation & Booking Engine.
 *
 * Base path: /api/v1/reservations  (context-path set in application.properties)
 *
 * Endpoints:
 *   POST   /                    → create reservation
 *   GET    /me                  → list all reservations for the current user
 *   GET    /{id}                → get single reservation (must own it)
 *   PUT    /{id}/cancel         → cancel reservation
 *   PUT    /{id}/check-in       → check in
 *   PUT    /{id}/check-out      → check out (returns TransactionResult)
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
    // ── POST / — Create ───────────────────────────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationDto create(@Valid @RequestBody CreateReservationRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return reservationService.createReservation(userId, request);
    }

    // ── GET /me — History for current user ───────────────────────────────────

    @GetMapping("/me")
    public List<ReservationDto> myReservations() {
        Long userId = SecurityUtils.getCurrentUserId();
        return reservationService.getHistoryForUser(userId);
    }

    // ── GET /{id} — Single reservation ───────────────────────────────────────

    @GetMapping("/{id}")
    public ReservationDto getById(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        return reservationService.getById(id, userId);
    }

    // ── PUT /{id}/cancel ──────────────────────────────────────────────────────

    @PutMapping("/{id}/cancel")
    public CancelResponse cancel(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        return reservationService.cancelReservation(id, userId);
    }

    // ── PUT /{id}/check-in ────────────────────────────────────────────────────

    @PutMapping("/{id}/check-in")
    public ReservationDto checkIn(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        return reservationService.checkIn(id, userId);
    }

    // ── PUT /{id}/check-out ───────────────────────────────────────────────────

    @PutMapping("/{id}/check-out")
    public CheckOutResponse checkOut(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        return reservationService.checkOut(id, userId);
    }
}
