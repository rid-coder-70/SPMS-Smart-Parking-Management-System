package com.spms.billing.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CheckOutResponse {

    private Long reservationId;
    private Long transactionId;
    private String slotNumber;
    private String lotName;
    private String vehicleNumber;
    private String vehicleType;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private int durationMinutes;
    private int billedHours;
    private BigDecimal baseRate;
    private BigDecimal extendedRate;
    private BigDecimal vehicleMultiplier;
    private BigDecimal subtotal;
    private BigDecimal dailyCap;
    private BigDecimal totalFee;
    private String currency;
}
