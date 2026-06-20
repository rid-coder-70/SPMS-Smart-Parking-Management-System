package com.spms.reservation;

import com.spms.common.enums.ReservationStatus;
import com.spms.common.enums.VehicleType;
import com.spms.auth.entity.User;
import com.spms.auth.repository.UserRepository;
import com.spms.parking.entity.ParkingSlot;
import com.spms.parking.repository.ParkingSlotRepository;
import com.spms.parking.service.ParkingSlotService;
import com.spms.reservation.dto.CancelResponse;
import com.spms.reservation.dto.CreateReservationRequest;
import com.spms.reservation.entity.Reservation;
import com.spms.reservation.repository.ReservationRepository;
import com.spms.reservation.service.ReservationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReservationModuleTests {

    @Mock private ReservationRepository reservationRepository;
    @Mock private ParkingSlotService parkingSlotService;
    @Mock private ParkingSlotRepository parkingSlotRepository;
    @Mock private BillingService billingService;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private ReservationService reservationService;

    @Test
    void overlappingRejected() {
        CreateReservationRequest req = new CreateReservationRequest();
        req.setSlotId(1L);
        req.setStartTime(LocalDateTime.now().plusDays(1));
        req.setDurationMinutes(60);

        when(reservationRepository.findOverlapping(eq(1L), any(), any()))
            .thenReturn(Collections.singletonList(new Reservation()));

        assertThrows(ResponseStatusException.class, () -> reservationService.createReservation(10L, req));
    }

    @Test
    void cancelMoreThan1HourNoFee() {
        Reservation r = new Reservation();
        r.setId(1L);
        r.setUserId(10L);
        r.setSlotId(1L);
        r.setStartTime(LocalDateTime.now().plusHours(2));
        
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(r));

        CancelResponse resp = reservationService.cancelReservation(1L, 10L);

        assertTrue(resp.isCancelled());
        assertFalse(resp.isFeeApplied());
    }

    @Test
    void checkOutBeforeCheckInRejected() {
        Reservation r = new Reservation();
        r.setId(1L);
        r.setUserId(10L);
        r.setStatus(ReservationStatus.PENDING);

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(r));

        assertThrows(ResponseStatusException.class, () -> reservationService.checkOut(1L, 10L));
    }
}
