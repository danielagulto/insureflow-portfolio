package com.insureflow.customer;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

@Entity
@Table(name = "customers")
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank private String fullName;
    @Email @NotBlank @Column(unique = true, nullable = false)
    private String email;
    private String phone;
    @Column(nullable = false) private String status = "ACTIVE";
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();

    protected Customer() {}
    public Customer(String fullName, String email, String phone) {
        this.fullName = fullName; this.email = email; this.phone = phone;
    }
    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public void update(String fullName, String email, String phone, String status) {
        this.fullName = fullName; this.email = email; this.phone = phone;
        if (status != null && !status.isBlank()) this.status = status;
    }
}
