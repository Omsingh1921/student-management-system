package com.student.dto.request;

import com.student.enums.AttendanceStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequestDTO {
    @NotNull
    private Long studentId;
    @NotNull
    private Long courseId;
    @NotNull
    @PastOrPresent
    private LocalDate date;
    @NotNull
    private AttendanceStatus status;
}