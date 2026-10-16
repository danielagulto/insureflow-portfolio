package com.insureflow.policy;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {
    private final PolicyRepository repository;
    public PolicyController(PolicyRepository repository) { this.repository = repository; }

    @GetMapping
    public List<Policy> all() { return repository.findAll(Sort.by(Sort.Direction.DESC, "id")); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Policy create(@Valid @RequestBody PolicyRequest request) {
        String number = request.policyNumber().trim().toUpperCase();
        if (repository.existsByPolicyNumberIgnoreCase(number)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Policy number already exists");
        return repository.save(new Policy(number, request.holder().trim(), request.product().trim(),
            normalizeStatus(request.status()), request.annualPremium(), request.startDate(), request.expiryDate()));
    }

    @PutMapping("/{id}")
    public Policy update(@PathVariable Long id, @Valid @RequestBody PolicyRequest request) {
        Policy policy = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found"));
        String number = request.policyNumber().trim().toUpperCase();
        if (!policy.getPolicyNumber().equalsIgnoreCase(number) && repository.existsByPolicyNumberIgnoreCase(number))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Policy number already exists");
        policy.update(request.holder().trim(), request.product().trim(), normalizeStatus(request.status()),
            request.annualPremium(), request.startDate(), request.expiryDate());
        return repository.save(policy);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        Policy policy = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found"));
        repository.delete(policy);
    }

    private String normalizeStatus(String value) {
        String status = value == null || value.isBlank() ? "ACTIVE" : value.trim().toUpperCase();
        if (!List.of("ACTIVE", "PENDING", "EXPIRED", "CANCELLED").contains(status))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid policy status");
        return status;
    }
    public record PolicyRequest(@NotBlank String policyNumber, @NotBlank String holder, @NotBlank String product,
        String status, @PositiveOrZero double annualPremium, LocalDate startDate, LocalDate expiryDate) {}
}
