package com.spms.parking.service;

import com.spms.common.enums.SlotStatus;
import com.spms.parking.dto.CreateSlotRequest;
import com.spms.parking.dto.ParkingSlotDto;
import com.spms.parking.entity.ParkingSlot;
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
public class ParkingSlotService {
    private final ParkingSlotRepository slotRepository;

    @Transactional
    public ParkingSlotDto addSlot(Long lotId, CreateSlotRequest req) {
        if (slotRepository.existsByLotIdAndSlotNumber(lotId, req.getSlotNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slot number already exists in this lot");
        }

        ParkingSlot slot = ParkingSlot.builder()
                .lotId(lotId)
                .slotNumber(req.getSlotNumber())
                .slotType(req.getSlotType())
                .status(SlotStatus.AVAILABLE)
                .build();
        return mapToDto(slotRepository.save(slot));
    }

    public List<ParkingSlotDto> listSlotsByLot(Long lotId) {
        return slotRepository.findByLotId(lotId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markOutOfService(Long slotId) {
        updateSlotStatus(slotId, SlotStatus.OUT_OF_SERVICE);
    }

    @Transactional
    public void updateSlotStatus(Long slotId, SlotStatus newStatus) {
        ParkingSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slot not found"));
        slot.setStatus(newStatus);
        slotRepository.save(slot);
    }

    private ParkingSlotDto mapToDto(ParkingSlot slot) {
        ParkingSlotDto dto = new ParkingSlotDto();
        dto.setId(slot.getId());
        dto.setLotId(slot.getLotId());
        dto.setSlotNumber(slot.getSlotNumber());
        dto.setSlotType(slot.getSlotType());
        dto.setStatus(slot.getStatus());
        return dto;
    }
}
