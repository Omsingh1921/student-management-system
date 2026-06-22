package com.student.reposiotry;


import com.student.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    // Automatically respects @SQLRestriction("active = true")
    Page<Student> findAll(Pageable pageable);

    Optional<Student> findByIdAndActiveTrue(Long id);

    // To fetch even soft-deleted students (for admin recovery)
    @Query("SELECT s FROM Student s WHERE s.id = :id")
    Optional<Student> findByIdIncludingDeleted(@Param("id") Long id);
    
    Optional<Student> findByEmailAndActiveTrue(String email);
    // Check uniqueness
    boolean existsByEmailAndActiveTrue(String email);
    boolean existsByRollNumberAndActiveTrue(String rollNumber);
    boolean existsByMobileNumberAndActiveTrue(String mobileNumber);

    // Count active students by department
    long countByDepartmentIdAndActiveTrue(Long departmentId);
    
    
    
    // Bulk soft delete (optional)
    @Modifying
    @Transactional
    @Query("UPDATE Student s SET s.active = false WHERE s.id = :id")
    void softDeleteById(@Param("id") Long id);

    // Paginated search by name or roll number
    Page<Student> findByNameContainingIgnoreCaseOrRollNumberContainingIgnoreCaseAndActiveTrue(
            String name, String rollNumber, Pageable pageable);
}