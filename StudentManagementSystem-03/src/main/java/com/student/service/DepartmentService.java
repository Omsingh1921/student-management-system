package com.student.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;

import com.student.dto.request.DepartmentRequestDTO;
import com.student.dto.response.CourseResponseDTO;
import com.student.dto.response.DepartmentResponseDTO;
import com.student.dto.response.TeacherResponseDTO;

public interface DepartmentService {

    @PreAuthorize("hasRole('ADMIN')")
    DepartmentResponseDTO createDepartment(DepartmentRequestDTO requestDTO);

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    Page<DepartmentResponseDTO> getAllDepartments(int page, int size, String sortBy, String direction);

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    DepartmentResponseDTO getDepartmentById(Long id);

    @PreAuthorize("hasRole('ADMIN')")
    DepartmentResponseDTO updateDepartment(Long id, DepartmentRequestDTO requestDTO);

    @PreAuthorize("hasRole('ADMIN')")
    void softDeleteDepartment(Long id);
    
 // ✅ Correct method name (was assignDoctorToDepartment in hospital system)
    TeacherResponseDTO assignTeacherToDepartment(Long departmentId, Long teacherId);

    // ✅ Correct method name (was getDoctorsByDepartmentId – now teachers)
    Page<TeacherResponseDTO> getTeachersByDepartmentId(Long departmentId, int page, int size);
    
    public List<DepartmentResponseDTO> getAllDepartmentss();
    
    public List<CourseResponseDTO> getCoursesByDepartment(Long departmentId);
}