package com.spms.parking.controller;

import com.spms.parking.dto.CreateSlotRequest;
import com.spms.parking.dto.ParkingSlotDto;
import com.spms.parking.service.ParkingSlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ParkingSlotController {

    private final ParkingSlotService slotService;

    @GetMapping("/lots/{lotId}/slots")
    public List<ParkingSlotDto> getSlots(@PathVariable Long lotId) {
        return slotService.listSlotsByLot(lotId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/lots/{lotId}/slots")
    public ParkingSlotDto addSlot(@PathVariable Long lotId, @Valid @RequestBody CreateSlotRequest req) {
        return slotService.addSlot(lotId, req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/slots/{id}/out-of-service")
    public void markOutOfService(@PathVariable Long id) {
        slotService.markOutOfService(id);
    }
}
