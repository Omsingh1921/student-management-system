package com.student.service;

import com.student.dto.request.TeacherRegisterRequestDTO;
import com.student.dto.request.TeacherRequestDTO;
import com.student.dto.response.TeacherResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;

public interface TeacherService {

    @PreAuthorize("hasRole('ADMIN')")
    TeacherResponseDTO createTeacher(TeacherRegisterRequestDTO requestDTO);

    @PreAuthorize("hasRole('ADMIN')")
    Page<TeacherResponseDTO> getAllTeachers(int page, int size, String sortBy, String direction);

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    TeacherResponseDTO getTeacherById(Long id);

    @PreAuthorize("hasRole('ADMIN')")
    TeacherResponseDTO updateTeacher(Long id, TeacherRequestDTO requestDTO);

    @PreAuthorize("hasRole('ADMIN')")
    void softDeleteTeacher(Long id);
}