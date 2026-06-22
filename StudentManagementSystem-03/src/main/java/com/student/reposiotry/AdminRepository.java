package com.student.reposiotry;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.student.entity.Admin;
	
@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
		

    @Query("SELECT a FROM Admin a WHERE a.email = :email AND a.active = true")
    Optional<Admin> findActiveAdminByEmail(@Param("email") String email);
    Optional<Admin> findByEmailAndActiveTrue(String email);
    boolean existsByEmailAndActiveTrue(String email);
}
