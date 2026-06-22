package com.student.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.student.dto.request.JwtResponseDTO;
import com.student.dto.request.LoginRequestDTO;
import com.student.entity.Admin;
import com.student.entity.Student;
import com.student.entity.Teacher;
import com.student.entity.User;
import com.student.exception.ResourceNotFoundException;
import com.student.reposiotry.AdminRepository;
import com.student.reposiotry.StudentRepository;
import com.student.reposiotry.TeacherRepository;
import com.student.security.JwtTokenProvider;
import com.student.service.AuthService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtTokenProvider jwtTokenProvider;
    @Autowired private StudentRepository studentRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AdminRepository adminRepository;
    
    @Override
    public JwtResponseDTO login(LoginRequestDTO loginRequest) {
    	  Admin admin = adminRepository.findByEmailAndActiveTrue(loginRequest.getEmail())
    	            .orElse(null);
    	    if (admin != null) {
    	        authenticate(loginRequest.getEmail(), loginRequest.getPassword());
    	        return buildJwtResponse(admin);
    	    }
        Student student = studentRepository.findByEmailAndActiveTrue(loginRequest.getEmail())
                .orElse(null);
        if (student != null) {
            authenticate(loginRequest.getEmail(), loginRequest.getPassword());
            return buildJwtResponse(student);
        }
        Teacher teacher = teacherRepository.findByEmailAndActiveTrue(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + loginRequest.getEmail()));

        authenticate(loginRequest.getEmail(), loginRequest.getPassword());
        return buildJwtResponse(teacher);
    }  private JwtResponseDTO buildJwtResponse(User user) {
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());
        return new JwtResponseDTO(token, user.getId(), user.getEmail(), user.getRole().name());
    }

    private void authenticate(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
    }

  
//
//    @Override
//    @Transactional
//    public UserResponseDTO register(RegisterRequestDTO request) {
//        // Only student registration for now
//        if (studentRepository.existsByEmailAndActiveTrue(request.getEmail())) {
//            throw new DuplicateResourceException("Email already exists");
//        }
//        if (studentRepository.existsByRollNumberAndActiveTrue(request.getRollNumber())) {
//            throw new DuplicateResourceException("Roll number already exists");
//        }
//
//        Student student = new Student();
//        student.setName(request.getName());
//        student.setEmail(request.getEmail());
//        student.setPassword(passwordEncoder.encode(request.getPassword()));
//        student.setMobileNumber(request.getMobileNumber());
//        student.setRole(Role.STUDENT);
//        student.setActive(true);
//        student.setRollNumber(request.getRollNumber());
//        student.setEnrollmentYear(request.getEnrollmentYear());
//        student.setAddress(request.getAddress());
//        student.setGuardianName(request.getGuardianName());
//
//        Student saved = studentRepository.save(student);
//        UserResponseDTO response = new UserResponseDTO();
//        response.setId(saved.getId());
//        response.setName(saved.getName());
//        response.setEmail(saved.getEmail());
//        response.setRole(saved.getRole());
//        response.setActive(saved.isActive());
//        return response;
//    }

    @Override
    public void logout(String token) {
        log.info("Logout called");
    }
}