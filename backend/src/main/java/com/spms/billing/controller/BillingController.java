package com.spms.billing.controller;

import com.spms.auth.entity.User;
import com.spms.billing.dto.TransactionDto;
import com.spms.billing.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Billing endpoints.
 *
 * POST /api/v1/billing/check-in/{reservationId}  — record vehicle arrival
 * POST /api/v1/billing/check-out/{transactionId}  — record departure + compute fee
 * GET  /api/v1/billing/transactions/{id}          — get receipt detail
 * GET  /api/v1/billing/my                         — user's own transactions
 */
@RestController
@RequestMapping("/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/check-in/{reservationId}")
    public ResponseEntity<TransactionDto> checkIn(@PathVariable Long reservationId) {
        TransactionDto dto = billingService.checkIn(reservationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PostMapping("/check-out/{transactionId}")
    public ResponseEntity<TransactionDto> checkOut(@PathVariable Long transactionId) {
        return ResponseEntity.ok(billingService.checkOut(transactionId));
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<TransactionDto> getTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getTransactionById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TransactionDto>> getMyTransactions(
            @AuthenticationPrincipal User principal) {
        return ResponseEntity.ok(billingService.getUserTransactions(principal.getId()));
    }
}
