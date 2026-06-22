package com.student.restController;

import com.student.dto.request.CourseRequestDTO;
import com.student.dto.response.CourseResponseDTO;
import com.student.dto.response.StudentResponseDTO;
import com.student.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseResponseDTO> createCourse(@Valid @RequestBody CourseRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createCourse(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Page<CourseResponseDTO>> getAllCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        return ResponseEntity.ok(courseService.getAllCourses(page, size, sortBy, direction));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<CourseResponseDTO> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseResponseDTO> updateCourse(@PathVariable Long id,
                                                          @Valid @RequestBody CourseRequestDTO request) {
        return ResponseEntity.ok(courseService.updateCourse(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> softDeleteCourse(@PathVariable Long id) {
        courseService.softDeleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    // Assign teacher to course
    @PutMapping("/{courseId}/teachers/{teacherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseResponseDTO> assignTeacherToCourse(@PathVariable Long courseId,
                                                                   @PathVariable Long teacherId) {
        return ResponseEntity.ok(courseService.assignTeacherToCourse(courseId, teacherId));
    }

    // Enroll student in course
    @PostMapping("/{courseId}/enroll/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> enrollStudentInCourse(@PathVariable Long courseId,
                                                      @PathVariable Long studentId) {
        courseService.enrollStudentInCourse(courseId, studentId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // Get students enrolled in course (for teachers)
    @GetMapping("/{courseId}/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Page<StudentResponseDTO>> getEnrolledStudents(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(courseService.getEnrolledStudentsByCourseId(courseId, page, size));
    }
}