package com.spms.report.service;

import com.spms.billing.entity.Transaction;
import com.spms.billing.repository.TransactionRepository;
import com.spms.common.enums.ReservationStatus;
import com.spms.parking.repository.ParkingSlotRepository;
import com.spms.report.dto.PeakHoursReport;
import com.spms.report.dto.RevenueReport;
import com.spms.report.dto.UtilizationReport;
import com.spms.reservation.entity.Reservation;
import com.spms.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final ReservationRepository reservationRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    @Transactional(readOnly = true)
    public UtilizationReport getUtilization(LocalDateTime from, LocalDateTime to, Long lotId) {
        List<Transaction> transactions = fetchTransactions(from, to, lotId);

        long completed = transactions.size();
        double avgDuration = transactions.stream()
                .mapToInt(Transaction::getDurationMinutes)
                .average().orElse(0);

        long totalSlots = lotId != null
                ? parkingSlotRepository.findByParkingLotId(lotId).size()
                : parkingSlotRepository.count();

        long totalReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getCreatedDate().isAfter(from) && r.getCreatedDate().isBefore(to))
                .filter(r -> lotId == null || r.getParkingSlot().getParkingLot().getId().equals(lotId))
                .count();

        long cancelled = reservationRepository.findByStatus(ReservationStatus.CANCELLED).stream()
                .filter(r -> r.getCreatedDate().isAfter(from) && r.getCreatedDate().isBefore(to))
                .count();

        long noShows = reservationRepository.findByStatus(ReservationStatus.NO_SHOW).stream()
                .filter(r -> r.getCreatedDate().isAfter(from) && r.getCreatedDate().isBefore(to))
                .count();

        double occupancy = totalSlots > 0 ? (completed * 100.0 / totalSlots) : 0;

        return UtilizationReport.builder()
                .totalReservations(totalReservations)
                .completedReservations(completed)
                .cancelledReservations(cancelled)
                .noShowReservations(noShows)
                .avgDurationMinutes(Math.round(avgDuration * 10) / 10.0)
                .occupancyRatePercent(Math.round(occupancy * 10) / 10.0)
                .build();
    }

    @Transactional(readOnly = true)
    public RevenueReport getRevenue(LocalDateTime from, LocalDateTime to, Long lotId) {
        List<Transaction> transactions = fetchTransactions(from, to, lotId);

        BigDecimal totalRevenue = transactions.stream()
                .map(Transaction::getTotalFee)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgValue = transactions.isEmpty()
                ? BigDecimal.ZERO
                : totalRevenue.divide(BigDecimal.valueOf(transactions.size()), 2, RoundingMode.HALF_UP);

        Map<String, BigDecimal> dailyRevenue = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getCheckOutTime().toLocalDate().toString(),
                        TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getTotalFee, BigDecimal::add)
                ));

        return RevenueReport.builder()
                .totalRevenue(totalRevenue)
                .totalTransactions((long) transactions.size())
                .avgTransactionValue(avgValue)
                .dailyRevenue(dailyRevenue)
                .build();
    }

    @Transactional(readOnly = true)
    public PeakHoursReport getPeakHours(LocalDateTime from, LocalDateTime to, Long lotId) {
        List<Transaction> transactions = fetchTransactions(from, to, lotId);

        Map<Integer, Long> hourly = new TreeMap<>();
        for (int h = 0; h < 24; h++) hourly.put(h, 0L);

        Map<String, Long> daily = new LinkedHashMap<>();
        for (String day : List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY")) {
            daily.put(day, 0L);
        }

        for (Transaction t : transactions) {
            int hour = t.getCheckInTime().getHour();
            hourly.merge(hour, 1L, Long::sum);

            String dayName = t.getCheckInTime().getDayOfWeek()
                    .getDisplayName(TextStyle.FULL, Locale.ENGLISH).toUpperCase();
            daily.merge(dayName, 1L, Long::sum);
        }

        int peakHour = hourly.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey).orElse(0);

        String peakDay = daily.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey).orElse("MONDAY");

        return PeakHoursReport.builder()
                .hourlyDistribution(hourly)
                .dayOfWeekDistribution(daily)
                .peakHour(peakHour)
                .peakDay(peakDay)
                .build();
    }

    private List<Transaction> fetchTransactions(LocalDateTime from, LocalDateTime to, Long lotId) {
        if (lotId != null) {
            return transactionRepository.findByLotAndDateRange(lotId, from, to);
        }
        return transactionRepository.findByDateRange(from, to);
    }
}
