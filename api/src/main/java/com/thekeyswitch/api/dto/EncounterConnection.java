package com.thekeyswitch.api.dto;

import com.thekeyswitch.api.model.Encounter;

import java.util.List;

public record EncounterConnection(
        List<Encounter> nodes,
        long totalCount,
        PageInfo pageInfo
) {
}
