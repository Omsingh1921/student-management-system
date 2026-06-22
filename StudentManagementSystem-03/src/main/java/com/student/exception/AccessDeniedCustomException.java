package com.student.exception;

public class AccessDeniedCustomException extends ApiException {
    public AccessDeniedCustomException(String message) {
        super(message, "ACCESS_DENIED", 403);
    }
}