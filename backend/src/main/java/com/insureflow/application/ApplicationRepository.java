package com.insureflow.application;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<InsuranceApplication, Long> {}
