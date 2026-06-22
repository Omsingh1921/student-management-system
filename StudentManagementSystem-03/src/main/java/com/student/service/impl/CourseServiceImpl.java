package com.student.service.impl;

import java.time.LocalDateTime;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.student.dto.request.CourseRequestDTO;
import com.student.dto.response.CourseResponseDTO;
import com.student.dto.response.StudentResponseDTO;
import com.student.entity.Course;
import com.student.entity.Department;
import com.student.entity.Enrollment;
import com.student.entity.Student;
import com.student.entity.Teacher;
import com.student.enums.EnrollmentStatus;
import com.student.exception.BusinessValidationException;
import com.student.exception.DuplicateResourceException;
import com.student.exception.ResourceNotFoundException;
import com.student.reposiotry.CourseRepository;
import com.student.reposiotry.DepartmentRepository;
import com.student.reposiotry.EnrollmentRepository;
import com.student.reposiotry.StudentRepository;
import com.student.reposiotry.TeacherRepository;
import com.student.service.CourseService;
import com.student.utils.PaginationUtil;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional(readOnly = true)
public class CourseServiceImpl implements CourseService {

    @Autowired private CourseRepository courseRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private StudentRepository studentReposiotry;
    @Autowired private ModelMapper modelMapper;

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CourseResponseDTO createCourse(CourseRequestDTO request) {
        if (courseRepository.existsByCodeAndIsDeletedFalse(request.getCode()))
            throw new DuplicateResourceException("Course code exists");

        Department department = departmentRepository.findByIdAndIsDeletedFalse(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        Course course = modelMapper.map(request, Course.class);
        course.setDepartment(department);
        course.setDeleted(false);

        if (request.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findByIdAndActiveTrue(request.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            course.setTeacher(teacher);
        }

        return modelMapper.map(courseRepository.save(course), CourseResponseDTO.class);
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public Page<CourseResponseDTO> getAllCourses(int page, int size, String sortBy, String direction) {
        Pageable pageable = PaginationUtil.createPageable(page, size, sortBy, direction);
        return courseRepository.findAll(pageable).map(course -> {
            CourseResponseDTO dto = new CourseResponseDTO();
            dto.setId(course.getId());
            dto.setName(course.getName());
            dto.setCode(course.getCode());
            dto.setCredits(course.getCredits());
            dto.setSemester(course.getSemester());
            if (course.getDepartment() != null) {
                dto.setDepartmentId(course.getDepartment().getId());
                dto.setDepartmentName(course.getDepartment().getName());
            } else {
                dto.setDepartmentId(null);    
                dto.setDepartmentName(null);
            }
            
            if (course.getTeacher() != null) {
                dto.setTeacherId(course.getTeacher().getId());
                dto.setTeacherName(course.getTeacher().getName());
            } else {
                dto.setTeacherId(null);
                dto.setTeacherName(null);
            }
            
            return dto;
        });
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public CourseResponseDTO getCourseById(Long id) {
        Course course = courseRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return modelMapper.map(course, CourseResponseDTO.class);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CourseResponseDTO updateCourse(Long id, CourseRequestDTO request) {
        Course course = courseRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        course.setName(request.getName());
        course.setCredits(request.getCredits());
        course.setSemester(request.getSemester());

        if (request.getDepartmentId() != null && !request.getDepartmentId().equals(course.getDepartment().getId())) {
            Department dept = departmentRepository.findByIdAndIsDeletedFalse(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("New department not found"));
            course.setDepartment(dept);
        }
        if (request.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findByIdAndActiveTrue(request.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            course.setTeacher(teacher);
        }
        return modelMapper.map(courseRepository.save(course), CourseResponseDTO.class);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void softDeleteCourse(Long id) {
        long enrolled = courseRepository.countEnrolledStudents(id);
        if (enrolled > 0) {
            throw new BusinessValidationException("Cannot delete course with enrolled students");
        }
        int updated = courseRepository.softDeleteIfNoEnrollments(id);
        if (updated == 0) throw new ResourceNotFoundException("Course not found or has enrollments");
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CourseResponseDTO assignTeacherToCourse(Long courseId, Long teacherId) {
        Course course = courseRepository.findByIdAndIsDeletedFalse(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        Teacher teacher = teacherRepository.findByIdAndActiveTrue(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        course.setTeacher(teacher);
        return modelMapper.map(courseRepository.save(course), CourseResponseDTO.class);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void enrollStudentInCourse(Long courseId, Long studentId) {
        // Check existence and active
        Course course = courseRepository.findByIdAndIsDeletedFalse(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        Student student = studentReposiotry.findByIdAndActiveTrue(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (enrollmentRepository.existsByStudentIdAndCourseIdAndStatus(studentId, courseId, EnrollmentStatus.ACTIVE)) {
            throw new DuplicateResourceException("Student already enrolled in this course");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setEnrollmentDate(LocalDateTime.now());
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        enrollmentRepository.save(enrollment);
        log.info("Student {} enrolled in course {}", studentId, courseId);
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Page<StudentResponseDTO> getEnrolledStudentsByCourseId(Long courseId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Enrollment> enrollments = enrollmentRepository.findByCourseIdWithStudent(courseId, pageable);
        return enrollments.map(e -> modelMapper.map(e.getStudent(), StudentResponseDTO.class));
    }
}