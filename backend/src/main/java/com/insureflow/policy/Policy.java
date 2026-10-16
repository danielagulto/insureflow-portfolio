package com.insureflow.policy;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

@Entity
@Table(name = "insurance_policy")
public class Policy {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false) private String policyNumber;
    @NotBlank private String holder;
    @NotBlank private String product;
    @Column(nullable = false) private String status = "ACTIVE";
    @PositiveOrZero private double annualPremium;
    private LocalDate startDate;
    private LocalDate expiryDate;

    protected Policy() {}
    public Policy(String policyNumber, String holder, String product, String status, double annualPremium, LocalDate startDate, LocalDate expiryDate) {
        this.policyNumber = policyNumber; this.holder = holder; this.product = product;
        this.status = status; this.annualPremium = annualPremium; this.startDate = startDate; this.expiryDate = expiryDate;
    }
    public Long getId() { return id; }
    public String getPolicyNumber() { return policyNumber; }
    public String getHolder() { return holder; }
    public String getProduct() { return product; }
    public String getStatus() { return status; }
    public double getAnnualPremium() { return annualPremium; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void update(String holder, String product, String status, double annualPremium, LocalDate startDate, LocalDate expiryDate) {
        this.holder = holder; this.product = product; this.status = status;
        this.annualPremium = annualPremium; this.startDate = startDate; this.expiryDate = expiryDate;
    }
}
