package com.spms.parking.controller;

import com.spms.parking.dto.CreateLotRequest;
import com.spms.parking.dto.ParkingLotDto;
import com.spms.parking.service.ParkingLotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lots")
@RequiredArgsConstructor
public class ParkingLotController {

    private final ParkingLotService parkingLotService;

    @GetMapping
    public List<ParkingLotDto> getActiveLots() {
        return parkingLotService.listActiveLots();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ParkingLotDto createLot(@Valid @RequestBody CreateLotRequest request) {
        return parkingLotService.createLot(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ParkingLotDto updateLot(@PathVariable Long id, @Valid @RequestBody CreateLotRequest request) {
        return parkingLotService.updateLot(id, request);
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateLot(@PathVariable Long id) {
        parkingLotService.deactivateLot(id);
    }
}
