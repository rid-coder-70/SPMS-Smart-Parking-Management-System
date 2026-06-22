package com.spms.billing.entity;

import com.spms.common.enums.PaymentStatus;
import com.spms.reservation.entity.Reservation;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Transaction entity — records the check-in, check-out, duration,
 * and computed fee for a single parking session.
 *
 * Each transaction is linked 1:1 to a Reservation.
 */
@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The reservation this transaction belongs to. */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false, unique = true)
    private Reservation reservation;

    @Column(nullable = false)
    private LocalDateTime checkInTime;

    /** Null until the vehicle checks out. */
    @Column
    private LocalDateTime checkOutTime;

    /** Computed at check-out: difference in minutes between check-in and check-out. */
    @Column
    private Long durationMinutes;

    /** Computed fee based on duration and vehicle type. */
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdDate = LocalDateTime.now();
}
