package com.spms.reservation.repository;

import com.spms.common.enums.ReservationStatus;
import com.spms.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for Reservation. Contains the two custom finders
 * needed by ReservationService business-rule checks.
 */
@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /**
     * Returns PENDING or CONFIRMED reservations on {@code slotId} whose time
     * window overlaps the requested [startTime, endTime) window.
     *
     * Two ranges [a,b] and [c,d] overlap if a < d && c < b.
     */
    @Query("""
        SELECT r FROM Reservation r
        WHERE r.slotId = :slotId
          AND r.status IN (
                com.spms.common.enums.ReservationStatus.PENDING,
                com.spms.common.enums.ReservationStatus.CONFIRMED
              )
          AND r.startTime < :endTime
          AND r.endTime   > :startTime
    """)
    List<Reservation> findOverlapping(
            @Param("slotId")    Long slotId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime")   LocalDateTime endTime
    );

    /**
     * Finds PENDING or CONFIRMED reservations for {@code userId} on slots
     * that belong to {@code lotId}. Used to enforce the "one active reservation
     * per lot" rule. The lot membership is resolved beforehand by the caller.
     *
     * @param userId the user making the reservation
     * @param slotIds the set of slot IDs belonging to the target lot
     */
    @Query("""
        SELECT r FROM Reservation r
        WHERE r.userId  = :userId
          AND r.slotId  IN :slotIds
          AND r.status  IN (
                com.spms.common.enums.ReservationStatus.PENDING,
                com.spms.common.enums.ReservationStatus.CONFIRMED
              )
    """)
    List<Reservation> findActiveByUserAndLot(
            @Param("userId")  Long userId,
            @Param("slotIds") List<Long> slotIds
    );

    /** All reservations for a given user (history view). */
    List<Reservation> findByUserIdOrderByCreatedDateDesc(Long userId);

    /**
     * Scheduled no-show cleanup: PENDING reservations where the 30-minute
     * check-in window has already closed (startTime + 30 min < now).
     */
    @Query("""
        SELECT r FROM Reservation r
        WHERE r.status = com.spms.common.enums.ReservationStatus.PENDING
          AND r.startTime < :cutoff
    """)
    List<Reservation> findPendingNoShows(@Param("cutoff") LocalDateTime cutoff);

    /** All reservations for a specific status — useful for admin / testing. */
    List<Reservation> findByStatus(ReservationStatus status);
}
