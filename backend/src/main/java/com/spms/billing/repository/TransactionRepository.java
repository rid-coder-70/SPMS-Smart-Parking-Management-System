package com.spms.billing.repository;

import com.spms.billing.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByReservationId(Long reservationId);

    List<Transaction> findByUserIdOrderByCreatedDateDesc(Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.createdDate BETWEEN :from AND :to")
    List<Transaction> findByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT t FROM Transaction t WHERE t.slotId IN " +
           "(SELECT s.id FROM ParkingSlot s WHERE s.parkingLot.id = :lotId) " +
           "AND t.createdDate BETWEEN :from AND :to")
    List<Transaction> findByLotAndDateRange(@Param("lotId") Long lotId,
                                            @Param("from") LocalDateTime from,
                                            @Param("to") LocalDateTime to);
}
