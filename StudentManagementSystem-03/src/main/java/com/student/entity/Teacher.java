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
@Table(name = "teachers")
@SQLRestriction("active = true")

public class Teacher extends User {

    @Column(length = 100)
    private String specialization;

    private Integer experience; 

    @Column(length = 200)
    private String qualification;
    
    @ManyToOne
//    @Column(name = "department_id")
    @JoinColumn(name = "department_id", nullable = true)  // allow null for now
    private Department department;
}