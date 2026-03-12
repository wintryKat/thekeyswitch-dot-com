package com.thekeyswitch.api.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public record ImportEncounterInput(
        String filename,
        String platform,
        String title,
        String abstractText,
        List<String> tags,
        String content,
        Map<String, Object> frontMatter,
        OffsetDateTime sessionDate
) {
}
