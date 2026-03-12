package com.thekeyswitch.api.controller;

import com.thekeyswitch.api.service.MetricsProxyService;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class MetricsController {

    private final MetricsProxyService metricsProxyService;

    public MetricsController(MetricsProxyService metricsProxyService) {
        this.metricsProxyService = metricsProxyService;
    }

    @QueryMapping
    public Map<String, Object> systemMetrics() {
        return metricsProxyService.getSystemMetrics();
    }
}
