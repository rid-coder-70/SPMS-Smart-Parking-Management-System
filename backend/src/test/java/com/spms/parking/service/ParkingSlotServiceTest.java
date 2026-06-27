package com.spms.parking.service;

import com.spms.common.enums.VehicleType;
import com.spms.common.exception.SpmsException;
import com.spms.parking.dto.CreateSlotRequest;
import com.spms.parking.entity.ParkingLot;
import com.spms.parking.repository.ParkingLotRepository;
import com.spms.parking.repository.ParkingSlotRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ParkingSlotServiceTest {

    @Mock
    private ParkingSlotRepository parkingSlotRepository;

    @Mock
    private ParkingLotRepository parkingLotRepository;

    @InjectMocks
    private ParkingSlotService parkingSlotService;

    @Test
    void addSlot_DuplicateSlotNumber_ThrowsConflictException() {
        // Arrange
        Long lotId = 1L;
        CreateSlotRequest request = CreateSlotRequest.builder()
                .slotNumber("A-101")
                .slotType(VehicleType.STANDARD)
                .build();

        ParkingLot lot = ParkingLot.builder().id(lotId).totalCapacity(100).build();

        when(parkingLotRepository.findById(lotId)).thenReturn(Optional.of(lot));
        when(parkingSlotRepository.existsByParkingLotIdAndSlotNumber(lotId, "A-101")).thenReturn(true);

        // Act & Assert
        SpmsException exception = assertThrows(SpmsException.class, () -> parkingSlotService.addSlot(lotId, request));
        assertEquals("Slot number already exists in this parking lot.", exception.getMessage());
        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
    }
}
