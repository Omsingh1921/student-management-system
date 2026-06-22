package com.student.service;


import com.student.dto.request.AttendanceRequestDTO;
import com.student.dto.response.AttendanceResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;

public interface AttendanceService {

    // Teacher marks attendance for a course (bulk or single)
    @PreAuthorize("hasRole('TEACHER')")
    AttendanceResponseDTO markAttendance(AttendanceRequestDTO requestDTO);

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    Page<AttendanceResponseDTO> getAttendanceByCourseId(Long courseId, int page, int size);

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    Page<AttendanceResponseDTO> getAttendanceByStudentId(Long studentId, int page, int size);

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    Double getAttendancePercentage(Long studentId, Long courseId);

    // Update attendance (teacher only, for same day)
    @PreAuthorize("hasRole('TEACHER')")
    AttendanceResponseDTO updateAttendance(Long attendanceId, AttendanceRequestDTO requestDTO);
}