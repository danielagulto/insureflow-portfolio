package com.insureflow.customer;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerRepository repository;
    public CustomerController(CustomerRepository repository) { this.repository = repository; }

    @GetMapping
    public List<Customer> all() { return repository.findAll(Sort.by(Sort.Direction.DESC, "id")); }

    @GetMapping("/{id}")
    public Customer one(@PathVariable Long id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Customer create(@Valid @RequestBody CustomerRequest request) {
        String email = request.email().trim().toLowerCase();
        if (repository.existsByEmailIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.CONFLICT, "A customer with this email already exists");
        return repository.save(new Customer(request.fullName().trim(), email, clean(request.phone())));
    }

    @PutMapping("/{id}")
    public Customer update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        Customer customer = one(id);
        String email = request.email().trim().toLowerCase();
        if (!customer.getEmail().equalsIgnoreCase(email) && repository.existsByEmailIgnoreCase(email))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A customer with this email already exists");
        customer.update(request.fullName().trim(), email, clean(request.phone()), request.status());
        return repository.save(customer);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        Customer customer = one(id);
        repository.delete(customer);
    }

    private static String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    public record CustomerRequest(@NotBlank String fullName, @Email @NotBlank String email, String phone, String status) {}
}
