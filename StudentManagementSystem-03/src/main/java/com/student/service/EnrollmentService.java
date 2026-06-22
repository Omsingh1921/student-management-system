package com.student.service;


import java.awt.print.Pageable;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;

import com.student.dto.request.EnrollmentRequestDTO;
import com.student.dto.response.EnrollmentResponseDTO;
import com.student.entity.Course;
import com.student.entity.Enrollment;
import com.student.entity.Student;

public interface EnrollmentService {

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    EnrollmentResponseDTO enrollStudent(EnrollmentRequestDTO requestDTO);
//
    @PreAuthorize("hasRole('ADMIN')")
    void dropEnrollment(Long enrollmentId);

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    Page<EnrollmentResponseDTO> getEnrollmentsByStudentId(Long studentId, int page, int size);

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    Page<EnrollmentResponseDTO> getEnrollmentsByCourseId(Long courseId, int page, int size);
    
    boolean existsByStudentAndCourse(Student student, Course course);
    Page<Enrollment> findByStudentId(Long studentId, Pageable pageable);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
    Page<Enrollment> findByCourseId(Long courseId, Pageable pageable);
}