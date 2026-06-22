package com.student.utils;

import org.springframework.stereotype.Component;
import java.security.SecureRandom;

@Component
public class PasswordGeneratorUtil {

    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER = UPPER.toLowerCase();
    private static final String DIGITS = "0123456789";
    private static final String SPECIAL = "!@#$%^&*_+";
    private static final String ALL_CHARS = UPPER + LOWER + DIGITS + SPECIAL;
    private static final SecureRandom RANDOM = new SecureRandom();

    public String generateRandomPassword(int length) {
        if (length < 8) length = 10;
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = RANDOM.nextInt(ALL_CHARS.length());
            sb.append(ALL_CHARS.charAt(index));
        }
        return sb.toString();
    }
}