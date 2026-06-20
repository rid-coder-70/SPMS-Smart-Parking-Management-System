package com.spms.reservation.dto;

import com.spms.reservation.billing.TransactionResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response returned on check-out. Embeds the TransactionResult so the frontend
 * can display the fee and receipt ID immediately without a second request.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckOutResponse {

    private ReservationDto reservation;
    private TransactionResult transaction;
}
