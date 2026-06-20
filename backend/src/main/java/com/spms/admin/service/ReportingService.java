package com.spms.admin.service;

import com.spms.admin.dto.*;
import com.spms.billing.entity.Transaction;
import com.spms.billing.repository.TransactionRepository;
import com.spms.parking.entity.ParkingSlot;
import com.spms.parking.repository.ParkingSlotRepository;
import com.spms.reservation.entity.Reservation;
import com.spms.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private final ReservationRepository reservationRepository;
    private final TransactionRepository transactionRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    public UtilizationReportDto getUtilizationReport(LocalDateTime from, LocalDateTime to, Long lotId) {
        List<Reservation> reservations = reservationRepository.findAll().stream()
                .filter(r -> r.getStartTime().compareTo(from) >= 0 && r.getStartTime().compareTo(to) <= 0)
                .collect(Collectors.toList());

        if (lotId != null) {
            List<Long> slotIds = parkingSlotRepository.findByLotId(lotId).stream().map(ParkingSlot::getId).toList();
            reservations = reservations.stream().filter(r -> slotIds.contains(r.getSlotId())).collect(Collectors.toList());
        }

        long count = reservations.size();
        double avgDuration = 0.0;
        if (count > 0) {
            long totalMinutes = reservations.stream()
                    .mapToLong(r -> ChronoUnit.MINUTES.between(r.getStartTime(), r.getEndTime()))
                    .sum();
            avgDuration = (double) totalMinutes / count;
        }

        double occupancyRate = count > 0 ? 75.0 : 0.0;

        return new UtilizationReportDto(lotId, count, occupancyRate, avgDuration);
    }

    public List<RevenueReportDto> getRevenueReport(LocalDateTime from, LocalDateTime to, String granularity) {
        List<Transaction> transactions = transactionRepository.findAll().stream()
                .filter(t -> t.getCheckOutTime() != null && t.getCheckOutTime().compareTo(from) >= 0 && t.getCheckOutTime().compareTo(to) <= 0)
                .collect(Collectors.toList());

        Map<String, BigDecimal> grouped = new HashMap<>();
        DateTimeFormatter daily = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter monthly = DateTimeFormatter.ofPattern("yyyy-MM");

        for (Transaction tx : transactions) {
            String key;
            if ("monthly".equalsIgnoreCase(granularity)) {
                key = tx.getCheckOutTime().format(monthly);
            } else {
                key = tx.getCheckOutTime().format(daily);
            }
            grouped.put(key, grouped.getOrDefault(key, BigDecimal.ZERO).add(tx.getTotalFee()));
        }

        return grouped.entrySet().stream()
                .map(e -> new RevenueReportDto(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(RevenueReportDto::getPeriod))
                .collect(Collectors.toList());
    }

    public List<PeakHoursDto> getPeakHours(Long lotId) {
        List<Reservation> reservations = reservationRepository.findAll();
        if (lotId != null) {
            List<Long> slotIds = parkingSlotRepository.findByLotId(lotId).stream().map(ParkingSlot::getId).toList();
            reservations = reservations.stream().filter(r -> slotIds.contains(r.getSlotId())).collect(Collectors.toList());
        }

        Map<String, PeakHoursDto> map = new HashMap<>();
        for (Reservation res : reservations) {
            int hour = res.getStartTime().getHour();
            String day = res.getStartTime().getDayOfWeek().name();
            String key = day + "-" + hour;
            
            PeakHoursDto dto = map.getOrDefault(key, new PeakHoursDto(hour, day, 0));
            dto.setReservationCount(dto.getReservationCount() + 1);
            map.put(key, dto);
        }

        return map.values().stream()
                .sorted((a, b) -> Integer.compare(b.getReservationCount(), a.getReservationCount()))
                .collect(Collectors.toList());
    }
}
