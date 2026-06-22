package com.student.reposiotry;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.student.entity.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {

    Page<Course> findAll(Pageable pageable);

    Optional<Course> findByIdAndIsDeletedFalse(Long id);

    // Fetch course with its department and teacher (avoid N+1)
    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.department LEFT JOIN FETCH c.teacher WHERE c.id = :id AND c.isDeleted = false")
    Optional<Course> findByIdWithDetails(@Param("id") Long id);

    boolean existsByCodeAndIsDeletedFalse(String code);

    // Find courses by department
    Page<Course> findByDepartmentIdAndIsDeletedFalse(Long departmentId, Pageable pageable);

    // Find courses taught by a specific teacher
    Page<Course> findByTeacherIdAndIsDeletedFalse(Long teacherId, Pageable pageable);

    // Count enrolled students in a course (used before deletion)
    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.id = :courseId")
    long countEnrolledStudents(@Param("courseId") Long courseId);

    // Soft delete only if no enrollments
    @Modifying
    @Transactional
    @Query("UPDATE Course c SET c.isDeleted = true WHERE c.id = :id AND NOT EXISTS (SELECT 1 FROM Enrollment e WHERE e.course.id = :id)")
    int softDeleteIfNoEnrollments(@Param("id") Long id);
    
    List<Course> findByDepartmentIdAndIsDeletedFalse(Long departmentId);
}