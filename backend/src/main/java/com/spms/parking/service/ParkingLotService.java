package com.spms.parking.service;

import com.spms.common.enums.SlotStatus;
import com.spms.common.exception.SpmsException;
import com.spms.parking.dto.CreateLotRequest;
import com.spms.parking.dto.ParkingLotDto;
import com.spms.parking.entity.ParkingLot;
import com.spms.parking.entity.ParkingSlot;
import com.spms.common.enums.LotStatus;
import com.spms.parking.repository.ParkingLotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParkingLotService {

    private final ParkingLotRepository parkingLotRepository;

    @Transactional
    public ParkingLotDto createLot(CreateLotRequest request) {
        ParkingLot lot = ParkingLot.builder()
                .lotName(request.getLotName())
                .location(request.getLocation())
                .totalCapacity(request.getTotalCapacity())
                .status(LotStatus.ACTIVE)
                .build();
        return mapToDto(parkingLotRepository.save(lot));
    }

    @Transactional
    public ParkingLotDto updateLot(Long id, CreateLotRequest request) {
        ParkingLot lot = parkingLotRepository.findById(id)
                .orElseThrow(() -> SpmsException.notFound("ParkingLot", id));
        lot.setLotName(request.getLotName());
        lot.setLocation(request.getLocation());
        lot.setTotalCapacity(request.getTotalCapacity());
        return mapToDto(parkingLotRepository.save(lot));
    }

    @Transactional
    public void deactivateLot(Long id) {
        ParkingLot lot = parkingLotRepository.findById(id)
                .orElseThrow(() -> SpmsException.notFound("ParkingLot", id));
        lot.setStatus(LotStatus.INACTIVE);
        parkingLotRepository.save(lot);
    }

    @Transactional(readOnly = true)
    public List<ParkingLotDto> listActiveLots() {
        return parkingLotRepository.findByStatus(LotStatus.ACTIVE).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public double getOccupancyRate(Long lotId) {
        ParkingLot lot = parkingLotRepository.findById(lotId)
                .orElseThrow(() -> SpmsException.notFound("ParkingLot", lotId));
        
        List<ParkingSlot> slots = lot.getSlots();
        if (slots == null || slots.isEmpty()) {
            return 0.0;
        }

        long nonAvailableCount = slots.stream()
                .filter(slot -> slot.getStatus() != SlotStatus.AVAILABLE)
                .count();

        return ((double) nonAvailableCount / lot.getTotalCapacity()) * 100.0;
    }

    private ParkingLotDto mapToDto(ParkingLot lot) {
        return ParkingLotDto.builder()
                .id(lot.getId())
                .lotName(lot.getLotName())
                .location(lot.getLocation())
                .totalCapacity(lot.getTotalCapacity())
                .status(lot.getStatus())
                .createdDate(lot.getCreatedDate())
                .build();
    }
}
