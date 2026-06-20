package com.spms.reservation.repository;

import com.spms.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT r FROM Reservation r WHERE r.slotId = :slotId " +
           "AND r.status IN ('PENDING', 'CONFIRMED') " +
           "AND r.startTime < :endTime AND r.endTime > :startTime")
    List<Reservation> findOverlapping(@Param("slotId") Long slotId, 
                                      @Param("startTime") LocalDateTime startTime, 
                                      @Param("endTime") LocalDateTime endTime);

    @Query("SELECT r FROM Reservation r WHERE r.userId = :userId AND r.status IN ('PENDING', 'CONFIRMED') AND r.slotId IN (SELECT s.id FROM ParkingSlot s WHERE s.lotId = :lotId)")
    List<Reservation> findActiveByUserAndLot(@Param("userId") Long userId, @Param("lotId") Long lotId);

    List<Reservation> findByUserIdOrderByStartTimeDesc(Long userId);

    @Query("SELECT r FROM Reservation r WHERE r.status = 'PENDING' AND :now > r.startTime")
    List<Reservation> findPendingBefore(@Param("now") LocalDateTime now);
}
