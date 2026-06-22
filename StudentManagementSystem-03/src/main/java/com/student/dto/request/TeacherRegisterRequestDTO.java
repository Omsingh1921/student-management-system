package com.student.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherRegisterRequestDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email
    private String email;

//    @NotBlank(message = "Password is required")
//    @Size(min = 6)
//    private String password;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[0-9]{10}$")
    private String mobileNumber;
    
    @NotBlank(message = "Specialization is required jiiiiiiiii")
    private String specialization;

    @Min(0)
    private Integer experience;

    @NotBlank(message = "Qualification is required")
    private String qualification;
    

    @NotNull
    private Integer DepartmentId;
}