package com.student.service.impl;

import java.time.LocalDate;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.student.dto.request.AttendanceRequestDTO;
import com.student.dto.response.AttendanceResponseDTO;
import com.student.entity.Attendance;
import com.student.entity.Course;
import com.student.entity.Student;
import com.student.enums.AttendanceStatus;
import com.student.enums.EnrollmentStatus;
import com.student.exception.BusinessValidationException;
import com.student.exception.DuplicateResourceException;
import com.student.exception.ResourceNotFoundException;
import com.student.reposiotry.AttendanceRepository;
import com.student.reposiotry.CourseRepository;
import com.student.reposiotry.EnrollmentRepository;
import com.student.reposiotry.StudentRepository;
import com.student.service.AttendanceService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional(readOnly = true)
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private ModelMapper modelMapper;

    @Override
    @Transactional
    @PreAuthorize("hasRole('TEACHER')")
    public AttendanceResponseDTO markAttendance(AttendanceRequestDTO request) {
    	
    	System.out.println(request.getCourseId());
    	System.out.println(request.getStudentId());
    	System.out.println(request.getDate());
    	System.out.println(request.getStatus());
        // Check if student is enrolled in the course
        if (!enrollmentRepository.existsByStudentIdAndCourseIdAndStatus(request.getStudentId(), request.getCourseId(), EnrollmentStatus.ACTIVE)) {
            throw new BusinessValidationException("Student is not enrolled in this course");
        }

        // Check duplicate
        if (attendanceRepository.existsByStudentIdAndCourseIdAndDate(request.getStudentId(), request.getCourseId(), request.getDate())) {
            throw new DuplicateResourceException("Attendance already marked for this student on this date");
        }

        // Validate date not in future
        if (request.getDate().isAfter(LocalDate.now())) {
            throw new BusinessValidationException("Cannot mark attendance for future dates");
        }

        Student student = studentRepository.findByIdAndActiveTrue(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Course course = courseRepository.findByIdAndIsDeletedFalse(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Attendance attendance = modelMapper.map(request, Attendance.class);
        attendance.setStudent(student);
        attendance.setCourse(course);

        Attendance saved = attendanceRepository.save(attendance);
        log.info("Attendance marked for student {} on course {} date {}", request.getStudentId(), request.getCourseId(), request.getDate());
        return modelMapper.map(saved, AttendanceResponseDTO.class);
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Page<AttendanceResponseDTO> getAttendanceByCourseId(Long courseId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return attendanceRepository.findByCourseId(courseId, pageable)
                .map(a -> modelMapper.map(a, AttendanceResponseDTO.class));
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public Page<AttendanceResponseDTO> getAttendanceByStudentId(Long studentId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        // Need custom repository method: Page<Attendance> findByStudentId(Long studentId, Pageable pageable)
        // Assume exists
        return attendanceRepository.findByStudentId(studentId, pageable)
                .map(a -> modelMapper.map(a, AttendanceResponseDTO.class));
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public Double getAttendancePercentage(Long studentId, Long courseId) {
        long presentCount = attendanceRepository.countByStudentAndCourseAndStatus(studentId, courseId, AttendanceStatus.PRESENT);
        long totalDays = attendanceRepository.countDistinctDatesByCourseId(courseId);
        if (totalDays == 0) return 0.0;
        return (presentCount * 100.0) / totalDays;
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('TEACHER')")
    public AttendanceResponseDTO updateAttendance(Long attendanceId, AttendanceRequestDTO request) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));

        // Cannot change date or student/course; only status
        if (!attendance.getDate().equals(request.getDate())) {
            throw new BusinessValidationException("Cannot change attendance date");
        }
        attendance.setStatus(request.getStatus());
        return modelMapper.map(attendanceRepository.save(attendance), AttendanceResponseDTO.class);
    }
}