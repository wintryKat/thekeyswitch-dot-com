package com.thekeyswitch.api.dto;

public record PageInfo(
        boolean hasNextPage,
        boolean hasPreviousPage,
        int currentPage,
        int totalPages
) {
}
