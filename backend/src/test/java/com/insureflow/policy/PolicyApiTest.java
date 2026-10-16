package com.insureflow.policy;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:policy-test;DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class PolicyApiTest {

    @Autowired
    MockMvc mvc;

    @Test
    @WithMockUser
    void createsAndListsPolicy() throws Exception {
        mvc.perform(
                post("/api/policies")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"policyNumber\":\"TEST-1001\",\"holder\":\"Jordan Lee\",\"product\":\"Life Protect\",\"status\":\"ACTIVE\",\"annualPremium\":520.0,\"startDate\":\"2026-01-01\",\"expiryDate\":\"2027-01-01\"}")
            )
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.policyNumber").value("TEST-1001"));

        mvc.perform(get("/api/policies"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@.policyNumber == 'TEST-1001')]").exists());
    }
}