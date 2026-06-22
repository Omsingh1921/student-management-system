package com.student.dto.response;

import com.student.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String createdAt;
    private Role role;      // ✅ change from String to Role
    private boolean active; // ✅ add this field

}