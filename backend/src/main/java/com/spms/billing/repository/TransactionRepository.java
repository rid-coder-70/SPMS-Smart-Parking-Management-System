package com.spms.billing.repository;

import com.spms.billing.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /** Find the transaction associated with a reservation. */
    Optional<Transaction> findByReservationId(Long reservationId);

    /** Check if a transaction already exists for a reservation (prevent duplicate check-in). */
    boolean existsByReservationId(Long reservationId);

    /** Find all transactions for a user (via the reservation's userId). */
    @Query("SELECT t FROM Transaction t WHERE t.reservation.userId = :userId " +
           "ORDER BY t.createdDate DESC")
    List<Transaction> findByUserId(@Param("userId") Long userId);

    /** Paid transactions within a date range — used for revenue reports. */
    @Query("SELECT t FROM Transaction t " +
           "WHERE t.paymentStatus = com.spms.common.enums.PaymentStatus.PAID " +
           "AND t.checkOutTime BETWEEN :from AND :to")
    List<Transaction> findPaidTransactionsBetween(@Param("from") LocalDateTime from,
                                                  @Param("to") LocalDateTime to);
}
