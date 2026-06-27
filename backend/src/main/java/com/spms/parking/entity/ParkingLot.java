package com.spms.parking.entity;

import com.spms.common.enums.LotStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "parking_lots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingLot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String lotName;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(nullable = false)
    private int totalCapacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private LotStatus status = LotStatus.ACTIVE;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdDate = LocalDateTime.now();

    @OneToMany(mappedBy = "parkingLot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ParkingSlot> slots;
}
