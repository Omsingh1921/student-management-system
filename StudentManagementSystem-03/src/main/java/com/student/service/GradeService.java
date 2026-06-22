package com.student.service;

import com.student.dto.request.GradeRequestDTO;
import com.student.dto.response.GradeResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;

public interface GradeService {

    // Teacher assigns grade
    @PreAuthorize("hasRole('TEACHER')")
    GradeResponseDTO assignGrade(GradeRequestDTO requestDTO);

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    Page<GradeResponseDTO> getGradesByCourseId(Long courseId, int page, int size);

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    Page<GradeResponseDTO> getGradesByStudentId(Long studentId, int page, int size);

    @PreAuthorize("hasRole('TEACHER')")
    GradeResponseDTO updateGrade(Long gradeId, GradeRequestDTO requestDTO);

    @PreAuthorize("hasRole('TEACHER')")
    void finalizeGrade(Long gradeId);  // once finalized, cannot edit

    @PreAuthorize("hasRole('ADMIN')")
    void deleteGrade(Long gradeId);
}