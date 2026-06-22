package com.student.appconfig;

import com.student.entity.Admin;
import com.student.entity.Student;
import com.student.entity.Teacher;
import com.student.reposiotry.AdminRepository;
import com.student.reposiotry.StudentRepository;
import com.student.reposiotry.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private TeacherRepository teacherRepository;
    @Autowired
    private AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("========================================");
        System.out.println(">>> loadUserByUsername called for: " + email);
        System.out.println(">>> adminRepository is " + (adminRepository == null ? "NULL" : "injected"));

        // 1️⃣ ADMIN CHECK (MUST BE FIRST)
        try {
            System.out.println(">>> Checking ADMIN table using findActiveAdminByEmail...");
            var adminOpt = adminRepository.findActiveAdminByEmail(email);
            System.out.println(">>> Admin found? " + adminOpt.isPresent());
            if (adminOpt.isPresent()) {
                Admin a = adminOpt.get();
                System.out.println("✅ ADMIN login success for: " + a.getEmail());
                return User.builder()
                        .username(a.getEmail())
                        .password(a.getPassword())
                        .roles("ADMIN")
                        .build();
            }
        } catch (Exception e) {
            System.err.println("❌ Admin query failed: " + e.getMessage());
            e.printStackTrace();
        }

        // 2️⃣ TEACHER CHECK
        try {
            System.out.println(">>> Checking TEACHER table...");
            var teacherOpt = teacherRepository.findByEmailAndActiveTrue(email);
            if (teacherOpt.isPresent()) {
                Teacher t = teacherOpt.get();
                System.out.println("✅ TEACHER login success for: " + t.getEmail());
                return User.builder()
                        .username(t.getEmail())
                        .password(t.getPassword())
                        .roles("TEACHER")
                        .build();
            }
        } catch (Exception e) {
            System.err.println("❌ Teacher query failed: " + e.getMessage());
        }

        // 3️⃣ STUDENT CHECK
        try {
            System.out.println(">>> Checking STUDENT table...");
            var studentOpt = studentRepository.findByEmailAndActiveTrue(email);
            if (studentOpt.isPresent()) {
                Student s = studentOpt.get();
                System.out.println("✅ STUDENT login success for: " + s.getEmail());
                return User.builder()
                        .username(s.getEmail())
                        .password(s.getPassword())
                        .roles("STUDENT")
                        .build();
            }
        } catch (Exception e) {
            System.err.println("❌ Student query failed: " + e.getMessage());
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}