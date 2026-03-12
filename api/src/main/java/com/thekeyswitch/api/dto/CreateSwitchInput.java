package com.thekeyswitch.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record CreateSwitchInput(
        String name,
        String manufacturer,
        String type,
        BigDecimal actuationForceGf,
        BigDecimal bottomOutForceGf,
        BigDecimal preTravelMm,
        BigDecimal totalTravelMm,
        String forceCurve,
        String soundProfile,
        String soundSampleUrl,
        String springType,
        String stemMaterial,
        String housingMaterial,
        BigDecimal priceUsd,
        String imageUrl,
        String sourceUrl,
        List<String> tags
) {
}
