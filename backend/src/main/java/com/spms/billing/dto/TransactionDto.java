package com.spms.billing.dto;

import com.spms.common.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for transaction data.
 * Includes reservation context for frontend convenience.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {

    private Long id;
    private Long reservationId;
    private Long userId;
    private String slotNumber;
    private String lotName;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private Long durationMinutes;
    private BigDecimal amount;
    private PaymentStatus paymentStatus;
    private LocalDateTime createdDate;
}
