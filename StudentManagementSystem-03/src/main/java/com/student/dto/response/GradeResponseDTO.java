package com.student.dto.response;

import com.student.enums.GradeLetter;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeResponseDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseName;
    private Double marksObtained;
    private GradeLetter letterGrade;
    private boolean finalized;
}