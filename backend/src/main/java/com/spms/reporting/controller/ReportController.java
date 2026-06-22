package com.spms.reporting.controller;

import com.spms.reporting.dto.OccupancyReportDto;
import com.spms.reporting.dto.RevenueReportDto;
import com.spms.reporting.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * Admin-only reporting endpoints.
 *
 * GET /api/v1/reports/revenue?from=2026-01-01&to=2026-12-31  — revenue summary
 * GET /api/v1/reports/occupancy                               — live occupancy snapshot
 */
@RestController
@RequestMapping("/reports")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/revenue")
    public ResponseEntity<RevenueReportDto> getRevenueReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportService.getRevenueReport(from, to));
    }

    @GetMapping("/occupancy")
    public ResponseEntity<List<OccupancyReportDto>> getOccupancyReport() {
        return ResponseEntity.ok(reportService.getOccupancyReport());
    }
}
