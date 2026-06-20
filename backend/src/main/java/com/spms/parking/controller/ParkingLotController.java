package com.spms.parking.controller;

import com.spms.parking.dto.CreateLotRequest;
import com.spms.parking.dto.ParkingLotDto;
import com.spms.parking.service.ParkingLotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lots")
@RequiredArgsConstructor
public class ParkingLotController {

    private final ParkingLotService lotService;

    @GetMapping
    public List<ParkingLotDto> getActiveLots() {
        return lotService.listActiveLots();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ParkingLotDto createLot(@Valid @RequestBody CreateLotRequest req) {
        return lotService.createLot(req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ParkingLotDto updateLot(@PathVariable Long id, @Valid @RequestBody CreateLotRequest req) {
        return lotService.updateLot(id, req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/deactivate")
    public void deactivateLot(@PathVariable Long id) {
        lotService.deactivateLot(id);
    }
}
