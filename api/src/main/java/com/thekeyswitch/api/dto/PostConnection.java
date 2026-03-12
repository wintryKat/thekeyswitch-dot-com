package com.thekeyswitch.api.dto;

import com.thekeyswitch.api.model.Post;

import java.util.List;

public record PostConnection(
        List<Post> nodes,
        long totalCount,
        PageInfo pageInfo
) {
}
