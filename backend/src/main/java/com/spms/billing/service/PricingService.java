package com.spms.billing.service;

import com.spms.billing.dto.PricingConfigDto;
import com.spms.billing.entity.PricingConfig;
import com.spms.billing.repository.PricingConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PricingService {

    private final PricingConfigRepository pricingConfigRepository;

    @Transactional(readOnly = true)
    public PricingConfigDto getActivePricing() {
        return toDto(pricingConfigRepository.getActive());
    }

    @Transactional
    public PricingConfigDto updatePricing(PricingConfigDto dto) {
        PricingConfig config = pricingConfigRepository.getActive();
        config.setBaseHourlyRate(dto.getBaseHourlyRate());
        config.setExtendedHourlyRate(dto.getExtendedHourlyRate());
        config.setBaseHoursThreshold(dto.getBaseHoursThreshold());
        config.setDailyMaxCap(dto.getDailyMaxCap());
        config.setMotorcycleMultiplier(dto.getMotorcycleMultiplier());
        config.setStandardMultiplier(dto.getStandardMultiplier());
        config.setLargeMultiplier(dto.getLargeMultiplier());
        return toDto(pricingConfigRepository.save(config));
    }

    private PricingConfigDto toDto(PricingConfig c) {
        return PricingConfigDto.builder()
                .id(c.getId())
                .baseHourlyRate(c.getBaseHourlyRate())
                .extendedHourlyRate(c.getExtendedHourlyRate())
                .baseHoursThreshold(c.getBaseHoursThreshold())
                .dailyMaxCap(c.getDailyMaxCap())
                .motorcycleMultiplier(c.getMotorcycleMultiplier())
                .standardMultiplier(c.getStandardMultiplier())
                .largeMultiplier(c.getLargeMultiplier())
                .build();
    }
}
