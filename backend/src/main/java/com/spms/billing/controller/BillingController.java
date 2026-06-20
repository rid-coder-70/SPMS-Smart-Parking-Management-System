package com.spms.billing.controller;

import com.spms.auth.entity.User;
import com.spms.billing.dto.ReceiptDto;
import com.spms.billing.dto.TransactionDto;
import com.spms.billing.entity.Transaction;
import com.spms.billing.repository.TransactionRepository;
import com.spms.common.enums.PaymentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BillingController {

    private final TransactionRepository transactionRepository;

    private Long getUserId(UserDetails userDetails) {
        if (userDetails instanceof User) {
            return ((User) userDetails).getId();
        }
        return null;
    }

    @GetMapping("/users/me/transactions")
    public List<TransactionDto> getMyTransactions(@AuthenticationPrincipal UserDetails userDetails) {
        return transactionRepository.findByUserIdOrderByCreatedDateDesc(getUserId(userDetails)).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/transactions/{id}")
    public TransactionDto getTransaction(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Transaction tx = transactionRepository.findById(id).orElseThrow();
        if (!tx.getUserId().equals(getUserId(userDetails))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return mapToDto(tx);
    }

    @GetMapping("/transactions/{id}/receipt")
    public ReceiptDto getReceipt(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Transaction tx = transactionRepository.findById(id).orElseThrow();
        if (!tx.getUserId().equals(getUserId(userDetails))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        ReceiptDto dto = new ReceiptDto();
        dto.setTransactionId(tx.getId());
        dto.setCheckInTime(tx.getCheckInTime());
        dto.setCheckOutTime(tx.getCheckOutTime());
        dto.setDurationMinutes(tx.getDurationMinutes());
        dto.setTotalFee(tx.getTotalFee());
        return dto;
    }

    @PostMapping("/payments")
    public void simulatePayment(@RequestParam Long transactionId) {
        Transaction tx = transactionRepository.findById(transactionId).orElseThrow();
        tx.setPaymentStatus(PaymentStatus.PAID);
        transactionRepository.save(tx);
    }

    private TransactionDto mapToDto(Transaction tx) {
        TransactionDto dto = new TransactionDto();
        dto.setId(tx.getId());
        dto.setReservationId(tx.getReservationId());
        dto.setCheckInTime(tx.getCheckInTime());
        dto.setCheckOutTime(tx.getCheckOutTime());
        dto.setDurationMinutes(tx.getDurationMinutes());
        dto.setTotalFee(tx.getTotalFee());
        dto.setPaymentStatus(tx.getPaymentStatus());
        return dto;
    }
}
