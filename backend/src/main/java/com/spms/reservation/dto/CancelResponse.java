package com.spms.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response for cancel operations.
 * {@code feeApplied} is true when the cancellation is within 60 minutes
 * of the reservation start time — the Billing module handles the actual charge.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelResponse {

    private boolean cancelled;
    private boolean feeApplied;
}
