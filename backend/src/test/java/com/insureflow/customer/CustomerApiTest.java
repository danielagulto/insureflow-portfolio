package com.insureflow.customer;

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
    "spring.datasource.url=jdbc:h2:mem:customer-test;DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class CustomerApiTest {

    @Autowired
    MockMvc mvc;

    @Test
    @WithMockUser
    void createsAndListsCustomer() throws Exception {
        mvc.perform(
                post("/api/customers")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"fullName\":\"Test Customer\",\"email\":\"test.customer@example.com\",\"phone\":\"+34 600 000 000\"}")
            )
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.email").value("test.customer@example.com"));

        mvc.perform(get("/api/customers"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@.email == 'test.customer@example.com')]").exists());
    }

    @Test
    void customerApiRequiresAuthentication() throws Exception {
        mvc.perform(get("/api/customers"))
            .andExpect(status().isUnauthorized());
    }
}