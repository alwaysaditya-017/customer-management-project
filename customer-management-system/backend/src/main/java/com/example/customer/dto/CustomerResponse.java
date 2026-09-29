package com.example.customer.dto;

import com.example.customer.entity.CustomerStatus;
import java.time.LocalDateTime;

public record CustomerResponse(
    Long id, String name, String email, String phoneNumber,
    String company, CustomerStatus status, LocalDateTime createdDate
) {}
