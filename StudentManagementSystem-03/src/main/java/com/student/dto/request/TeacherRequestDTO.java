package com.student.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherRequestDTO {

    @NotBlank @Size(min=2, max=100)
    private String name;

    @NotBlank @Email
    private String email;
//
//    @NotBlank @Size(min=6)
//    private String password;

    @NotBlank @Pattern(regexp = "^[0-9]{10}$")
    private String mobileNumber;

    @NotBlank
    private String specialization;

    @Min(0)
    private Integer experience;

    @NotBlank
    private String qualification;
    
    @NotBlank
    private Integer DepartmentId;
}