package com.spms.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pricing_config")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EntityListeners(AuditingEntityListener.class)
public class PricingConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseRate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal extendedRate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyCap;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal motorcycleMultiplier;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal largeMultiplier;

    @LastModifiedDate
    private LocalDateTime updatedDate;
}
