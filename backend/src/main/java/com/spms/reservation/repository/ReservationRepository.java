package com.spms.reservation.repository;

import com.spms.common.enums.ReservationStatus;
import com.spms.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /**
     * Double-booking prevention — checks whether any active reservation
     * overlaps the requested time window on the same slot.
     *
     * Two intervals [A_start, A_end) and [B_start, B_end) overlap
     * when A_start < B_end AND A_end > B_start.
     */
    @Query("SELECT COUNT(r) > 0 FROM Reservation r " +
           "WHERE r.parkingSlot.id = :slotId " +
           "AND r.status IN :activeStatuses " +
           "AND r.startTime < :endTime " +
           "AND r.endTime > :startTime")
    boolean existsOverlapping(@Param("slotId") Long slotId,
                              @Param("startTime") LocalDateTime startTime,
                              @Param("endTime") LocalDateTime endTime,
                              @Param("activeStatuses") List<ReservationStatus> activeStatuses);

    /** User's own reservations, newest first. */
    List<Reservation> findByUserIdOrderByCreatedDateDesc(Long userId);

    /** All reservations for a specific slot (admin use). */
    List<Reservation> findByParkingSlotIdOrderByStartTimeDesc(Long slotId);
}
