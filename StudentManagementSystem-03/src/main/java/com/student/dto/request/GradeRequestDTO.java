package com.student.dto.request;

import com.student.enums.GradeLetter;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeRequestDTO {
    @NotNull
    private Long studentId;
    @NotNull
    private Long courseId;

    @DecimalMin("0.0") @DecimalMax("100.0")
    private Double marksObtained;

    @NotNull
    private GradeLetter letterGrade;

    private boolean isFinalized;
}