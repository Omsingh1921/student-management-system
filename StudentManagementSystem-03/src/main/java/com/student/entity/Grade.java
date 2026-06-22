package com.student.entity;


import com.student.enums.GradeLetter;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "grades", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "course_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Student is required")
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @NotNull(message = "Course is required")
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @DecimalMin(value = "0.0", message = "Marks cannot be negative")
    @DecimalMax(value = "100.0", message = "Marks cannot exceed 100")
    private Double marksObtained;

    @Enumerated(EnumType.STRING)
    private GradeLetter letterGrade;

    private boolean isFinalized = false;
}