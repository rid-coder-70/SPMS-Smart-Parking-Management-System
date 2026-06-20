package com.spms.billing.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ReceiptDto {
    private Long transactionId;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private Integer durationMinutes;
    private BigDecimal totalFee;
    
    private String userName;
    private String vehicleNumber;
    private String slotNumber;
}
