package com.spms.reporting.service;

import com.spms.billing.entity.Transaction;
import com.spms.billing.repository.TransactionRepository;
import com.spms.common.enums.SlotStatus;
import com.spms.parking.entity.ParkingLot;
import com.spms.parking.entity.ParkingSlot;
import com.spms.parking.enums.LotStatus;
import com.spms.parking.repository.ParkingLotRepository;
import com.spms.reporting.dto.OccupancyReportDto;
import com.spms.reporting.dto.RevenueReportDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Reporting service — generates admin-only aggregate reports.
 *
 * Revenue report:   aggregates paid transactions in a date range.
 * Occupancy report: real-time snapshot of all active lots.
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final ParkingLotRepository  parkingLotRepository;

    // ── Revenue Report ────────────────────────────────────────

    @Transactional(readOnly = true)
    public RevenueReportDto getRevenueReport(LocalDate from, LocalDate to) {
        List<Transaction> transactions = transactionRepository.findPaidTransactionsBetween(
                from.atStartOfDay(),
                to.atTime(LocalTime.MAX));

        BigDecimal totalRevenue = transactions.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long count = transactions.size();

        BigDecimal averageFee = count > 0
                ? totalRevenue.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return RevenueReportDto.builder()
                .totalRevenue(totalRevenue)
                .totalTransactions(count)
                .averageFee(averageFee)
                .fromDate(from)
                .toDate(to)
                .build();
    }

    // ── Occupancy Report ──────────────────────────────────────

    @Transactional(readOnly = true)
    public List<OccupancyReportDto> getOccupancyReport() {
        return parkingLotRepository.findByStatus(LotStatus.ACTIVE)
                .stream()
                .map(this::buildOccupancyDto)
                .collect(Collectors.toList());
    }

    private OccupancyReportDto buildOccupancyDto(ParkingLot lot) {
        List<ParkingSlot> slots = lot.getSlots();

        long occupied = 0;
        long available = 0;

        if (slots != null) {
            for (ParkingSlot slot : slots) {
                if (slot.getStatus() == SlotStatus.AVAILABLE) {
                    available++;
                } else {
                    occupied++;
                }
            }
        }

        double percent = lot.getTotalCapacity() > 0
                ? ((double) occupied / lot.getTotalCapacity()) * 100.0
                : 0.0;

        return OccupancyReportDto.builder()
                .lotId(lot.getId())
                .lotName(lot.getLotName())
                .totalCapacity(lot.getTotalCapacity())
                .occupiedSlots(occupied)
                .availableSlots(available)
                .occupancyPercent(Math.round(percent * 100.0) / 100.0)
                .build();
    }
}
