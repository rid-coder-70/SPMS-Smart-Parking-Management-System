package com.spms.billing.dto;

import com.spms.common.enums.PaymentStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionDto {
    private Long id;
    private Long reservationId;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private Integer durationMinutes;
    private BigDecimal totalFee;
    private PaymentStatus paymentStatus;
}
