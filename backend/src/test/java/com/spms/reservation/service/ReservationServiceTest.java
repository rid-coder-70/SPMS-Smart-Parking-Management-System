package com.spms.reservation.service;

import com.spms.common.enums.ReservationStatus;
import com.spms.common.enums.SlotStatus;
import com.spms.common.enums.VehicleType;
import com.spms.common.exception.SpmsException;
import com.spms.parking.entity.ParkingLot;
import com.spms.parking.entity.ParkingSlot;
import com.spms.parking.repository.ParkingSlotRepository;
import com.spms.parking.service.ParkingSlotService;
import com.spms.reservation.dto.CreateReservationRequest;
import com.spms.reservation.dto.ReservationDto;
import com.spms.reservation.entity.Reservation;
import com.spms.reservation.repository.ReservationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ReservationService.
 * All dependencies are mocked — no Spring context, no DB.
 */
@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock private ReservationRepository reservationRepository;
    @Mock private ParkingSlotRepository parkingSlotRepository;
    @Mock private ParkingSlotService    parkingSlotService;

    @InjectMocks
    private ReservationService reservationService;

    // ── Helpers ───────────────────────────────────────────────

    private ParkingSlot buildAvailableSlot() {
        ParkingLot lot = ParkingLot.builder()
                .id(1L)
                .lotName("North Wing")
                .build();

        return ParkingSlot.builder()
                .id(10L)
                .parkingLot(lot)
                .slotNumber("A-01")
                .slotType(VehicleType.STANDARD)
                .status(SlotStatus.AVAILABLE)
                .build();
    }

    private CreateReservationRequest buildValidRequest() {
        return CreateReservationRequest.builder()
                .slotId(10L)
                .startTime(LocalDateTime.now().plusHours(1))
                .endTime(LocalDateTime.now().plusHours(3))
                .vehicleNumber("DHK-1234")
                .build();
    }

    private Reservation buildConfirmedReservation(Long userId) {
        ParkingSlot slot = buildAvailableSlot();
        return Reservation.builder()
                .id(100L)
                .userId(userId)
                .parkingSlot(slot)
                .startTime(LocalDateTime.now().plusHours(1))
                .endTime(LocalDateTime.now().plusHours(3))
                .status(ReservationStatus.CONFIRMED)
                .vehicleNumber("DHK-1234")
                .build();
    }

    // ── CREATE RESERVATION ────────────────────────────────────

    @Nested
    @DisplayName("createReservation()")
    class CreateTests {

        @Test
        @DisplayName("1. Successful reservation returns DTO and updates slot to RESERVED")
        void successfulReservation() {
            ParkingSlot slot = buildAvailableSlot();
            CreateReservationRequest req = buildValidRequest();

            when(parkingSlotRepository.findById(10L)).thenReturn(Optional.of(slot));
            when(reservationRepository.existsOverlapping(eq(10L), any(), any(), any())).thenReturn(false);
            when(reservationRepository.save(any(Reservation.class))).thenAnswer(inv -> {
                Reservation r = inv.getArgument(0);
                r.setId(100L);
                return r;
            });

            ReservationDto result = reservationService.createReservation(1L, req);

            assertThat(result).isNotNull();
            assertThat(result.getSlotNumber()).isEqualTo("A-01");
            assertThat(result.getLotName()).isEqualTo("North Wing");
            assertThat(result.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);

            verify(parkingSlotService).updateSlotStatus(10L, SlotStatus.RESERVED);
        }

        @Test
        @DisplayName("2. Double-booking rejected with 409 CONFLICT")
        void doubleBookingRejected() {
            ParkingSlot slot = buildAvailableSlot();
            CreateReservationRequest req = buildValidRequest();

            when(parkingSlotRepository.findById(10L)).thenReturn(Optional.of(slot));
            when(reservationRepository.existsOverlapping(eq(10L), any(), any(), any())).thenReturn(true);

            SpmsException ex = catchThrowableOfType(
                    () -> reservationService.createReservation(1L, req), SpmsException.class);

            assertThat(ex.getStatus()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(ex.getMessage()).containsIgnoringCase("already reserved");

            verify(reservationRepository, never()).save(any());
            verify(parkingSlotService, never()).updateSlotStatus(anyLong(), any());
        }

        @Test
        @DisplayName("3. startTime >= endTime rejected with 400 BAD_REQUEST")
        void invalidTimeWindowRejected() {
            LocalDateTime now = LocalDateTime.now();
            CreateReservationRequest req = CreateReservationRequest.builder()
                    .slotId(10L)
                    .startTime(now.plusHours(3))
                    .endTime(now.plusHours(1))    // end is before start
                    .build();

            SpmsException ex = catchThrowableOfType(
                    () -> reservationService.createReservation(1L, req), SpmsException.class);

            assertThat(ex.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(ex.getMessage()).containsIgnoringCase("end time");
        }

        @Test
        @DisplayName("4. startTime in the past rejected with 400 BAD_REQUEST")
        void pastStartTimeRejected() {
            CreateReservationRequest req = CreateReservationRequest.builder()
                    .slotId(10L)
                    .startTime(LocalDateTime.now().minusHours(1))
                    .endTime(LocalDateTime.now().plusHours(1))
                    .build();

            SpmsException ex = catchThrowableOfType(
                    () -> reservationService.createReservation(1L, req), SpmsException.class);

            assertThat(ex.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(ex.getMessage()).containsIgnoringCase("future");
        }

        @Test
        @DisplayName("5. Slot not AVAILABLE rejected with 409 CONFLICT")
        void slotNotAvailableRejected() {
            ParkingSlot slot = buildAvailableSlot();
            slot.setStatus(SlotStatus.OCCUPIED);  // not available
            CreateReservationRequest req = buildValidRequest();

            when(parkingSlotRepository.findById(10L)).thenReturn(Optional.of(slot));

            SpmsException ex = catchThrowableOfType(
                    () -> reservationService.createReservation(1L, req), SpmsException.class);

            assertThat(ex.getStatus()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(ex.getMessage()).containsIgnoringCase("not available");
        }
    }

    // ── CANCEL RESERVATION ────────────────────────────────────

    @Nested
    @DisplayName("cancelReservation()")
    class CancelTests {

        @Test
        @DisplayName("6. Successful cancellation releases slot to AVAILABLE")
        void successfulCancellation() {
            Reservation reservation = buildConfirmedReservation(1L);

            when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));
            when(reservationRepository.save(any())).thenReturn(reservation);

            ReservationDto result = reservationService.cancelReservation(1L, 100L);

            assertThat(result.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
            verify(parkingSlotService).updateSlotStatus(10L, SlotStatus.AVAILABLE);
        }

        @Test
        @DisplayName("7. Cancelling someone else's reservation rejected with 403")
        void cancelOtherUserReservationRejected() {
            Reservation reservation = buildConfirmedReservation(1L);

            when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));

            SpmsException ex = catchThrowableOfType(
                    () -> reservationService.cancelReservation(999L, 100L),  // different userId
                    SpmsException.class);

            assertThat(ex.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
            verify(reservationRepository, never()).save(any());
        }

        @Test
        @DisplayName("8. Cannot cancel already COMPLETED reservation")
        void cancelCompletedReservationRejected() {
            Reservation reservation = buildConfirmedReservation(1L);
            reservation.setStatus(ReservationStatus.COMPLETED);

            when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));

            SpmsException ex = catchThrowableOfType(
                    () -> reservationService.cancelReservation(1L, 100L), SpmsException.class);

            assertThat(ex.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(ex.getMessage()).containsIgnoringCase("PENDING or CONFIRMED");
        }
    }
}
