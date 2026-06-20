package com.spms.reservation.controller;

import com.spms.common.util.SecurityUtils;
import com.spms.reservation.dto.*;
import com.spms.reservation.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
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
