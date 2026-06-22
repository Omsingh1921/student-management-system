package com.student.exception;


public class BusinessValidationException extends ApiException {
    public BusinessValidationException(String message) {
        super(message, "BUSINESS_VALIDATION_FAILED", 400);
    }
}