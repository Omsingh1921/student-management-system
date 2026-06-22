package com.student.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponseDTO {
    private Long id;
    private String name;
    private String code;
    private Integer credits;
    private String semester;
    private Long departmentId;
    private String departmentName;
    private Long teacherId;
    private String teacherName;
    private boolean deleted;
}