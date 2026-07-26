package com.spms.billing.repository;

import com.spms.billing.entity.PricingConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PricingConfigRepository extends JpaRepository<PricingConfig, Long> {

    default PricingConfig getActive() {
        return findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No pricing configuration found"));
    }
}
