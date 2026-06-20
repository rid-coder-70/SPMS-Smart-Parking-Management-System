package com.spms.reservation;

import com.spms.auth.entity.User;
import com.spms.auth.repository.UserRepository;
import com.spms.common.enums.ReservationStatus;
import com.spms.common.enums.SlotStatus;
import com.spms.common.enums.VehicleType;
import com.spms.common.exception.SpmsException;
import com.spms.parking.entity.ParkingLot;
import com.spms.parking.entity.ParkingSlot;
import com.spms.parking.repository.ParkingSlotRepository;
import com.spms.parking.service.ParkingSlotService;
import com.spms.reservation.billing.BillingService;
import com.spms.reservation.billing.TransactionResult;
import com.spms.reservation.dto.*;
import com.spms.reservation.entity.Reservation;
import com.spms.reservation.repository.ReservationRepository;
import com.spms.reservation.service.ReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ReservationService.
 * ParkingSlotService and BillingService are mocked with Mockito.
 *
 * Covered cases:
 *  1. Overlapping reservation is rejected with 409
 *  2. Valid non-overlapping reservation succeeds
 *  3. Cancellation >1 hr before start → no fee
 *  4. Cancellation ≤1 hr before start → fee flagged
 *  5. Check-out before check-in (status=PENDING) is rejected
 *  6. Invalid duration is rejected with 400
 */
