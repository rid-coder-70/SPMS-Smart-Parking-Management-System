package com.spms.parking.service;

import com.spms.common.enums.SlotStatus;
import com.spms.common.exception.SpmsException;
import com.spms.parking.dto.BulkCreateSlotsRequest;
import com.spms.parking.dto.CreateSlotRequest;
import com.spms.parking.dto.ParkingSlotDto;
import com.spms.parking.entity.ParkingLot;
import com.spms.parking.entity.ParkingSlot;
import com.spms.parking.repository.ParkingLotRepository;
import com.spms.parking.repository.ParkingSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParkingSlotService {

    private final ParkingSlotRepository parkingSlotRepository;
    private final ParkingLotRepository parkingLotRepository;

    @Transactional
    public ParkingSlotDto addSlot(Long lotId, CreateSlotRequest request) {
        ParkingLot lot = parkingLotRepository.findById(lotId)
                .orElseThrow(() -> SpmsException.notFound("ParkingLot", lotId));

        if (parkingSlotRepository.existsByParkingLotIdAndSlotNumber(lotId, request.getSlotNumber())) {
            throw SpmsException.conflict("Slot number already exists in this parking lot.");
        }

        if (lot.getSlots() != null && lot.getSlots().size() >= lot.getTotalCapacity()) {
            throw SpmsException.badRequest("Cannot add more slots; total capacity reached.");
        }

        ParkingSlot slot = ParkingSlot.builder()
                .parkingLot(lot)
                .slotNumber(request.getSlotNumber())
                .slotType(request.getSlotType())
                .status(SlotStatus.AVAILABLE)
                .build();

        return mapToDto(parkingSlotRepository.save(slot));
    }

    @Transactional
    public List<ParkingSlotDto> bulkAddSlots(Long lotId, BulkCreateSlotsRequest request) {
        ParkingLot lot = parkingLotRepository.findById(lotId)
                .orElseThrow(() -> SpmsException.notFound("ParkingLot", lotId));

        int currentSlotCount = lot.getSlots() != null ? lot.getSlots().size() : 0;
        if (currentSlotCount + request.getCount() > lot.getTotalCapacity()) {
            throw SpmsException.badRequest("Cannot add slots; total capacity would be exceeded.");
        }

        String prefix = request.getPrefix() != null ? request.getPrefix() : "";
        List<ParkingSlot> newSlots = new ArrayList<>();

        Set<String> existingNumbers = parkingSlotRepository.findByParkingLotId(lotId).stream()
                .map(ParkingSlot::getSlotNumber)
                .collect(Collectors.toSet());

        int added = 0;
        int index = 1;
        while (added < request.getCount()) {
            String slotNum = prefix + index;
            if (!existingNumbers.contains(slotNum)) {
                ParkingSlot slot = ParkingSlot.builder()
                        .parkingLot(lot)
                        .slotNumber(slotNum)
                        .slotType(request.getSlotType())
                        .status(SlotStatus.AVAILABLE)
                        .build();
                newSlots.add(slot);
                added++;
            }
            index++;
        }

        return parkingSlotRepository.saveAll(newSlots).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ParkingSlotDto> listSlotsByLot(Long lotId) {
        if (!parkingLotRepository.existsById(lotId)) {
            throw SpmsException.notFound("ParkingLot", lotId);
        }
        return parkingSlotRepository.findByParkingLotId(lotId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markOutOfService(Long slotId) {
        updateSlotStatus(slotId, SlotStatus.OUT_OF_SERVICE);
    }

    @Transactional
    public void updateSlotStatus(Long slotId, SlotStatus newStatus) {
        ParkingSlot slot = parkingSlotRepository.findById(slotId)
                .orElseThrow(() -> SpmsException.notFound("ParkingSlot", slotId));
        slot.setStatus(newStatus);
        parkingSlotRepository.save(slot);
    }

    private ParkingSlotDto mapToDto(ParkingSlot slot) {
        return ParkingSlotDto.builder()
                .id(slot.getId())
                .lotId(slot.getParkingLot().getId())
                .slotNumber(slot.getSlotNumber())
                .slotType(slot.getSlotType())
                .status(slot.getStatus())
                .build();
    }
}
