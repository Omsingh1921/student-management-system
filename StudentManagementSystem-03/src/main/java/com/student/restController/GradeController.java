package com.student.restController;
import com.student.dto.request.GradeRequestDTO;
import com.student.dto.response.GradeResponseDTO;
import com.student.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<GradeResponseDTO> assignGrade(@Valid @RequestBody GradeRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gradeService.assignGrade(request));
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Page<GradeResponseDTO>> getGradesByCourse(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(gradeService.getGradesByCourseId(courseId, page, size));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Page<GradeResponseDTO>> getGradesByStudent(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(gradeService.getGradesByStudentId(studentId, page, size));
    }

    @PutMapping("/{gradeId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<GradeResponseDTO> updateGrade(@PathVariable Long gradeId,
                                                        @Valid @RequestBody GradeRequestDTO request) {
        return ResponseEntity.ok(gradeService.updateGrade(gradeId, request));
    }

    @PatchMapping("/{gradeId}/finalize")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> finalizeGrade(@PathVariable Long gradeId) {
        gradeService.finalizeGrade(gradeId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{gradeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long gradeId) {
        gradeService.deleteGrade(gradeId);
        return ResponseEntity.noContent().build();
    }
}