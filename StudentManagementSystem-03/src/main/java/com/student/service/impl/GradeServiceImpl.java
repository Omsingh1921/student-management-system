package com.student.service.impl;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.student.dto.request.GradeRequestDTO;
import com.student.dto.response.GradeResponseDTO;
import com.student.entity.Course;
import com.student.entity.Grade;
import com.student.entity.Student;
import com.student.enums.EnrollmentStatus;
import com.student.exception.BusinessValidationException;
import com.student.exception.DuplicateResourceException;
import com.student.exception.ResourceNotFoundException;
import com.student.reposiotry.CourseRepository;
import com.student.reposiotry.EnrollmentRepository;
import com.student.reposiotry.GradeRepository;
import com.student.reposiotry.StudentRepository;
import com.student.service.GradeService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional(readOnly = true)
public class GradeServiceImpl implements GradeService {

    @Autowired private GradeRepository gradeRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private ModelMapper modelMapper;

    @Override
    @Transactional
    @PreAuthorize("hasRole('TEACHER')")
    public GradeResponseDTO assignGrade(GradeRequestDTO request) {
        if (!enrollmentRepository.existsByStudentIdAndCourseIdAndStatus(request.getStudentId(), request.getCourseId(), EnrollmentStatus.ACTIVE)) {
            throw new BusinessValidationException("Student is not enrolled in this course");
        }

        if (gradeRepository.existsByStudentIdAndCourseId(request.getStudentId(), request.getCourseId())) {
            throw new DuplicateResourceException("Grade already assigned for this student in this course");
        }

        Student student = studentRepository.findByIdAndActiveTrue(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Course course = courseRepository.findByIdAndIsDeletedFalse(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Grade grade = modelMapper.map(request, Grade.class);
        grade.setStudent(student);
        grade.setCourse(course);
        grade.setFinalized(false);

        Grade saved = gradeRepository.save(grade);
        log.info("Grade assigned to student {} for course {}", request.getStudentId(), request.getCourseId());
        return modelMapper.map(saved, GradeResponseDTO.class);
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Page<GradeResponseDTO> getGradesByCourseId(Long courseId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return gradeRepository.findByCourseIdWithStudent(courseId, pageable)
                .map(g -> modelMapper.map(g, GradeResponseDTO.class));
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public Page<GradeResponseDTO> getGradesByStudentId(Long studentId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return gradeRepository.findByStudentIdWithCourse(studentId, pageable)
                .map(g -> modelMapper.map(g, GradeResponseDTO.class));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('TEACHER')")
    public GradeResponseDTO updateGrade(Long gradeId, GradeRequestDTO request) {
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new ResourceNotFoundException("Grade not found"));

        if (grade.isFinalized()) {
            throw new BusinessValidationException("Cannot update finalized grade");
        }

        grade.setMarksObtained(request.getMarksObtained());
        grade.setLetterGrade(request.getLetterGrade());

        Grade updated = gradeRepository.save(grade);
        log.info("Grade updated: {}", gradeId);
        return modelMapper.map(updated, GradeResponseDTO.class);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('TEACHER')")
    public void finalizeGrade(Long gradeId) {
        gradeRepository.finalizeById(gradeId);
        log.info("Grade finalized: {}", gradeId);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteGrade(Long gradeId) {
        gradeRepository.deleteById(gradeId);
        log.info("Grade deleted: {}", gradeId);
    }
}