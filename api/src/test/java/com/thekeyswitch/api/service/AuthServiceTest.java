package com.thekeyswitch.api.service;

import com.thekeyswitch.api.dto.AuthPayload;
import com.thekeyswitch.api.model.AdminUser;
import com.thekeyswitch.api.repository.AdminUserRepository;
import com.thekeyswitch.api.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private AdminUser adminUser;

    @BeforeEach
    void setUp() {
        adminUser = new AdminUser();
        adminUser.setUsername("admin");
        adminUser.setPasswordHash("$2a$10$hashedpassword");
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    void login_withValidCredentials_returnsAuthPayload() {
        when(adminUserRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(passwordEncoder.matches("password123", "$2a$10$hashedpassword")).thenReturn(true);
        when(jwtTokenProvider.generateToken("admin")).thenReturn("jwt.token.here");
        when(jwtTokenProvider.getExpirationMs()).thenReturn(3600000L);

        AuthPayload result = authService.login("admin", "password123");

        assertThat(result.token()).isEqualTo("jwt.token.here");
        assertThat(result.expiresAt()).isNotNull();
    }

    @Test
    void login_withWrongPassword_throwsException() {
        when(adminUserRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(passwordEncoder.matches("wrongpassword", "$2a$10$hashedpassword")).thenReturn(false);

        assertThatThrownBy(() -> authService.login("admin", "wrongpassword"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void login_withNonExistentUser_throwsException() {
        when(adminUserRepository.findByUsername("nobody")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login("nobody", "password"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid credentials");
    }

    // ── refreshToken ──────────────────────────────────────────────────────────

    @Test
    void refreshToken_withValidToken_returnsNewPayload() {
        when(jwtTokenProvider.validateToken("old.token")).thenReturn(true);
        when(jwtTokenProvider.getUsernameFromToken("old.token")).thenReturn("admin");
        when(jwtTokenProvider.generateToken("admin")).thenReturn("new.token");
        when(jwtTokenProvider.getExpirationMs()).thenReturn(3600000L);

        AuthPayload result = authService.refreshToken("old.token");

        assertThat(result.token()).isEqualTo("new.token");
        assertThat(result.expiresAt()).isNotNull();
    }

    @Test
    void refreshToken_withInvalidToken_throwsException() {
        when(jwtTokenProvider.validateToken("bad.token")).thenReturn(false);

        assertThatThrownBy(() -> authService.refreshToken("bad.token"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid or expired token");
    }

    @Test
    void changePassword_withValidCredentials_updatesStoredHash() {
        when(adminUserRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(passwordEncoder.matches("current-password", "$2a$10$hashedpassword")).thenReturn(true);
        when(passwordEncoder.matches("new-password", "$2a$10$hashedpassword")).thenReturn(false);
        when(passwordEncoder.encode("new-password")).thenReturn("$2a$10$newhash");
        when(adminUserRepository.save(any(AdminUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        boolean changed = authService.changePassword("admin", "current-password", "new-password");

        assertThat(changed).isTrue();
        assertThat(adminUser.getPasswordHash()).isEqualTo("$2a$10$newhash");
        verify(adminUserRepository).save(adminUser);
    }

    @Test
    void changePassword_withWrongCurrentPassword_throwsException() {
        when(adminUserRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(passwordEncoder.matches("wrong-password", "$2a$10$hashedpassword")).thenReturn(false);

        assertThatThrownBy(() -> authService.changePassword("admin", "wrong-password", "new-password"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Current password is incorrect");
    }

    @Test
    void changePassword_withBlankNewPassword_throwsException() {
        assertThatThrownBy(() -> authService.changePassword("admin", "current-password", " "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("New password must not be blank");
    }

    @Test
    void changePassword_withSamePassword_throwsException() {
        when(adminUserRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(passwordEncoder.matches("current-password", "$2a$10$hashedpassword")).thenReturn(true);
        when(passwordEncoder.matches("current-password", "$2a$10$hashedpassword")).thenReturn(true);

        assertThatThrownBy(() -> authService.changePassword("admin", "current-password", "current-password"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("New password must be different from the current password");
    }
}
