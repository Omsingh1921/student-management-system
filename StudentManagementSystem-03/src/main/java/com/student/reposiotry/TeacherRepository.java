package com.student.reposiotry;

import com.student.entity.Teacher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    Page<Teacher> findAll(Pageable pageable);

    Optional<Teacher> findByIdAndActiveTrue(Long id);

    @Query("SELECT t FROM Teacher t WHERE t.id = :id")
    Optional<Teacher> findByIdIncludingDeleted(@Param("id") Long id);

    boolean existsByEmailAndActiveTrue(String email);
    boolean existsByMobileNumberAndActiveTrue(String mobileNumber);

    // Find teachers by specialization (for department assignment)
    Page<Teacher> findBySpecializationIgnoreCaseAndActiveTrue(String specialization, Pageable pageable);

    // Count teachers assigned to at least one course (used for workload validation)
    @Query("SELECT COUNT(DISTINCT t) FROM Teacher t JOIN Course c ON c.teacher.id = t.id WHERE t.active = true")
    long countTeachersWithCourses();
    
    Optional<Teacher> findByEmailAndActiveTrue(String email);
//    boolean existsByEmailAndActiveTrue(String email);
    
    Page<Teacher> findByDepartmentId(Long DepartmentId,Pageable page);
}