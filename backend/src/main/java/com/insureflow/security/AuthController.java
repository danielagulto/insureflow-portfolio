package com.insureflow.security;

import java.security.Principal;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {
    @GetMapping("/api/auth/session")
    public Map<String, String> session(Principal principal) {
        return Map.of("username", principal.getName(), "role", "ADMIN");
    }
}
