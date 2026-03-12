package com.thekeyswitch.api.dto;

import com.thekeyswitch.api.model.Switch;

import java.util.List;

public record SwitchConnection(
        List<Switch> nodes,
        long totalCount,
        PageInfo pageInfo
) {
}
