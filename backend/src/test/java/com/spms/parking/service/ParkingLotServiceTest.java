package com.spms.parking.service;

import com.spms.common.enums.SlotStatus;
import com.spms.parking.entity.ParkingLot;
import com.spms.parking.entity.ParkingSlot;
import com.spms.common.enums.LotStatus;
import com.spms.parking.repository.ParkingLotRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ParkingLotServiceTest {

    @Mock
    private ParkingLotRepository parkingLotRepository;

    @InjectMocks
    private ParkingLotService parkingLotService;

    @Test
    void getOccupancyRate_ReturnsCorrectPercentage() {
        Long lotId = 1L;
        ParkingLot lot = ParkingLot.builder()
                .id(lotId)
                .totalCapacity(10)
                .slots(List.of(
                        ParkingSlot.builder().status(SlotStatus.AVAILABLE).build(),
                        ParkingSlot.builder().status(SlotStatus.OCCUPIED).build(),
                        ParkingSlot.builder().status(SlotStatus.RESERVED).build(),
                        ParkingSlot.builder().status(SlotStatus.OUT_OF_SERVICE).build(),
                        ParkingSlot.builder().status(SlotStatus.AVAILABLE).build()
                ))
                .build();

        when(parkingLotRepository.findById(lotId)).thenReturn(Optional.of(lot));

        double occupancyRate = parkingLotService.getOccupancyRate(lotId);

        assertEquals(30.0, occupancyRate);
    }

    @Test
    void deactivateLot_UpdatesStatusWithoutDeletingSlots() {
        Long lotId = 1L;
        ParkingLot lot = ParkingLot.builder()
                .id(lotId)
                .status(LotStatus.ACTIVE)
                .slots(List.of(ParkingSlot.builder().build()))
                .build();

        when(parkingLotRepository.findById(lotId)).thenReturn(Optional.of(lot));

        parkingLotService.deactivateLot(lotId);

        assertEquals(LotStatus.INACTIVE, lot.getStatus());
        assertEquals(1, lot.getSlots().size());
        verify(parkingLotRepository).save(lot);
    }
}
