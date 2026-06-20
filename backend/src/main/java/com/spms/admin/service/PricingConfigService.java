package com.spms.admin.service;

import com.spms.admin.dto.PricingConfigDto;
import com.spms.admin.entity.PricingConfig;
import com.spms.admin.repository.PricingConfigRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PricingConfigService {

    private final PricingConfigRepository repository;

    @PostConstruct
    @Transactional
    public void seed() {
        if (repository.count() == 0) {
            PricingConfig config = PricingConfig.builder()
                    .baseRate(new BigDecimal("2.00"))
                    .extendedRate(new BigDecimal("1.50"))
                    .dailyCap(new BigDecimal("15.00"))
                    .motorcycleMultiplier(new BigDecimal("0.50"))
                    .largeMultiplier(new BigDecimal("1.50"))
                    .build();
            repository.save(config);
        }
    }

    public PricingConfigDto get() {
        PricingConfig config = repository.findAll().stream().findFirst().orElseThrow();
        return mapToDto(config);
    }

    @Transactional
    public PricingConfigDto update(PricingConfigDto dto) {
        PricingConfig config = repository.findAll().stream().findFirst().orElseThrow();
        config.setBaseRate(dto.getBaseRate());
        config.setExtendedRate(dto.getExtendedRate());
        config.setDailyCap(dto.getDailyCap());
        config.setMotorcycleMultiplier(dto.getMotorcycleMultiplier());
        config.setLargeMultiplier(dto.getLargeMultiplier());
        return mapToDto(repository.save(config));
    }

    private PricingConfigDto mapToDto(PricingConfig config) {
        PricingConfigDto dto = new PricingConfigDto();
        dto.setBaseRate(config.getBaseRate());
        dto.setExtendedRate(config.getExtendedRate());
        dto.setDailyCap(config.getDailyCap());
        dto.setMotorcycleMultiplier(config.getMotorcycleMultiplier());
        dto.setLargeMultiplier(config.getLargeMultiplier());
        return dto;
    }
}
