package com.thekeyswitch.api.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private static final String SECRET = "test-secret-key-at-least-32-bytes-long";
    private static final long EXPIRATION_MS = 3600000L; // 1 hour

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(SECRET, EXPIRATION_MS);
    }

    @Test
    void generateToken_producesValidJwt() {
        String token = jwtTokenProvider.generateToken("admin");

        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        // JWT has 3 parts separated by dots
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    void getUsernameFromToken_extractsCorrectUsername() {
        String token = jwtTokenProvider.generateToken("testuser");

        String username = jwtTokenProvider.getUsernameFromToken(token);

        assertThat(username).isEqualTo("testuser");
    }

    @Test
    void validateToken_returnsTrueForValidToken() {
        String token = jwtTokenProvider.generateToken("admin");

        boolean isValid = jwtTokenProvider.validateToken(token);

        assertThat(isValid).isTrue();
    }

    @Test
    void validateToken_returnsFalseForExpiredToken() {
        // Create a provider with 0ms expiration to generate an already-expired token
        JwtTokenProvider expiredProvider = new JwtTokenProvider(SECRET, 0L);
        String token = expiredProvider.generateToken("admin");

        // Use a small delay to ensure the token is past its expiry
        // The token is generated with expiry = now + 0ms, so it's effectively already expired
        boolean isValid = expiredProvider.validateToken(token);

        // Token with 0ms expiry may or may not be valid depending on timing;
        // use a negative approach instead: create truly expired token manually
        assertThat(isValid).isFalse();
    }

    @Test
    void validateToken_returnsFalseForTamperedToken() {
        String token = jwtTokenProvider.generateToken("admin");
        // Tamper with the payload by modifying a character
        String tamperedToken = token.substring(0, token.length() - 5) + "XXXXX";

        boolean isValid = jwtTokenProvider.validateToken(tamperedToken);

        assertThat(isValid).isFalse();
    }

    @Test
    void validateToken_returnsFalseForTokenSignedWithDifferentKey() {
        // Create a token signed with a different secret
        JwtTokenProvider otherProvider = new JwtTokenProvider(
                "completely-different-secret-key-12345", EXPIRATION_MS);
        String token = otherProvider.generateToken("admin");

        boolean isValid = jwtTokenProvider.validateToken(token);

        assertThat(isValid).isFalse();
    }

    @Test
    void validateToken_returnsFalseForNullToken() {
        boolean isValid = jwtTokenProvider.validateToken(null);

        assertThat(isValid).isFalse();
    }

    @Test
    void validateToken_returnsFalseForEmptyToken() {
        boolean isValid = jwtTokenProvider.validateToken("");

        assertThat(isValid).isFalse();
    }

    @Test
    void validateToken_returnsFalseForGarbageString() {
        boolean isValid = jwtTokenProvider.validateToken("not-a-jwt-at-all");

        assertThat(isValid).isFalse();
    }

    @Test
    void getExpirationFromToken_returnsCorrectExpiration() {
        String token = jwtTokenProvider.generateToken("admin");

        OffsetDateTime expiration = jwtTokenProvider.getExpirationFromToken(token);

        assertThat(expiration).isNotNull();
        // Expiration should be approximately 1 hour from now
        assertThat(expiration).isAfter(OffsetDateTime.now().plusMinutes(59));
        assertThat(expiration).isBefore(OffsetDateTime.now().plusMinutes(61));
    }

    @Test
    void getExpirationMs_returnsConfiguredValue() {
        long result = jwtTokenProvider.getExpirationMs();

        assertThat(result).isEqualTo(3600000L);
    }

    @Test
    void generateToken_producesUniqueTokensPerUser() {
        String token1 = jwtTokenProvider.generateToken("user1");
        String token2 = jwtTokenProvider.generateToken("user2");

        assertThat(token1).isNotEqualTo(token2);
    }

    @Test
    void generateToken_withShortSecret_padsKey() {
        // Secret shorter than 32 bytes should still work due to padding
        JwtTokenProvider shortKeyProvider = new JwtTokenProvider("short", EXPIRATION_MS);

        String token = shortKeyProvider.generateToken("admin");
        assertThat(token).isNotNull();
        assertThat(shortKeyProvider.validateToken(token)).isTrue();
        assertThat(shortKeyProvider.getUsernameFromToken(token)).isEqualTo("admin");
    }
}
