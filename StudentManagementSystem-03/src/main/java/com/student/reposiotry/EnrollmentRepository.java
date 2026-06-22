package com.student.reposiotry;


import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.student.entity.Course;
import com.student.entity.Enrollment;
import com.student.entity.Student;
import com.student.enums.EnrollmentStatus;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // Check if student is already enrolled in a course (active)
    boolean existsByStudentIdAndCourseIdAndStatus(Long studentId, Long courseId, EnrollmentStatus status);

    // Get all enrollments for a student (with course details)
    @Query("SELECT e FROM Enrollment e JOIN FETCH e.course WHERE e.student.id = :studentId")
    Page<Enrollment> findByStudentIdWithCourse(@Param("studentId") Long studentId, Pageable pageable);

    // Get all enrollments for a course (with student details)
    @Query("SELECT e FROM Enrollment e JOIN FETCH e.student WHERE e.course.id = :courseId")
    Page<Enrollment> findByCourseIdWithStudent(@Param("courseId") Long courseId, Pageable pageable);

    // Count active enrollments for a course
    long countByCourseIdAndStatus(Long courseId, EnrollmentStatus status);

    // Drop enrollment (update status)
    @Modifying
    @Transactional
    @Query("UPDATE Enrollment e SET e.status = :status WHERE e.id = :id")
    void updateStatus(@Param("id") Long id, @Param("status") EnrollmentStatus status);

    // Find enrollment by student and course (for grade/attendance validation)
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    
 // Check if a student is already enrolled in a course
    boolean existsByStudentAndCourse(Student student, Course course);

    // Paginated enrollments for a student
    Page<Enrollment> findByStudentId(Long studentId, Pageable pageable);

    // Paginated enrollments for a course
    Page<Enrollment> findByCourseId(Long courseId, Pageable pageable);
}