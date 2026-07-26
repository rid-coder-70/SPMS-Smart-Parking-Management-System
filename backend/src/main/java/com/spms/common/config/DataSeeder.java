package com.spms.common.config;

import com.spms.auth.entity.User;
import com.spms.auth.repository.UserRepository;
import com.spms.common.enums.AccountStatus;
import com.spms.common.enums.Role;
import com.spms.billing.entity.PricingConfig;
import com.spms.billing.repository.PricingConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PricingConfigRepository pricingConfigRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .email("admin@spms.com")
                    .role(Role.ADMIN)
                    .accountStatus(AccountStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created: admin / admin123");
        }

        if (pricingConfigRepository.count() == 0) {
            PricingConfig defaultConfig = PricingConfig.builder()
                    .baseHourlyRate(new BigDecimal("40.00"))
                    .extendedHourlyRate(new BigDecimal("30.00"))
                    .baseHoursThreshold(3)
                    .dailyMaxCap(new BigDecimal("300.00"))
                    .motorcycleMultiplier(new BigDecimal("0.50"))
                    .standardMultiplier(new BigDecimal("1.00"))
                    .largeMultiplier(new BigDecimal("1.50"))
                    .build();
            pricingConfigRepository.save(defaultConfig);
            log.info("Default BDT pricing configuration seeded");
        }
    }
}
