package com.spms.billing.controller;

import com.spms.billing.dto.PricingConfigDto;
import com.spms.billing.service.PricingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/pricing")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class PricingController {

    private final PricingService pricingService;

    @GetMapping
    public PricingConfigDto getPricing() {
        return pricingService.getActivePricing();
    }

    @PutMapping
    public PricingConfigDto updatePricing(@Valid @RequestBody PricingConfigDto dto) {
        return pricingService.updatePricing(dto);
    }
}
