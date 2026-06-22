package com.student.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "students")
@SQLRestriction("active = true")

public class Student extends User {

    @NotBlank(message = "Roll number is required")
    @Column(unique = true, nullable = false, length = 50)
    private String rollNumber;

    @NotNull(message = "Enrollment year is required")
    @Min(value = 2000, message = "Enrollment year must be >= 2000")
    @Max(value = 2030, message = "Enrollment year must be <= 2030")
    @Column(nullable = false)
    private Integer enrollmentYear;

    @NotBlank(message = "Address is required")
    @Column(length = 255)
    private String address;

    @NotBlank(message = "Guardian name is required")
    @Column(length = 100)
    private String guardianName;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;  
}