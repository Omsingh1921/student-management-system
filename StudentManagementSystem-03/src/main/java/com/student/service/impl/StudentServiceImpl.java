package com.student.service.impl;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.student.dto.request.StudentCreateRequestDTO;
import com.student.dto.request.StudentUpdateRequestDTO;
import com.student.dto.response.StudentResponseDTO;
import com.student.entity.Department;
import com.student.entity.Student;
import com.student.enums.Role;
import com.student.exception.DuplicateResourceException;
import com.student.exception.ResourceNotFoundException;
import com.student.reposiotry.DepartmentRepository;
import com.student.reposiotry.StudentRepository;
import com.student.service.StudentService;
import com.student.utils.EmailUtil;
import com.student.utils.PaginationUtil;
import com.student.utils.PasswordGeneratorUtil;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional(readOnly = true)
public class StudentServiceImpl implements StudentService {
	

    private final PasswordEncoder passwordEncoder;
    @Autowired private StudentRepository studentRepository;
    @Autowired private ModelMapper modelMapper;
    @Autowired private EmailUtil emailUtil;
    @Autowired private PasswordGeneratorUtil passwordGenerator;
    @Autowired private DepartmentRepository departmentRepository;
    
    public StudentServiceImpl(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public StudentResponseDTO createStudent(StudentCreateRequestDTO request) {
        log.info("Creating new student with email: {}", request.getEmail());

        // Uniqueness checks
        if (studentRepository.existsByEmailAndActiveTrue(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }
        if (studentRepository.existsByRollNumberAndActiveTrue(request.getRollNumber())) {
            throw new DuplicateResourceException("Roll number already exists: " + request.getRollNumber());
        }
        if (studentRepository.existsByMobileNumberAndActiveTrue(request.getMobileNumber())) {
            throw new DuplicateResourceException("Mobile number already exists: " + request.getMobileNumber());
        }

        Department dept = departmentRepository.findByIdAndIsDeletedFalse(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        String generatedPassword = passwordGenerator.generateRandomPassword(12);
        System.err.println(generatedPassword + " student ka pass");

        // Send email – if this fails, exception will roll back the transaction
        emailUtil.sendCredentials(request.getEmail(), request.getName(), generatedPassword, "Student");
        log.info("Credentials email sent successfully to {}", request.getEmail());

        // Map and save only after email succeeds
        Student student = modelMapper.map(request, Student.class);
        student.setRole(Role.STUDENT);
        student.setActive(true);
        student.setDepartment(dept);
        student.setPassword(passwordEncoder.encode(generatedPassword));

        Student saved = studentRepository.save(student);
        log.info("Student created with id: {}", saved.getId());
        return modelMapper.map(saved, StudentResponseDTO.class);
    }
    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Page<StudentResponseDTO> getAllStudents(int page, int size, String sortBy, String direction) {
        Pageable pageable = PaginationUtil.createPageable(page, size, sortBy, direction);
        Page<Student> studentPage = studentRepository.findAll(pageable);
        
        // Manually map each Student entity to StudentResponseDTO
        return studentPage.map(student -> {
            StudentResponseDTO dto = new StudentResponseDTO();
            dto.setId(student.getId());
            dto.setName(student.getName());                     // assuming Student has getName()
            dto.setEmail(student.getEmail());
            dto.setMobileNumber(student.getMobileNumber());
            dto.setRole(student.getRole());                     // assuming Role is same type or convert if needed
            dto.setRollNumber(student.getRollNumber());
            dto.setEnrollmentYear(student.getEnrollmentYear());
            dto.setAddress(student.getAddress());
            dto.setGuardianName(student.getGuardianName());
//            System.err.println(student.getDepartment().getId());
            
            // For departmentName – typical scenario: Student has a Department object
            if (student.getDepartment() != null) {

                dto.setDepartmentId(student.getDepartment().getId());
                dto.setDepartmentName(student.getDepartment().getName());
            } else {
                dto.setDepartmentName(null);
            }
            
            dto.setActive(student.isActive());
            return dto;
        });
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public StudentResponseDTO getStudentById(Long id) {
        Student student = studentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return modelMapper.map(student, StudentResponseDTO.class);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public StudentResponseDTO updateStudent(Long id, StudentUpdateRequestDTO request) {
        Student student = studentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        // Update only allowed fields (ignore email/rollNumber if they are unique and not changed)
        student.setName(request.getName());
        student.setMobileNumber(request.getMobileNumber());
        student.setAddress(request.getAddress());
        student.setGuardianName(request.getGuardianName());
        // Update department if needed
        if (request.getDepartmentId() != null) {
        	  Department dept = departmentRepository.findByIdAndIsDeletedFalse(id)
                      .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        	  student.setDepartment(dept);
        }

        Student updated = studentRepository.save(student);
        log.info("Student updated: {}", id);
        return modelMapper.map(updated, StudentResponseDTO.class);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void softDeleteStudent(Long id) {
        Student student = studentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        student.setActive(false);
        studentRepository.save(student);
        log.info("Student soft deleted: {}", id);
    }
}