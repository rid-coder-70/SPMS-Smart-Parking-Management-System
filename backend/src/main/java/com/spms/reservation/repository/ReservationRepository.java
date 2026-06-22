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

    @Query("SELECT COUNT(r) > 0 FROM Reservation r " +
           "WHERE r.parkingSlot.id = :slotId " +
           "AND r.status IN :activeStatuses " +
           "AND r.startTime < :endTime " +
           "AND r.endTime > :startTime")
    boolean existsOverlapping(@Param("slotId") Long slotId,
                              @Param("startTime") LocalDateTime startTime,
                              @Param("endTime") LocalDateTime endTime,
                              @Param("activeStatuses") List<ReservationStatus> activeStatuses);

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.userId = :userId
          AND r.parkingSlot.parkingLot.id = :lotId
          AND r.status IN (
                com.spms.common.enums.ReservationStatus.PENDING,
                com.spms.common.enums.ReservationStatus.CONFIRMED
              )
    """)
    List<Reservation> findActiveByUserAndLot(
            @Param("userId") Long userId,
            @Param("lotId") Long lotId
    );

    List<Reservation> findByUserIdOrderByCreatedDateDesc(Long userId);

    List<Reservation> findByParkingSlotIdOrderByStartTimeDesc(Long slotId);

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.status = com.spms.common.enums.ReservationStatus.PENDING
          AND r.startTime < :cutoff
    """)
    List<Reservation> findPendingNoShows(@Param("cutoff") LocalDateTime cutoff);

    List<Reservation> findByStatus(ReservationStatus status);
}
