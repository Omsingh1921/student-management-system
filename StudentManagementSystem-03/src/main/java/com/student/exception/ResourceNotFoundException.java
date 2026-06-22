package com.student.exception;

public class ResourceNotFoundException extends ApiException {
    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " not found with id: " + id, "RESOURCE_NOT_FOUND", 404);
    }

    public ResourceNotFoundException(String message) {
        super(message, "RESOURCE_NOT_FOUND", 404);
    }
}