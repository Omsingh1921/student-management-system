package com.student.dto.response;

import com.student.enums.EnrollmentStatus;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponseDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseName;
    private LocalDateTime enrollmentDate;
    private EnrollmentStatus status;

}
