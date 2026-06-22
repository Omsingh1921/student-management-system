package com.student.dto.response;


import com.student.enums.Role;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String mobileNumber;
    private Role role;
    private String specialization;
    private Integer experience;
    private String qualification;
    private String departmentName;
    private Long department_id;
    private boolean active;
}