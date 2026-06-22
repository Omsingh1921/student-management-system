package com.student.dto.request;


import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseRequestDTO {
    @NotBlank
    private String name;

    @NotBlank
    private String code;

    @Min(1) @Max(6)
    private Integer credits;

    @NotBlank
    private String semester;

    @NotNull
    private Long departmentId;

    private Long teacherId; 
}