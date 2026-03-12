package com.thekeyswitch.api.controller;

import com.thekeyswitch.api.model.SiteConfig;
import com.thekeyswitch.api.repository.SiteConfigRepository;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class SiteConfigController {

    private final SiteConfigRepository siteConfigRepository;

    public SiteConfigController(SiteConfigRepository siteConfigRepository) {
        this.siteConfigRepository = siteConfigRepository;
    }

    @QueryMapping
    public SiteConfig siteConfig(@Argument String key) {
        return siteConfigRepository.findById(key).orElse(null);
    }

    @QueryMapping
    public List<SiteConfig> allSiteConfig() {
        return siteConfigRepository.findAll();
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public SiteConfig updateSiteConfig(@Argument String key, @Argument Object value) {
        SiteConfig config = siteConfigRepository.findById(key)
                .orElseGet(() -> {
                    SiteConfig newConfig = new SiteConfig();
                    newConfig.setKey(key);
                    return newConfig;
                });

        config.setValue(value);

        return siteConfigRepository.save(config);
    }
}
