package com.example.customer.service;

import com.example.customer.dto.*;
import org.springframework.data.domain.Page;

public interface CustomerService {
    Page<CustomerResponse> getCustomers(String search, int page, int size, String sortBy, String direction);
    CustomerResponse getCustomer(Long id);
    CustomerResponse createCustomer(CustomerRequest request);
    CustomerResponse updateCustomer(Long id, CustomerRequest request);
    void deleteCustomer(Long id);
}
