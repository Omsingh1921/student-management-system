package com.student.dto.request;   // or com.college.dto.request

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentUpdateRequestDTO {

    private Long id;  // optional, can be path variable

    @Size(min = 2, max = 100)
    private String name;

    @Pattern(regexp = "^[0-9]{10}$")
    private String mobileNumber;

    private String address;

    private String guardianName;

    private Long departmentId;
}