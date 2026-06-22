package com.student.service.impl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.student.entity.Student;
import com.student.entity.Teacher;
import com.student.exception.ResourceNotFoundException;
import com.student.reposiotry.StudentRepository;
import com.student.reposiotry.TeacherRepository;
import com.student.utils.EmailUtil;
import com.student.utils.PasswordGeneratorUtil;

@Service
public class PasswordResetService {

    @Autowired private EmailUtil emailUtil;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private TeacherRepository teacherRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private PasswordGeneratorUtil passwordGenerator;

    public void resetPassword(String email) {
        // Generate new random password
        String generatedPassword = passwordGenerator.generateRandomPassword(12);

        // Check Teacher
        Optional<Teacher> teacherOpt = teacherRepo.findByEmailAndActiveTrue(email);
        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            teacher.setPassword(passwordEncoder.encode(generatedPassword));
            teacherRepo.save(teacher);
            emailUtil.sendNewPasswordEmail(teacher.getEmail(), teacher.getName(), generatedPassword, "Teacher");
            return;
        }

        // Check Student
        Optional<Student> studentOpt = studentRepo.findByEmailAndActiveTrue(email);
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            student.setPassword(passwordEncoder.encode(generatedPassword));
            studentRepo.save(student);
            emailUtil.sendNewPasswordEmail(student.getEmail(), student.getName(), generatedPassword, "Student");
            return;
        }

//        // If no user found
//        throw new ResourceNotFoundException("No active user found with email: " + email);
    }
}