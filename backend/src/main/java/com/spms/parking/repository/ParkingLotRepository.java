package com.spms.parking.repository;

import com.spms.parking.entity.ParkingLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.spms.common.enums.LotStatus;

@Repository
public interface ParkingLotRepository extends JpaRepository<ParkingLot, Long> {
    List<ParkingLot> findByStatus(LotStatus status);
}
