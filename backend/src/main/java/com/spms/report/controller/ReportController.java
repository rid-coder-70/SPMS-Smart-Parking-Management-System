package com.spms.report.controller;

import com.spms.report.dto.PeakHoursReport;
import com.spms.report.dto.RevenueReport;
import com.spms.report.dto.UtilizationReport;
import com.spms.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/reports")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/utilization")
    public UtilizationReport getUtilization(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) Long lotId) {
        return reportService.getUtilization(from, to, lotId);
    }

    @GetMapping("/revenue")
    public RevenueReport getRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) Long lotId) {
        return reportService.getRevenue(from, to, lotId);
    }

    @GetMapping("/peak-hours")
    public PeakHoursReport getPeakHours(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) Long lotId) {
        return reportService.getPeakHours(from, to, lotId);
    }
}
