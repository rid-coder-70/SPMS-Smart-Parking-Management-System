package com.spms.parking.controller;

import com.spms.parking.dto.CreateSlotRequest;
import com.spms.parking.dto.ParkingSlotDto;
import com.spms.parking.service.ParkingSlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ParkingSlotController {

    private final ParkingSlotService parkingSlotService;

    @GetMapping("/lots/{lotId}/slots")
    public List<ParkingSlotDto> getSlotsByLot(@PathVariable Long lotId) {
        return parkingSlotService.listSlotsByLot(lotId);
    }

    @PostMapping("/lots/{lotId}/slots")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ParkingSlotDto addSlot(@PathVariable Long lotId, @Valid @RequestBody CreateSlotRequest request) {
        request.setLotId(lotId);
        return parkingSlotService.addSlot(lotId, request);
    }

    @PutMapping("/slots/{id}/out-of-service")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markOutOfService(@PathVariable Long id) {
        parkingSlotService.markOutOfService(id);
    }
}
