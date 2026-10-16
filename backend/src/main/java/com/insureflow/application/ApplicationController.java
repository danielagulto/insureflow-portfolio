package com.insureflow.application;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    private final ApplicationRepository repository;
    private static final List<String> STATUSES = List.of("SUBMITTED", "IN_REVIEW", "APPROVED", "DECLINED");
    public ApplicationController(ApplicationRepository repository) { this.repository = repository; }

    @GetMapping
    public List<InsuranceApplication> all() {
        return repository.findAll(org.springframework.data.domain.Sort.by("id").descending());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InsuranceApplication create(@Valid @RequestBody CreateApplication request) {
        return repository.save(new InsuranceApplication(request.applicantName().trim(), request.product().trim(), "SUBMITTED", request.premium()));
    }

    @PatchMapping("/{id}/status")
    public InsuranceApplication updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "");
        if (!STATUSES.contains(status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        InsuranceApplication application = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
        application.setStatus(status);
        return repository.save(application);
    }

    public record CreateApplication(@NotBlank String applicantName, @NotBlank String product, @PositiveOrZero double premium) {}
}
