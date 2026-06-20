package com.spms.parking.repository;

import com.spms.parking.entity.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByParkingLotId(Long parkingLotId);
    boolean existsByParkingLotIdAndSlotNumber(Long parkingLotId, String slotNumber);
}
