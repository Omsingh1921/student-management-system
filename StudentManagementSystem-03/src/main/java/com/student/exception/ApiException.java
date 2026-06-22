package com.student.exception;

public abstract class ApiException extends RuntimeException {
    private final String errorCode;
    private final int status;

    public ApiException(String message, String errorCode, int status) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
    }

    public String getErrorCode() { return errorCode; }
    public int getStatus() { return status; }
}