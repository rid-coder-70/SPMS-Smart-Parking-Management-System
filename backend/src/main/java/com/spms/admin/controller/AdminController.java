package com.spms.admin.controller;

import com.spms.admin.dto.*;
import com.spms.admin.service.PricingConfigService;
import com.spms.admin.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final PricingConfigService pricingService;
    private final ReportingService reportingService;

    @GetMapping("/pricing")
    public PricingConfigDto getPricing() {
        return pricingService.get();
    }

    @PutMapping("/pricing")
    public PricingConfigDto updatePricing(@RequestBody PricingConfigDto req) {
        return pricingService.update(req);
    }

    @GetMapping("/reports/utilization")
    public UtilizationReportDto getUtilization(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) Long lotId) {
        return reportingService.getUtilizationReport(from, to, lotId);
    }

    @GetMapping("/reports/revenue")
    public List<RevenueReportDto> getRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "daily") String granularity) {
        return reportingService.getRevenueReport(from, to, granularity);
    }

    @GetMapping("/reports/peak-hours")
    public List<PeakHoursDto> getPeakHours(@RequestParam(required = false) Long lotId) {
        return reportingService.getPeakHours(lotId);
    }
}
