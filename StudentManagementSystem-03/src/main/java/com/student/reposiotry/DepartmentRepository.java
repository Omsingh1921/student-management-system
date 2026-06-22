package com.student.reposiotry;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.student.entity.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    // @SQLRestriction("is_deleted = false") applies automatically
    Page<Department> findAll(Pageable pageable);

    Optional<Department> findByIdAndIsDeletedFalse(Long id);

    @Query("SELECT d FROM Department d WHERE d.id = :id")
    Optional<Department> findByIdIncludingDeleted(@Param("id") Long id);

    boolean existsByNameAndIsDeletedFalse(String name);

    // Check if department has any active courses
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Course c WHERE c.department.id = :deptId AND c.isDeleted = false")
    boolean hasActiveCourses(@Param("deptId") Long deptId);

    // Soft delete department only if no active courses
    @Modifying
    @Transactional
    @Query("UPDATE Department d SET d.isDeleted = true WHERE d.id = :id AND NOT EXISTS (SELECT 1 FROM Course c WHERE c.department.id = :id AND c.isDeleted = false)")
    int softDeleteIfNoCourses(@Param("id") Long id);
    
    List<Department> findByIsDeletedFalse();
}