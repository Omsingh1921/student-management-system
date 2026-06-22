package com.student.service;


import org.springframework.data.domain.Page;
//import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;

import com.student.dto.request.StudentCreateRequestDTO;
import com.student.dto.request.StudentUpdateRequestDTO;
import com.student.dto.response.StudentResponseDTO;
import com.student.dto.response.UserResponseDTO;

public interface StudentService {

    @PreAuthorize("hasRole('ADMIN')")
    StudentResponseDTO createStudent(StudentCreateRequestDTO requestDTO);

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    Page<StudentResponseDTO> getAllStudents(int page, int size, String sortBy, String direction);

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    StudentResponseDTO getStudentById(Long id);

    @PreAuthorize("hasRole('ADMIN')")
    StudentResponseDTO updateStudent(Long id, StudentUpdateRequestDTO requestDTO);

//    public UserResponseDTO registerStudent(StudentCreateRequestDTO request);
    
    @PreAuthorize("hasRole('ADMIN')")
    void softDeleteStudent(Long id);
}