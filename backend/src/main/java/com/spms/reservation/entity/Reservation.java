package com.spms.reservation.entity;

import com.spms.common.enums.ReservationStatus;
import com.spms.parking.entity.ParkingSlot;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Reservation entity — represents a user's booking of a parking slot
 * for a specific time window.
 *
 * userId is stored as a plain Long (not a JPA relationship) to keep
 * the reservation module decoupled from the auth module.
 */
@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who made this reservation (references users.id). */
    @Column(nullable = false)
    private Long userId;

    /** The slot being reserved. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private ParkingSlot parkingSlot;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReservationStatus status = ReservationStatus.CONFIRMED;

    @Column(length = 20)
    private String vehicleNumber;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdDate = LocalDateTime.now();
}
