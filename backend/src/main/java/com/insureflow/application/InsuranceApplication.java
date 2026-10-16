package com.insureflow.application;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "insurance_application")
public class InsuranceApplication {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String applicantName;
    private String product;
    private String status;
    private double premium;
    private Instant submittedAt;

    protected InsuranceApplication() {}
    public InsuranceApplication(String applicantName, String product, String status, double premium) {
        this.applicantName = applicantName; this.product = product; this.status = status;
        this.premium = premium; this.submittedAt = Instant.now();
    }
    public Long getId() { return id; }
    public String getApplicantName() { return applicantName; }
    public String getProduct() { return product; }
    public String getStatus() { return status; }
    public double getPremium() { return premium; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setStatus(String status) { this.status = status; }
}
