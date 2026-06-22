package com.student.restController;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.student.dto.request.DepartmentRequestDTO;
import com.student.dto.response.CourseResponseDTO;
import com.student.dto.response.DepartmentResponseDTO;
import com.student.dto.response.TeacherResponseDTO;
import com.student.service.DepartmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentResponseDTO> createDepartment(@Valid @RequestBody DepartmentRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentService.createDepartment(request));
    }
    
    @GetMapping
    @PreAuthorize("permitAll()")  // or hasAnyRole('ADMIN','TEACHER','STUDENT')
    public ResponseEntity<List<DepartmentResponseDTO>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartmentss());
    }

    @GetMapping("/page")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Page<DepartmentResponseDTO>> getAllDepartmentsWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        return ResponseEntity.ok(departmentService.getAllDepartments(page, size, sortBy, direction));
    }
    
    @GetMapping("/{departmentId}/courses")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<CourseResponseDTO>> getCoursesByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(departmentService.getCoursesByDepartment(departmentId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<DepartmentResponseDTO> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentResponseDTO> updateDepartment(@PathVariable Long id,
                                                                  @Valid @RequestBody DepartmentRequestDTO request) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> softDeleteDepartment(@PathVariable Long id) {
        departmentService.softDeleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

 // Assign teacher to department
    @PutMapping("/{departmentId}/teachers/{teacherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeacherResponseDTO> assignTeacherToDepartment(@PathVariable Long departmentId,
                                                                           @PathVariable Long teacherId) {
    	System.err.println("controller called");
        return ResponseEntity.ok(departmentService.assignTeacherToDepartment(departmentId, teacherId));
    }

    // Get all teachers in a department
    @GetMapping("/{departmentId}/teachers")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Page<TeacherResponseDTO>> getTeachersByDepartment(
            @PathVariable Long departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(departmentService.getTeachersByDepartmentId(departmentId, page, size));
    }
}