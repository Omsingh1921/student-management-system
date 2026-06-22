package com.student.service;

import com.student.dto.request.CourseRequestDTO;
import com.student.dto.response.CourseResponseDTO;
import com.student.dto.response.StudentResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;

public interface CourseService {

    @PreAuthorize("hasRole('ADMIN')")
    CourseResponseDTO createCourse(CourseRequestDTO requestDTO);

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    Page<CourseResponseDTO> getAllCourses(int page, int size, String sortBy, String direction);

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    CourseResponseDTO getCourseById(Long id);

    @PreAuthorize("hasRole('ADMIN')")
    CourseResponseDTO updateCourse(Long id, CourseRequestDTO requestDTO);

    @PreAuthorize("hasRole('ADMIN')")
    void softDeleteCourse(Long id);

    // Assign teacher to course
    @PreAuthorize("hasRole('ADMIN')")
    CourseResponseDTO assignTeacherToCourse(Long courseId, Long teacherId);

    // Enroll student into course
    @PreAuthorize("hasRole('ADMIN')")
    void enrollStudentInCourse(Long courseId, Long studentId);

    // Get students enrolled in a course (for teachers to mark attendance/grades)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    Page<StudentResponseDTO> getEnrolledStudentsByCourseId(Long courseId, int page, int size);
}