package com.spms.parking;

import com.spms.common.enums.SlotStatus;
import com.spms.common.enums.VehicleType;
import com.spms.parking.dto.CreateLotRequest;
import com.spms.parking.dto.CreateSlotRequest;
import com.spms.parking.entity.ParkingLot;
import com.spms.parking.entity.ParkingSlot;
import com.spms.parking.repository.ParkingLotRepository;
import com.spms.parking.repository.ParkingSlotRepository;
import com.spms.parking.service.ParkingLotService;
import com.spms.parking.service.ParkingSlotService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ParkingModuleTests {

    @Mock
    private ParkingLotRepository lotRepository;

    @Mock
    private ParkingSlotRepository slotRepository;

    @InjectMocks
    private ParkingLotService lotService;

    @InjectMocks
    private ParkingSlotService slotService;

    @Test
    void testDuplicateSlotRejected() {
        Long lotId = 1L;
        CreateSlotRequest req = new CreateSlotRequest();
        req.setSlotNumber("A1");
        req.setSlotType(VehicleType.STANDARD);

        when(slotRepository.existsByLotIdAndSlotNumber(lotId, "A1")).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> {
            slotService.addSlot(lotId, req);
        });
    }

    @Test
    void testOccupancyRate() {
        Long lotId = 1L;
        ParkingSlot s1 = new ParkingSlot(); s1.setStatus(SlotStatus.AVAILABLE);
        ParkingSlot s2 = new ParkingSlot(); s2.setStatus(SlotStatus.OCCUPIED);
        ParkingSlot s3 = new ParkingSlot(); s3.setStatus(SlotStatus.RESERVED);
        ParkingSlot s4 = new ParkingSlot(); s4.setStatus(SlotStatus.OUT_OF_SERVICE);

        when(slotRepository.findByLotId(lotId)).thenReturn(Arrays.asList(s1, s2, s3, s4));

        double rate = lotService.getOccupancyRate(lotId);
        // 3 out of 4 are not AVAILABLE -> 0.75
        assertEquals(0.75, rate, 0.001);
    }

    @Test
    void testDeactivateLotDoesNotDeleteSlots() {
        Long lotId = 1L;
        ParkingLot lot = new ParkingLot();
        lot.setId(lotId);
        lot.setStatus("ACTIVE");

        when(lotRepository.findById(lotId)).thenReturn(Optional.of(lot));

        lotService.deactivateLot(lotId);

        assertEquals("INACTIVE", lot.getStatus());
        verify(lotRepository).save(lot);
        verify(slotRepository, never()).deleteAll(any());
        verify(slotRepository, never()).delete(any());
    }
}
