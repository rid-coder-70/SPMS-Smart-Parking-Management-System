package com.spms.reservation.billing;

import java.math.BigDecimal;

/**
 * Result of a billing checkout operation.
 * The Billing module (com.spms.billing) returns this record after processing.
 *
 * @param totalFee  The calculated parking fee.
 * @param receiptId The ID of the generated receipt/transaction record.
 */
public record TransactionResult(BigDecimal totalFee, Long receiptId) {}
