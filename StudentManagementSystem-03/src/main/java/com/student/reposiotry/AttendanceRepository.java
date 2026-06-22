package com.student.reposiotry;


import com.student.entity.Attendance;
import com.student.enums.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // Check duplicate attendance (same student, course, date)
    boolean existsByStudentIdAndCourseIdAndDate(Long studentId, Long courseId, LocalDate date);

    // Get attendance records for a course with pagination
    Page<Attendance> findByCourseId(Long courseId, Pageable pageable);

    // Get attendance for a student in a specific course (ordered by date)
    List<Attendance> findByStudentIdAndCourseIdOrderByDateAsc(Long studentId, Long courseId);

    // Count total working days (distinct dates) for a course
    @Query("SELECT COUNT(DISTINCT a.date) FROM Attendance a WHERE a.course.id = :courseId")
    long countDistinctDatesByCourseId(@Param("courseId") Long courseId);

    // Count number of PRESENT days for a student in a course
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.course.id = :courseId AND a.status = :status")
    long countByStudentAndCourseAndStatus(@Param("studentId") Long studentId,
                                          @Param("courseId") Long courseId,
                                          @Param("status") AttendanceStatus status);

    // Batch insert optimization: use saveAll() in service
    Page<Attendance> findByStudentId(Long studentId, Pageable pageable);
}