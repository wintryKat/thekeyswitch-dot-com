package com.thekeyswitch.api.controller;

import com.thekeyswitch.api.config.GraphQlConfig;
import com.thekeyswitch.api.config.MethodSecurityTestConfig;
import com.thekeyswitch.api.dto.AuthPayload;
import com.thekeyswitch.api.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.GraphQlTest;
import org.springframework.context.annotation.Import;
import org.springframework.graphql.test.tester.GraphQlTester;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@GraphQlTest(AuthController.class)
@Import({GraphQlConfig.class, MethodSecurityTestConfig.class})
class AuthControllerIntegrationTest {

    @Autowired
    private GraphQlTester graphQlTester;

    @MockitoBean
    private AuthService authService;

    // ── Mutation: login ───────────────────────────────────────────────────────

    @Test
    void login_withValidCredentials_returnsAuthPayload() {
        OffsetDateTime expiresAt = OffsetDateTime.now(ZoneOffset.UTC).plusHours(1);
        AuthPayload payload = new AuthPayload("jwt.token.value", expiresAt);
        when(authService.login("admin", "password123")).thenReturn(payload);

        graphQlTester.document("""
                    mutation {
                        login(username: "admin", password: "password123") {
                            token
                        }
                    }
                """)
                .execute()
                .path("login.token").entity(String.class).isEqualTo("jwt.token.value");
    }

    @Test
    void login_withInvalidCredentials_returnsError() {
        when(authService.login("admin", "wrong"))
                .thenThrow(new IllegalArgumentException("Invalid credentials"));

        graphQlTester.document("""
                    mutation {
                        login(username: "admin", password: "wrong") {
                            token
                        }
                    }
                """)
                .execute()
                .errors()
                .satisfy(errors -> assertThat(errors).isNotEmpty());
    }

    // ── Mutation: refreshToken ────────────────────────────────────────────────

    @Test
    void refreshToken_withValidToken_returnsNewPayload() {
        OffsetDateTime expiresAt = OffsetDateTime.now(ZoneOffset.UTC).plusHours(1);
        AuthPayload payload = new AuthPayload("new.jwt.token", expiresAt);
        when(authService.refreshToken("old.jwt.token")).thenReturn(payload);

        graphQlTester.document("""
                    mutation {
                        refreshToken(token: "old.jwt.token") {
                            token
                        }
                    }
                """)
                .execute()
                .path("refreshToken.token").entity(String.class).isEqualTo("new.jwt.token");
    }

    @Test
    void refreshToken_withInvalidToken_returnsError() {
        when(authService.refreshToken("bad.token"))
                .thenThrow(new IllegalArgumentException("Invalid or expired token"));

        graphQlTester.document("""
                    mutation {
                        refreshToken(token: "bad.token") {
                            token
                        }
                    }
                """)
                .execute()
                .errors()
                .satisfy(errors -> assertThat(errors).isNotEmpty());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void changePassword_whenAuthenticated_returnsTrue() {
        when(authService.changePassword("admin", "current-password", "new-password"))
                .thenReturn(true);

        graphQlTester.document("""
                    mutation {
                        changePassword(currentPassword: "current-password", newPassword: "new-password")
                    }
                """)
                .execute()
                .path("changePassword").entity(Boolean.class).isEqualTo(true);
    }

    @Test
    void changePassword_whenUnauthenticated_returnsError() {
        graphQlTester.document("""
                    mutation {
                        changePassword(currentPassword: "current-password", newPassword: "new-password")
                    }
                """)
                .execute()
                .errors()
                .satisfy(errors -> assertThat(errors).isNotEmpty());
    }
}
