package com.student.dto.response;

import com.student.enums.Role;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String mobileNumber;
    private Role role;
    private String rollNumber;
    private Integer enrollmentYear;
    private String address;
    private String guardianName;
    private Long departmentId;
    private String departmentName;
    private boolean active;
}