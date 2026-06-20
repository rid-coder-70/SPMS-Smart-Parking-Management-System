package com.spms.reservation.controller;

import com.spms.auth.entity.User;
import com.spms.reservation.dto.CancelResponse;
import com.spms.reservation.dto.CreateReservationRequest;
import com.spms.reservation.dto.ReservationDto;
import com.spms.reservation.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    private Long getUserId(UserDetails userDetails) {
        if (userDetails instanceof User) {
            return ((User) userDetails).getId();
        }
        return null;
    }

    @PostMapping
    public ReservationDto createReservation(@AuthenticationPrincipal UserDetails userDetails,
                                            @Valid @RequestBody CreateReservationRequest req) {
        return reservationService.createReservation(getUserId(userDetails), req);
    }

    @GetMapping("/me")
    public List<ReservationDto> getMyReservations(@AuthenticationPrincipal UserDetails userDetails) {
        return reservationService.getHistoryForUser(getUserId(userDetails));
    }

    @GetMapping("/{id}")
    public ReservationDto getReservation(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        return reservationService.getReservationById(id, getUserId(userDetails));
    }

    @PutMapping("/{id}/cancel")
    public CancelResponse cancelReservation(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        return reservationService.cancelReservation(id, getUserId(userDetails));
    }

    @PutMapping("/{id}/check-in")
    public ReservationDto checkIn(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        return reservationService.checkIn(id, getUserId(userDetails));
    }

    @PutMapping("/{id}/check-out")
    public Object checkOut(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        return reservationService.checkOut(id, getUserId(userDetails));
    }
}
