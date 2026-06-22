package com.student.service;

import com.student.dto.request.JwtResponseDTO;
import com.student.dto.request.LoginRequestDTO;
import com.student.dto.request.RegisterRequestDTO;
import com.student.dto.response.UserResponseDTO;

public interface AuthService {

    JwtResponseDTO login(LoginRequestDTO loginRequest);
//
//    // Register method – can be used for student registration (public or admin)
//    UserResponseDTO register(RegisterRequestDTO registerRequest);

    void logout(String token);
}