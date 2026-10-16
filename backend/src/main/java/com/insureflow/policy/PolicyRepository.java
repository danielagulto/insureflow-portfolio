package com.insureflow.policy;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PolicyRepository extends JpaRepository<Policy, Long> {
    boolean existsByPolicyNumberIgnoreCase(String policyNumber);
}
