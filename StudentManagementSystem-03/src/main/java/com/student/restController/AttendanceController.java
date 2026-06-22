package com.student.restController;

import com.student.dto.request.AttendanceRequestDTO;
import com.student.dto.response.AttendanceResponseDTO;
import com.student.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<AttendanceResponseDTO> markAttendance(@Valid @RequestBody AttendanceRequestDTO request) {
    	System.err.println("controller h attendance ka");
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.markAttendance(request));
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Page<AttendanceResponseDTO>> getAttendanceByCourse(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(attendanceService.getAttendanceByCourseId(courseId, page, size));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Page<AttendanceResponseDTO>> getAttendanceByStudent(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudentId(studentId, page, size));
    }

    @GetMapping("/percentage")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Double> getAttendancePercentage(
            @RequestParam Long studentId,
            @RequestParam Long courseId) {
        return ResponseEntity.ok(attendanceService.getAttendancePercentage(studentId, courseId));
    }

    @PutMapping("/{attendanceId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<AttendanceResponseDTO> updateAttendance(
            @PathVariable Long attendanceId,
            @Valid @RequestBody AttendanceRequestDTO request) {
        return ResponseEntity.ok(attendanceService.updateAttendance(attendanceId, request));
    }
}