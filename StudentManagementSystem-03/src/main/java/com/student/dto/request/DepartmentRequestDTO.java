package com.student.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentRequestDTO {
    @NotBlank(message = "Department name is required")
    private String name;

    @Size(max = 500)
    private String description;
}