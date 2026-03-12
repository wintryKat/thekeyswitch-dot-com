package com.thekeyswitch.api.config;

import com.thekeyswitch.api.security.JwtAuthenticationFilter;
import com.thekeyswitch.api.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.stereotype.Controller;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SecurityConfigTest.TestController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void actuatorHealth_fromLoopback_isAllowed() throws Exception {
        mockMvc.perform(get("/actuator/health")
                        .with(request -> {
                            request.setRemoteAddr("127.0.0.1");
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(content().string("ok"));
    }

    @Test
    void actuatorPrometheus_fromInternalNetwork_isAllowed() throws Exception {
        mockMvc.perform(get("/actuator/prometheus")
                        .with(request -> {
                            request.setRemoteAddr("172.18.0.10");
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(content().string("metrics"));
    }

    @Test
    void actuatorHealth_fromExternalAddress_isForbidden() throws Exception {
        mockMvc.perform(get("/actuator/health")
                        .with(request -> {
                            request.setRemoteAddr("8.8.8.8");
                            return request;
                        }))
                .andExpect(status().isForbidden());
    }

    @Test
    void protectedEndpoint_requiresAuthentication() throws Exception {
        mockMvc.perform(get("/secure"))
                .andExpect(status().isForbidden());
    }

    @Test
    void protectedEndpoint_withAuthenticatedUser_isAllowed() throws Exception {
        mockMvc.perform(get("/secure")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(content().string("secure"));
    }

    @Controller
    @EnableMethodSecurity
    static class TestController {

        @GetMapping(path = "/actuator/health", produces = MediaType.TEXT_PLAIN_VALUE)
        @ResponseBody
        String health() {
            return "ok";
        }

        @GetMapping(path = "/actuator/prometheus", produces = MediaType.TEXT_PLAIN_VALUE)
        @ResponseBody
        String prometheus() {
            return "metrics";
        }

        @GetMapping(path = "/secure", produces = MediaType.TEXT_PLAIN_VALUE)
        @ResponseBody
        String secure() {
            return "secure";
        }
    }
}
