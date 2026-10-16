package com.insureflow.application;

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
    "spring.datasource.url=jdbc:h2:mem:application-test;DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class ApplicationApiTest {

    @Autowired
    MockMvc mvc;

    @Test
    @WithMockUser
    void createsApplicationAndUpdatesStatus() throws Exception {
        String body = mvc.perform(
                post("/api/applications")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"applicantName\":\"Taylor Reed\",\"product\":\"Home Secure\",\"premium\":350.0}")
            )
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("SUBMITTED"))
            .andReturn()
            .getResponse()
            .getContentAsString();

        long id = com.fasterxml.jackson.databind.json.JsonMapper
            .builder()
            .build()
            .readTree(body)
            .get("id")
            .asLong();

        mvc.perform(
                patch("/api/applications/" + id + "/status")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"status\":\"APPROVED\"}")
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("APPROVED"));
    }
}