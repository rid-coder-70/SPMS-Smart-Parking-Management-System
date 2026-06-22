package com.spms.reservation.service;

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

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock private ReservationRepository reservationRepository;
    @Mock private ParkingSlotService    parkingSlotService;
    @Mock private ParkingSlotRepository parkingSlotRepository;
    @Mock private UserRepository        userRepository;


    @InjectMocks
    private ReservationService reservationService;

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

    private CreateReservationRequest buildRequest(LocalDateTime start, int minutes) {
        CreateReservationRequest req = new CreateReservationRequest();
        req.setSlotId(SLOT_ID);
        req.setStartTime(start);
        req.setEndTime(start.plusMinutes(minutes));
        return req;
    }

    private void stubSlotLookup() {
        when(parkingSlotRepository.findById(SLOT_ID)).thenReturn(Optional.of(testSlot));
    }

    @Test
    @DisplayName("createReservation — overlapping slot → 409 CONFLICT")
    void createReservation_overlapping_shouldThrow409() {
        LocalDateTime start = LocalDateTime.now().plusHours(2);
        stubSlotLookup();

        when(reservationRepository.existsOverlapping(eq(SLOT_ID), any(), any(), any()))
                .thenReturn(true);

        CreateReservationRequest req = buildRequest(start, 30);

        assertThatThrownBy(() -> reservationService.createReservation(USER_ID, req))
                .isInstanceOf(SpmsException.class)
                .hasMessageContaining("already reserved");
    }

    @Test
    @DisplayName("createReservation — no overlap → reservation created and slot RESERVED")
    void createReservation_noOverlap_shouldSucceed() {
        LocalDateTime start = LocalDateTime.now().plusHours(2);
        stubSlotLookup();

        when(reservationRepository.existsOverlapping(eq(SLOT_ID), any(), any(), any()))
                .thenReturn(false);
        when(reservationRepository.findActiveByUserAndLot(eq(USER_ID), anyLong()))
                .thenReturn(Collections.emptyList());

        Reservation saved = Reservation.builder()
                .id(1L).userId(USER_ID).parkingSlot(testSlot)
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

    @Test
    @DisplayName("cancelReservation — more than 60 min before start → feeApplied=false")
    void cancelReservation_moreThan60MinBefore_noFee() {
        LocalDateTime start = LocalDateTime.now().plusHours(2);

        Reservation reservation = Reservation.builder()
                .id(1L).userId(USER_ID).parkingSlot(testSlot)
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

    @Test
    @DisplayName("cancelReservation — within 60 min of start → feeApplied=true")
    void cancelReservation_within60Min_feeApplied() {
        LocalDateTime start = LocalDateTime.now().plusMinutes(30);

        Reservation reservation = Reservation.builder()
                .id(2L).userId(USER_ID).parkingSlot(testSlot)
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


}
