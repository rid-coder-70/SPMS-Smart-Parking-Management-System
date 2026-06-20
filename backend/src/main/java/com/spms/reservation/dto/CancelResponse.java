package com.spms.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CancelResponse {
    private boolean cancelled;
    private boolean feeApplied;
}
