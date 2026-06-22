package com.student.exception;

public class InvalidOperationException extends ApiException {
    public InvalidOperationException(String message) {
        super(message, "INVALID_OPERATION", 400);
    }
}