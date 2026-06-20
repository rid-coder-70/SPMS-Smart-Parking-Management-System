package com.spms.reservation.service;

import com.spms.common.enums.ReservationStatus;
import com.spms.common.enums.SlotStatus;
import com.spms.parking.service.ParkingSlotService;
import com.spms.reservation.entity.Reservation;
import com.spms.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReservationScheduler {

    private final ReservationRepository reservationRepository;
    private final ParkingSlotService parkingSlotService;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processNoShows() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);
        List<Reservation> noShows = reservationRepository.findPendingBefore(cutoff);

        for (Reservation res : noShows) {
            res.setStatus(ReservationStatus.NO_SHOW);
            reservationRepository.save(res);
            parkingSlotService.updateSlotStatus(res.getSlotId(), SlotStatus.AVAILABLE);
        }
    }
}
