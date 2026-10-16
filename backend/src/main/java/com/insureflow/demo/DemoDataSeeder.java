package com.insureflow.demo;

import com.insureflow.application.ApplicationRepository;
import com.insureflow.application.InsuranceApplication;
import com.insureflow.customer.Customer;
import com.insureflow.customer.CustomerRepository;
import com.insureflow.policy.Policy;
import com.insureflow.policy.PolicyRepository;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!no-demo-data")
public class DemoDataSeeder {
    @Bean
    CommandLineRunner seedDemoData(CustomerRepository customers, ApplicationRepository applications, PolicyRepository policies) {
        return args -> {
            if (customers.count() == 0) {
                customers.save(new Customer("Alex Morgan", "alex.morgan@example.com", "+34 600 111 222"));
                customers.save(new Customer("Sofia Bennett", "sofia.bennett@example.com", "+34 600 333 444"));
                customers.save(new Customer("Noah Williams", "noah.williams@example.com", "+34 600 555 666"));
            }
            if (applications.count() == 0) {
                applications.save(new InsuranceApplication("Alex Morgan", "Home Secure", "IN_REVIEW", 420.00));
                applications.save(new InsuranceApplication("Sofia Bennett", "Life Protect", "SUBMITTED", 680.00));
            }
            if (policies.count() == 0) {
                LocalDate today = LocalDate.now();
                policies.save(new Policy("POL-2026-0001", "Noah Williams", "Life Protect", "ACTIVE", 540.00, today.minusMonths(7), today.plusDays(28)));
                policies.save(new Policy("POL-2026-0002", "Sofia Bennett", "Home Secure", "ACTIVE", 390.00, today.minusMonths(4), today.plusDays(120)));
            }
        };
    }
}
