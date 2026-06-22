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

import com.student.dto.request.TeacherRegisterRequestDTO;
import com.student.dto.request.TeacherRequestDTO;
import com.student.dto.response.TeacherResponseDTO;
import com.student.entity.Teacher;
import com.student.enums.Role;
import com.student.exception.DuplicateResourceException;
import com.student.exception.ResourceNotFoundException;
import com.student.reposiotry.TeacherRepository;
import com.student.service.TeacherService;
import com.student.utils.EmailUtil;
import com.student.utils.PaginationUtil;
import com.student.utils.PasswordGeneratorUtil;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional(readOnly = true)
public class TeacherServiceImpl implements TeacherService {

    @Autowired private TeacherRepository teacherRepository;
    @Autowired private ModelMapper modelMapper;
    @Autowired private EmailUtil emailUtil;
    @Autowired private PasswordGeneratorUtil passwordGenerator;

    private final PasswordEncoder passwordEncoder;
    public TeacherServiceImpl(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }
  
    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public TeacherResponseDTO createTeacher(TeacherRegisterRequestDTO request) {
        if (teacherRepository.existsByEmailAndActiveTrue(request.getEmail()))
            throw new DuplicateResourceException("Email exists");
        if (teacherRepository.existsByMobileNumberAndActiveTrue(request.getMobileNumber()))
            throw new DuplicateResourceException("Mobile exists");

        String generatedPassword = passwordGenerator.generateRandomPassword(12);
        System.err.println(generatedPassword + " Teacher ka pass");

        // Send email – failure will roll back the transaction
        emailUtil.sendCredentials(request.getEmail(), request.getName(), generatedPassword, "Teacher");
        log.info("Credentials email sent successfully to {}", request.getEmail());

        // Manual mapping
        Teacher teacher = new Teacher();
        teacher.setName(request.getName());
        teacher.setEmail(request.getEmail());
        teacher.setMobileNumber(request.getMobileNumber());
        teacher.setRole(Role.TEACHER);
        teacher.setActive(true);
        teacher.setSpecialization(request.getSpecialization());
        teacher.setQualification(request.getQualification());
        teacher.setExperience(request.getExperience());
        teacher.setPassword(passwordEncoder.encode(generatedPassword));

        Teacher saved = teacherRepository.save(teacher);

        // Map to response DTO
        TeacherResponseDTO response = new TeacherResponseDTO();
        response.setId(saved.getId());
        response.setName(saved.getName());
        response.setEmail(saved.getEmail());
        response.setMobileNumber(saved.getMobileNumber());
        response.setRole(saved.getRole());
        response.setActive(saved.isActive());
        response.setQualification(saved.getQualification());
        response.setExperience(saved.getExperience());

        return response;
    }
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public Page<TeacherResponseDTO> getAllTeachers(int page, int size, String sortBy, String direction) {
        Pageable pageable = PaginationUtil.createPageable(page, size, sortBy, direction);
        return teacherRepository.findAll(pageable).map(teacher -> {
            TeacherResponseDTO dto = new TeacherResponseDTO();
            dto.setId(teacher.getId());
            dto.setName(teacher.getName());
            dto.setEmail(teacher.getEmail());
            dto.setMobileNumber(teacher.getMobileNumber());
            dto.setRole(teacher.getRole());
            dto.setActive(teacher.isActive());
            dto.setSpecialization(teacher.getSpecialization());
            dto.setExperience(teacher.getExperience());
            dto.setQualification(teacher.getQualification());
            if(teacher.getDepartment()!=null) {
            dto.setDepartment_id(teacher.getDepartment().getId());
            dto.setDepartmentName(teacher.getDepartment().getName());}
            return dto;
        });
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public TeacherResponseDTO getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        return modelMapper.map(teacher, TeacherResponseDTO.class);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public TeacherResponseDTO updateTeacher(Long id, TeacherRequestDTO request) {
        Teacher teacher = teacherRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        teacher.setName(request.getName());
        teacher.setMobileNumber(request.getMobileNumber());
        teacher.setSpecialization(request.getSpecialization());
        teacher.setExperience(request.getExperience());
        teacher.setQualification(request.getQualification());
        return modelMapper.map(teacherRepository.save(teacher), TeacherResponseDTO.class);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void softDeleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        teacher.setActive(false);
        teacherRepository.save(teacher);
    }
}
