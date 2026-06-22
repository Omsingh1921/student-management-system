package com.student.reposiotry;

import com.student.entity.Grade;
import com.student.enums.GradeLetter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface GradeRepository extends JpaRepository<Grade, Long> {

    // Prevent duplicate grade for same student and course
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    // Find grade by student and course
    Optional<Grade> findByStudentIdAndCourseId(Long studentId, Long courseId);

    // Get all grades for a course (with student details)
    @Query("SELECT g FROM Grade g JOIN FETCH g.student WHERE g.course.id = :courseId")
    Page<Grade> findByCourseIdWithStudent(@Param("courseId") Long courseId, Pageable pageable);

    // Get all grades for a student (with course details)
    @Query("SELECT g FROM Grade g JOIN FETCH g.course WHERE g.student.id = :studentId")
    Page<Grade> findByStudentIdWithCourse(@Param("studentId") Long studentId, Pageable pageable);

    // Update grade (if not finalized)
    @Modifying
    @Transactional
    @Query("UPDATE Grade g SET g.marksObtained = :marks, g.letterGrade = :grade WHERE g.id = :id AND g.isFinalized = false")
    int updateIfNotFinalized(@Param("id") Long id,
                             @Param("marks") Double marks,
                             @Param("grade") GradeLetter grade);

    // Finalize grade
    @Modifying
    @Transactional
    @Query("UPDATE Grade g SET g.isFinalized = true WHERE g.id = :id")
    void finalizeById(@Param("id") Long id);
}