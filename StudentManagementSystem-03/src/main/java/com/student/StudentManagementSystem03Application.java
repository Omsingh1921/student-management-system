package com.student;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.student.entity.Admin;
import com.student.enums.Role;
import com.student.reposiotry.AdminRepository;

@SpringBootApplication
public class StudentManagementSystem03Application {

	public static void main(String[] args) {
		SpringApplication.run(StudentManagementSystem03Application.class, args);
	}
	 @Bean
	    public CommandLineRunner initAdmin(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
	        return args -> {
	            String adminEmail = "admin@system.com";
	            if (!adminRepository.existsByEmailAndActiveTrue(adminEmail)) {
	                Admin admin = new Admin();
	                admin.setName("System Administrator");
	                admin.setEmail(adminEmail);
	                admin.setPassword(passwordEncoder.encode("Admin@123"));
	                admin.setMobileNumber("7805036415");
	                admin.setRole(Role.ADMIN);  // make sure Role.ADMIN exists in your enum
	                admin.setActive(true);
	                admin.setDepartment("IT");
	                admin.setPermissionLevel("SUPER_ADMIN");
	                adminRepository.save(admin);
	                System.err.println("Default admin created: " + adminEmail);
	            }
	        };
	    }

}
