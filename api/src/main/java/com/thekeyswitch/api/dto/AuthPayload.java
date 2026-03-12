package com.thekeyswitch.api.dto;

import java.time.OffsetDateTime;

public record AuthPayload(
        String token,
        OffsetDateTime expiresAt
) {
}
