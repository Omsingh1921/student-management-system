package com.student.dto.request;
//import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentRequestDTO {
    @NotNull
    private Long studentId;
    @NotNull
    private Long courseId;
//    @NotNull
//    private LocalDate enrollmentDate; 
}