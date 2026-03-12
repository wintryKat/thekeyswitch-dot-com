package com.thekeyswitch.api.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public record UpdatePostInput(
        String slug,
        String title,
        String content,
        String excerpt,
        String authorType,
        String authorName,
        Map<String, Object> authorMeta,
        String status,
        List<String> tags,
        Integer readingTimeMinutes,
        OffsetDateTime publishedAt
) {
}
