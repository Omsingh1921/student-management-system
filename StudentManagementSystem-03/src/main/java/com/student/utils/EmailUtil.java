package com.student.utils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
public class EmailUtil {

    @Autowired
    private JavaMailSender mailSender;

    public void sendCredentials(String toEmail, String name, String rawPassword, String role) {
        String subject = "Welcome to Student Management System - Your " + role + " Account Created";
        String body = buildEmailBody(name, toEmail, rawPassword, role);

        try {
        	System.out.println("mailSender"+mailSender);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, true); // true = HTML content
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send registration email", e);
        }
    }

    private String buildEmailBody(String name, String email, String rawPassword, String role) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='font-family: Arial, sans-serif;'>" +
                "<h2>Welcome, " + name + "!</h2>" +
                "<p>Your " + role + " account has been successfully created.</p>" +
                "<p><strong>Login Credentials:</strong></p>" +
                "<ul>" +
                "<li><strong>Username (Email):</strong> " + email + "</li>" +
                "<li><strong>Password:</strong> " + rawPassword + "</li>" +
                "</ul>" +
                "<p>Please change your password after first login for security reasons.</p>" +
                "<p>Thank you,<br>Student Management System Team</p>" +
                "</body>" +
                "</html>";
    }
    
    public void sendNewPasswordEmail(String toEmail, String name, String newPassword, String role) {
        String subject = "Your Password Has Been Reset – Student Management System";
        String body = buildNewPasswordEmailBody(name, toEmail, newPassword, role);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset confirmation email", e);
        }
    }

    private String buildNewPasswordEmailBody(String name, String email, String newPassword, String role) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='font-family: Arial, sans-serif;'>" +
                "<h2>Hello " + name + ",</h2>" +
                "<p>Your " + role + " account password has been successfully reset.</p>" +
                "<p><strong>New Login Credentials:</strong></p>" +
                "<ul>" +
                "<li><strong>Username (Email):</strong> " + email + "</li>" +
                "<li><strong>New Password:</strong> " + newPassword + "</li>" +
                "</ul>" +
                "<p>For security reasons, please change this password after logging in.</p>" +
                "<p>If you did not request this reset, please contact support immediately.</p>" +
                "<p>Thank you,<br>Student Management System Team</p>" +
                "</body>" +
                "</html>";
    }
    
}