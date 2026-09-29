package com.example.customer.service;

import com.example.customer.dto.*;
import com.example.customer.entity.Customer;
import com.example.customer.exception.*;
import com.example.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository repository;

    private static final Set<String> SORT_FIELDS =
        Set.of("name", "email", "phoneNumber", "company", "status", "createdDate");

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> getCustomers(String search, int page, int size,
                                                String sortBy, String direction) {
        page = Math.max(page, 0);
        if (size < 1 || size > 100) size = 10;
        if (!SORT_FIELDS.contains(sortBy)) sortBy = "createdDate";

        Sort.Direction dir = "asc".equalsIgnoreCase(direction)
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));

        Page<Customer> result = search == null || search.isBlank()
                ? repository.findAll(pageable)
                : repository.search(search.trim(), pageable);

        return result.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomer(Long id) {
        return toResponse(find(id));
    }

    @Override
    public CustomerResponse createCustomer(CustomerRequest request) {
        String email = request.email().trim().toLowerCase();
        if (repository.existsByEmailIgnoreCase(email))
            throw new DuplicateEmailException("A customer with this email already exists");

        Customer c = Customer.builder()
                .name(request.name().trim())
                .email(email)
                .phoneNumber(request.phoneNumber().trim())
                .company(request.company().trim())
                .status(request.status())
                .build();
        return toResponse(repository.save(c));
    }

    @Override
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer c = find(id);
        String email = request.email().trim().toLowerCase();

        if (repository.existsByEmailIgnoreCaseAndIdNot(email, id))
            throw new DuplicateEmailException("A customer with this email already exists");

        c.setName(request.name().trim());
        c.setEmail(email);
        c.setPhoneNumber(request.phoneNumber().trim());
        c.setCompany(request.company().trim());
        c.setStatus(request.status());

        return toResponse(repository.save(c));
    }

    @Override
    public void deleteCustomer(Long id) {
        repository.delete(find(id));
    }

    private Customer find(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    private CustomerResponse toResponse(Customer c) {
        return new CustomerResponse(c.getId(), c.getName(), c.getEmail(),
                c.getPhoneNumber(), c.getCompany(), c.getStatus(), c.getCreatedDate());
    }
}
