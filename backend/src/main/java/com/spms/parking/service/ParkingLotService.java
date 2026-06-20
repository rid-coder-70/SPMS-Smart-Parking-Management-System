package com.spms.parking.service;

import com.spms.common.enums.SlotStatus;
import com.spms.parking.dto.CreateLotRequest;
import com.spms.parking.dto.ParkingLotDto;
import com.spms.parking.entity.ParkingLot;
import com.spms.parking.entity.ParkingSlot;
import com.spms.parking.repository.ParkingLotRepository;
import com.spms.parking.repository.ParkingSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParkingLotService {
    private final ParkingLotRepository lotRepository;
    private final ParkingSlotRepository slotRepository;

    @Transactional
    public ParkingLotDto createLot(CreateLotRequest req) {
        ParkingLot lot = ParkingLot.builder()
                .lotName(req.getLotName())
                .location(req.getLocation())
                .totalCapacity(req.getTotalCapacity())
                .status("ACTIVE")
                .build();
        return mapToDto(lotRepository.save(lot));
    }

    @Transactional
    public ParkingLotDto updateLot(Long id, CreateLotRequest req) {
        ParkingLot lot = lotRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot not found"));
        lot.setLotName(req.getLotName());
        lot.setLocation(req.getLocation());
        lot.setTotalCapacity(req.getTotalCapacity());
        return mapToDto(lotRepository.save(lot));
    }

    @Transactional
    public void deactivateLot(Long id) {
        ParkingLot lot = lotRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot not found"));
        lot.setStatus("INACTIVE");
        lotRepository.save(lot);
    }

    public List<ParkingLotDto> listActiveLots() {
        return lotRepository.findByStatus("ACTIVE").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public double getOccupancyRate(Long lotId) {
        List<ParkingSlot> slots = slotRepository.findByLotId(lotId);
        if (slots.isEmpty()) return 0.0;
        
        long occupiedOrReserved = slots.stream()
                .filter(s -> s.getStatus() != SlotStatus.AVAILABLE)
                .count();
        return (double) occupiedOrReserved / slots.size();
    }

    private ParkingLotDto mapToDto(ParkingLot lot) {
        ParkingLotDto dto = new ParkingLotDto();
        dto.setId(lot.getId());
        dto.setLotName(lot.getLotName());
        dto.setLocation(lot.getLocation());
        dto.setTotalCapacity(lot.getTotalCapacity());
        dto.setStatus(lot.getStatus());
        return dto;
    }
}
