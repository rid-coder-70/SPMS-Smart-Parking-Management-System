package com.spms.parking.repository;

import com.spms.parking.entity.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByLotId(Long lotId);
    boolean existsByLotIdAndSlotNumber(Long lotId, String slotNumber);
}
