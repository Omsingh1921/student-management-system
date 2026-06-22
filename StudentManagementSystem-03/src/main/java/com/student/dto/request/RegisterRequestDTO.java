package com.student.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDTO {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6)
    private String password;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[0-9]{10}$")
    private String mobileNumber;

    @NotBlank(message = "Roll number is required")
    private String rollNumber;

    @NotNull(message = "Enrollment year is required")
    @Min(2000) @Max(2030)
    private Integer enrollmentYear;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Guardian name is required")
    private String guardianName;

    private Long departmentId;   // optional

    // role is not needed – default to STUDENT in the service
}