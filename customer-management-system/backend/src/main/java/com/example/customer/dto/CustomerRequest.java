package com.example.customer.dto;

import com.example.customer.entity.CustomerStatus;
import jakarta.validation.constraints.*;

public record CustomerRequest(
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    String email,

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+()\\- ]{7,20}$", message = "Enter a valid phone number")
    String phoneNumber,

    @NotBlank(message = "Company is required")
    @Size(max = 150, message = "Company must not exceed 150 characters")
    String company,

    @NotNull(message = "Status is required")
    CustomerStatus status
) {}
