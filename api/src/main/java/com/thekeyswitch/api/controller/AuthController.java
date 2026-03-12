package com.thekeyswitch.api.controller;

import com.thekeyswitch.api.dto.AuthPayload;
import com.thekeyswitch.api.service.AuthService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @MutationMapping
    public AuthPayload login(@Argument String username, @Argument String password) {
        return authService.login(username, password);
    }

    @MutationMapping
    public AuthPayload refreshToken(@Argument String token) {
        return authService.refreshToken(token);
    }
}
