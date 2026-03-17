package com.thekeyswitch.api.controller;

import com.thekeyswitch.api.service.AssetService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Map<String, String> requestUploadUrl(
            @Argument String filename,
            @Argument String contentType) {
        return assetService.generateUploadUrl(filename, contentType);
    }
}
