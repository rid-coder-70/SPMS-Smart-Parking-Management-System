package com.spms.billing.service;
import com.spms.billing.dto.TransactionDto;
import com.spms.billing.entity.Transaction;
import com.spms.billing.repository.TransactionRepository;
import com.spms.common.enums.PaymentStatus;
import com.spms.common.enums.ReservationStatus;
import com.spms.common.enums.SlotStatus;
import com.spms.common.enums.VehicleType;
import com.spms.common.exception.SpmsException;
import com.spms.parking.entity.ParkingLot;
import com.spms.parking.entity.ParkingSlot;
import com.spms.parking.service.ParkingSlotService;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BillingService.
 */
@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private ReservationRepository reservationRepository;
    @Mock private ParkingSlotService    parkingSlotService;
    @Mock private FeeCalculator         feeCalculator;

    @InjectMocks
    private BillingService billingService;

    // ── Helpers ───────────────────────────────────────────────

    private ParkingSlot buildSlot() {
        ParkingLot lot = ParkingLot.builder().id(1L).lotName("East Wing").build();
        return ParkingSlot.builder()
                .id(10L)
                .parkingLot(lot)
                .slotNumber("B-01")
                .slotType(VehicleType.STANDARD)
                .status(SlotStatus.RESERVED)
                .build();
    }

    private Reservation buildConfirmedReservation() {
        return Reservation.builder()
                .id(50L)
                .userId(1L)
                .parkingSlot(buildSlot())
                .startTime(LocalDateTime.now().minusHours(2))
                .endTime(LocalDateTime.now().plusHours(1))
                .status(ReservationStatus.CONFIRMED)
                .build();
    }

    private Transaction buildPendingTransaction() {
        return Transaction.builder()
                .id(200L)
                .reservation(buildConfirmedReservation())
                .checkInTime(LocalDateTime.now().minusHours(2))
                .paymentStatus(PaymentStatus.PENDING)
                .build();
    }

    // ── CHECK-IN ──────────────────────────────────────────────

    @Nested
    @DisplayName("checkIn()")
    class CheckInTests {

        @Test
        @DisplayName("1. Successful check-in creates transaction and sets slot to OCCUPIED")
        void successfulCheckIn() {
            Reservation reservation = buildConfirmedReservation();

            when(reservationRepository.findById(50L)).thenReturn(Optional.of(reservation));
            when(transactionRepository.existsByReservationId(50L)).thenReturn(false);
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> {
                Transaction t = inv.getArgument(0);
                t.setId(200L);
                return t;
            });

            TransactionDto result = billingService.checkIn(50L);

            assertThat(result).isNotNull();
            assertThat(result.getReservationId()).isEqualTo(50L);
            assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);
            assertThat(result.getCheckInTime()).isNotNull();

            verify(parkingSlotService).updateSlotStatus(10L, SlotStatus.OCCUPIED);
        }

        @Test
        @DisplayName("2. Check-in on non-CONFIRMED reservation rejected with 400")
        void checkInNonConfirmedRejected() {
            Reservation reservation = buildConfirmedReservation();
            reservation.setStatus(ReservationStatus.CANCELLED);

            when(reservationRepository.findById(50L)).thenReturn(Optional.of(reservation));

            SpmsException ex = catchThrowableOfType(
                    () -> billingService.checkIn(50L), SpmsException.class);

            assertThat(ex.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(ex.getMessage()).containsIgnoringCase("CONFIRMED");

            verify(transactionRepository, never()).save(any());
        }
    }

    // ── CHECK-OUT ─────────────────────────────────────────────

    @Nested
    @DisplayName("checkOut()")
    class CheckOutTests {

        @Test
        @DisplayName("3. Successful check-out computes duration and fee")
        void successfulCheckOut() {
            Transaction transaction = buildPendingTransaction();
            BigDecimal expectedFee = new BigDecimal("100.00");

            when(transactionRepository.findById(200L)).thenReturn(Optional.of(transaction));
            when(feeCalculator.calculate(anyLong(), eq(VehicleType.STANDARD))).thenReturn(expectedFee);
            when(transactionRepository.save(any())).thenReturn(transaction);
            when(reservationRepository.save(any())).thenReturn(transaction.getReservation());

            TransactionDto result = billingService.checkOut(200L);

            assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
            assertThat(result.getAmount()).isEqualTo(expectedFee);
            assertThat(result.getCheckOutTime()).isNotNull();
            assertThat(result.getDurationMinutes()).isNotNull();

            verify(parkingSlotService).updateSlotStatus(10L, SlotStatus.AVAILABLE);
            verify(feeCalculator).calculate(anyLong(), eq(VehicleType.STANDARD));
        }

        @Test
        @DisplayName("4. Double check-out rejected with 400")
        void doubleCheckOutRejected() {
            Transaction transaction = buildPendingTransaction();
            transaction.setCheckOutTime(LocalDateTime.now());  // already checked out

            when(transactionRepository.findById(200L)).thenReturn(Optional.of(transaction));

            SpmsException ex = catchThrowableOfType(
                    () -> billingService.checkOut(200L), SpmsException.class);

            assertThat(ex.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(ex.getMessage()).containsIgnoringCase("already checked out");
        }
    }
}
