package com.spms.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PeakHoursDto {
    private int hourOfDay;
    private String dayOfWeek;
    private int reservationCount;
}