@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    // ── Mocks ─────────────────────────────────────────────────────────────────

    @Mock private ReservationRepository reservationRepository;
    @Mock private ParkingSlotService    parkingSlotService;
    @Mock private ParkingSlotRepository parkingSlotRepository;
    @Mock private UserRepository        userRepository;
    @Mock private BillingService        billingService;

    @InjectMocks
    private ReservationService reservationService;

    // ── Test fixtures ─────────────────────────────────────────────────────────

    private static final Long   USER_ID  = 1L;
    private static final Long   SLOT_ID  = 10L;
    private static final Long   LOT_ID   = 100L;

    private ParkingLot  testLot;
    private ParkingSlot testSlot;
    private User        testUser;

    @BeforeEach
    void setUp() {
        testLot = new ParkingLot();
        testLot.setId(LOT_ID);
        testLot.setLotName("Test Lot");
        testLot.setLocation("Test Location");
        testLot.setTotalCapacity(50);

        testSlot = ParkingSlot.builder()
                .id(SLOT_ID)
                .parkingLot(testLot)
                .slotNumber("A1")
                .slotType(VehicleType.STANDARD)
                .status(SlotStatus.AVAILABLE)
                .build();

        testUser = User.builder()
                .id(USER_ID)
                .username("testuser")
                .email("test@spms.com")
                .passwordHash("hash")
                .vehicleType(VehicleType.STANDARD)
                .build();
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private CreateReservationRequest buildRequest(LocalDateTime start, int minutes) {
        CreateReservationRequest req = new CreateReservationRequest();
        req.setSlotId(SLOT_ID);
        req.setStartTime(start);
        req.setDurationMinutes(minutes);
        return req;
    }

    private void stubSlotLookup() {
        when(parkingSlotRepository.findById(SLOT_ID)).thenReturn(Optional.of(testSlot));
        when(parkingSlotRepository.findByParkingLotId(LOT_ID)).thenReturn(List.of(testSlot));
    }

    // ── Test 1: Overlapping reservation rejected ──────────────────────────────

    @Test
    @DisplayName("createReservation — overlapping slot → 409 CONFLICT")
    void createReservation_overlapping_shouldThrow409() {
        LocalDateTime start = LocalDateTime.now().plusHours(2);

        stubSlotLookup();

        // Simulate an existing reservation that overlaps
        Reservation existing = Reservation.builder()
                .id(99L).userId(2L).slotId(SLOT_ID)
                .startTime(start.minusMinutes(15))
                .endTime(start.plusMinutes(45))
                .status(ReservationStatus.PENDING)
                .build();

        when(reservationRepository.findOverlapping(eq(SLOT_ID), any(), any()))
                .thenReturn(List.of(existing));

        CreateReservationRequest req = buildRequest(start, 30);

        assertThatThrownBy(() -> reservationService.createReservation(USER_ID, req))
                .isInstanceOf(SpmsException.class)
                .hasMessageContaining("already reserved");
    }

    // ── Test 2: Valid non-overlapping reservation succeeds ────────────────────

    @Test
    @DisplayName("createReservation — no overlap → reservation created and slot RESERVED")
    void createReservation_noOverlap_shouldSucceed() {
        LocalDateTime start = LocalDateTime.now().plusHours(2);

        stubSlotLookup();

        when(reservationRepository.findOverlapping(any(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(reservationRepository.findActiveByUserAndLot(eq(USER_ID), anyList()))
                .thenReturn(Collections.emptyList());

        Reservation saved = Reservation.builder()
                .id(1L).userId(USER_ID).slotId(SLOT_ID)
                .startTime(start).endTime(start.plusMinutes(60))
                .status(ReservationStatus.PENDING)
                .createdDate(LocalDateTime.now())
                .build();

        when(reservationRepository.save(any(Reservation.class))).thenReturn(saved);
        doNothing().when(parkingSlotService).updateSlotStatus(SLOT_ID, SlotStatus.RESERVED);

        CreateReservationRequest req = buildRequest(start, 60);
        ReservationDto result = reservationService.createReservation(USER_ID, req);

        assertThat(result).isNotNull();
        assertThat(result.getSlotId()).isEqualTo(SLOT_ID);
        assertThat(result.getStatus()).isEqualTo(ReservationStatus.PENDING);

        verify(parkingSlotService).updateSlotStatus(SLOT_ID, SlotStatus.RESERVED);
        verify(reservationRepository).save(any(Reservation.class));
    }

    // ── Test 3: Cancellation > 1 hr before start → no fee ────────────────────

    @Test
    @DisplayName("cancelReservation — more than 60 min before start → feeApplied=false")
    void cancelReservation_moreThan60MinBefore_noFee() {
        // Start is 2 hours in the future
        LocalDateTime start = LocalDateTime.now().plusHours(2);

        Reservation reservation = Reservation.builder()
                .id(1L).userId(USER_ID).slotId(SLOT_ID)
                .startTime(start).endTime(start.plusMinutes(60))
                .status(ReservationStatus.PENDING)
                .createdDate(LocalDateTime.now())
                .build();

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any())).thenReturn(reservation);
        doNothing().when(parkingSlotService).updateSlotStatus(SLOT_ID, SlotStatus.AVAILABLE);

        CancelResponse response = reservationService.cancelReservation(1L, USER_ID);

        assertThat(response.isCancelled()).isTrue();
        assertThat(response.isFeeApplied()).isFalse();
    }

    // ── Test 4: Cancellation ≤ 1 hr before start → fee flagged ──────────────

    @Test
    @DisplayName("cancelReservation — within 60 min of start → feeApplied=true")
    void cancelReservation_within60Min_feeApplied() {
        // Start is only 30 minutes in the future
        LocalDateTime start = LocalDateTime.now().plusMinutes(30);

        Reservation reservation = Reservation.builder()
                .id(2L).userId(USER_ID).slotId(SLOT_ID)
                .startTime(start).endTime(start.plusMinutes(60))
                .status(ReservationStatus.PENDING)
                .createdDate(LocalDateTime.now())
                .build();

        when(reservationRepository.findById(2L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any())).thenReturn(reservation);
        doNothing().when(parkingSlotService).updateSlotStatus(SLOT_ID, SlotStatus.AVAILABLE);

        CancelResponse response = reservationService.cancelReservation(2L, USER_ID);

        assertThat(response.isCancelled()).isTrue();
        assertThat(response.isFeeApplied()).isTrue();
    }

    // ── Test 5: Check-out before check-in (PENDING) is rejected ──────────────

    @Test
    @DisplayName("checkOut — on PENDING reservation (no check-in) → 400 BAD_REQUEST")
    void checkOut_beforeCheckIn_shouldThrow400() {
        Reservation reservation = Reservation.builder()
                .id(3L).userId(USER_ID).slotId(SLOT_ID)
                .startTime(LocalDateTime.now().minusHours(1))
                .endTime(LocalDateTime.now().plusHours(1))
                .status(ReservationStatus.PENDING)   // never checked in
                .checkInTime(null)
                .createdDate(LocalDateTime.now())
                .build();

        when(reservationRepository.findById(3L)).thenReturn(Optional.of(reservation));

        assertThatThrownBy(() -> reservationService.checkOut(3L, USER_ID))
                .isInstanceOf(SpmsException.class)
                .hasMessageContaining("CONFIRMED");
    }

    // ── Test 6: Invalid duration rejected ─────────────────────────────────────

    @Test
    @DisplayName("createReservation — durationMinutes not divisible by 30 → 400")
    void createReservation_invalidDuration_shouldThrow400() {
        CreateReservationRequest req = buildRequest(LocalDateTime.now().plusHours(1), 45);

        assertThatThrownBy(() -> reservationService.createReservation(USER_ID, req))
                .isInstanceOf(SpmsException.class)
                .hasMessageContaining("divisible by 30");
    }

    // ── Test 7: Full check-in → check-out flow works ──────────────────────────

    @Test
    @DisplayName("checkOut — CONFIRMED reservation → transaction result returned")
    void checkOut_confirmed_returnsTransactionResult() {
        LocalDateTime checkIn = LocalDateTime.now().minusMinutes(90);

        Reservation reservation = Reservation.builder()
                .id(4L).userId(USER_ID).slotId(SLOT_ID)
                .startTime(checkIn).endTime(checkIn.plusMinutes(120))
                .status(ReservationStatus.CONFIRMED)
                .checkInTime(checkIn)
                .createdDate(LocalDateTime.now().minusMinutes(120))
                .build();

        when(reservationRepository.findById(4L)).thenReturn(Optional.of(reservation));
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));

        TransactionResult txResult = new TransactionResult(new BigDecimal("15.00"), 42L);
        when(billingService.processCheckout(anyLong(), any(), any(), any()))
                .thenReturn(txResult);

        when(reservationRepository.save(any())).thenReturn(reservation);
        doNothing().when(parkingSlotService).updateSlotStatus(SLOT_ID, SlotStatus.AVAILABLE);

        CheckOutResponse response = reservationService.checkOut(4L, USER_ID);

        assertThat(response.getTransaction().totalFee()).isEqualByComparingTo("15.00");
        assertThat(response.getTransaction().receiptId()).isEqualTo(42L);
        assertThat(response.getReservation().getStatus()).isEqualTo(ReservationStatus.COMPLETED);

        verify(parkingSlotService).updateSlotStatus(SLOT_ID, SlotStatus.AVAILABLE);
    }
}
