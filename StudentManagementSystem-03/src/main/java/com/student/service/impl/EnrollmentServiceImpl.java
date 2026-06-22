package com.student.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.student.dto.request.EnrollmentRequestDTO;
import com.student.dto.response.EnrollmentResponseDTO;
import com.student.entity.Course;
import com.student.entity.Enrollment;
import com.student.entity.Student;
import com.student.reposiotry.CourseRepository;
import com.student.reposiotry.EnrollmentRepository;
import com.student.reposiotry.StudentRepository;
import com.student.service.EnrollmentService;

@Service
@Transactional
public class EnrollmentServiceImpl implements EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    // Optional: use ModelMapper to map entities to DTOs
    // @Autowired
    // private ModelMapper modelMapper;

    @Override
    public EnrollmentResponseDTO enrollStudent(EnrollmentRequestDTO requestDTO) {
        Student student = studentRepository.findById(requestDTO.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Course course = courseRepository.findById(requestDTO.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check if already enrolled (optional)
        if (enrollmentRepository.existsByStudentAndCourse(student, course)) {
            throw new RuntimeException("Student already enrolled in this course");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
         // or LocalDate.now()
        // set other fields like status, grade, etc.

        Enrollment saved = enrollmentRepository.save(enrollment);
        return convertToResponseDTO(saved);
    }

    @Override
    public void dropEnrollment(Long enrollmentId) {
        if (!enrollmentRepository.existsById(enrollmentId)) {
            throw new RuntimeException("Enrollment not found with id: " + enrollmentId);
        }
        enrollmentRepository.deleteById(enrollmentId);
    }

    @Override
    public Page<EnrollmentResponseDTO> getEnrollmentsByStudentId(Long studentId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return enrollmentRepository.findByStudentId(studentId, pageable)
                .map(this::convertToResponseDTO);
    }

    @Override
    public Page<EnrollmentResponseDTO> getEnrollmentsByCourseId(Long courseId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return enrollmentRepository.findByCourseId(courseId, pageable)
                .map(this::convertToResponseDTO);
    }

    private EnrollmentResponseDTO convertToResponseDTO(Enrollment enrollment) {
        EnrollmentResponseDTO dto = new EnrollmentResponseDTO();
        dto.setId(enrollment.getId());
        dto.setStudentId(enrollment.getStudent().getId());
        dto.setStudentName(enrollment.getStudent().getName());
        dto.setCourseId(enrollment.getCourse().getId());
        dto.setCourseName(enrollment.getCourse().getName());
        dto.setEnrollmentDate(enrollment.getEnrollmentDate());
        dto.setStatus(enrollment.getStatus());
        // ... other fields
        return dto;
    }

	@Override
	public boolean existsByStudentAndCourse(Student student, Course course) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public Page<Enrollment> findByStudentId(Long studentId, java.awt.print.Pageable pageable) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean existsByStudentIdAndCourseId(Long studentId, Long courseId) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public Page<Enrollment> findByCourseId(Long courseId, java.awt.print.Pageable pageable) {
		// TODO Auto-generated method stub
		return null;
	}
}