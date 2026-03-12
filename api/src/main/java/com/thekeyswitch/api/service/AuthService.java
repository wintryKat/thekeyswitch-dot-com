package com.thekeyswitch.api.service;

import com.thekeyswitch.api.dto.AuthPayload;
import com.thekeyswitch.api.model.AdminUser;
import com.thekeyswitch.api.repository.AdminUserRepository;
import com.thekeyswitch.api.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Service
public class AuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(AdminUserRepository adminUserRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthPayload login(String username, String password) {
        AdminUser user = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtTokenProvider.generateToken(username);
        OffsetDateTime expiresAt = Instant.now()
                .plusMillis(jwtTokenProvider.getExpirationMs())
                .atOffset(ZoneOffset.UTC);

        return new AuthPayload(token, expiresAt);
    }

    public AuthPayload refreshToken(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new IllegalArgumentException("Invalid or expired token");
        }

        String username = jwtTokenProvider.getUsernameFromToken(token);
        String newToken = jwtTokenProvider.generateToken(username);
        OffsetDateTime expiresAt = Instant.now()
                .plusMillis(jwtTokenProvider.getExpirationMs())
                .atOffset(ZoneOffset.UTC);

        return new AuthPayload(newToken, expiresAt);
    }

    @Transactional
    public boolean changePassword(String username, String currentPassword, String newPassword) {
        if (!StringUtils.hasText(newPassword)) {
            throw new IllegalArgumentException("New password must not be blank");
        }

        AdminUser user = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("New password must be different from the current password");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        adminUserRepository.save(user);
        return true;
    }
}
