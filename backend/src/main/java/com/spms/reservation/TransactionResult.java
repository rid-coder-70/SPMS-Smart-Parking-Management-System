package com.spms.reservation;

import java.math.BigDecimal;

public record TransactionResult(BigDecimal totalFee, Long receiptId) {}
