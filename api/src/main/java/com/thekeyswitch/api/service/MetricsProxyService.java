package com.thekeyswitch.api.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import java.util.*;

@Service
public class MetricsProxyService {

    private final RestTemplate restTemplate;
    private final String prometheusUrl;

    public MetricsProxyService(@Value("${prometheus.url:http://prometheus:9090}") String prometheusUrl) {
        this.restTemplate = new RestTemplate();
        this.prometheusUrl = prometheusUrl;
    }

    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        metrics.put("cpuUsagePercent", queryPrometheus("100 - (avg(rate(node_cpu_seconds_total{mode=\"idle\"}[1m])) * 100)"));
        metrics.put("memoryUsedBytes", queryPrometheus("node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes"));
        metrics.put("memoryTotalBytes", queryPrometheus("node_memory_MemTotal_bytes"));
        metrics.put("diskUsedBytes", queryPrometheus("node_filesystem_size_bytes{mountpoint=\"/\"} - node_filesystem_avail_bytes{mountpoint=\"/\"}"));
        metrics.put("diskTotalBytes", queryPrometheus("node_filesystem_size_bytes{mountpoint=\"/\"}"));
        metrics.put("uptimeSeconds", queryPrometheus("node_time_seconds - node_boot_time_seconds"));
        metrics.put("loadAverage1m", queryPrometheus("node_load1"));
        metrics.put("loadAverage5m", queryPrometheus("node_load5"));
        metrics.put("loadAverage15m", queryPrometheus("node_load15"));
        metrics.put("networkRxBytesPerSec", queryPrometheus("rate(node_network_receive_bytes_total{device!=\"lo\"}[1m])"));
        metrics.put("networkTxBytesPerSec", queryPrometheus("rate(node_network_transmit_bytes_total{device!=\"lo\"}[1m])"));
        metrics.put("containerMetrics", getContainerMetrics());
        metrics.put("timestamp", java.time.OffsetDateTime.now().toString());

        return metrics;
    }

    private double queryPrometheus(String query) {
        try {
            String url = prometheusUrl + "/api/v1/query?query=" + java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8);
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && "success".equals(response.get("status"))) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> result = (List<Map<String, Object>>) data.get("result");
                if (result != null && !result.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    List<Object> value = (List<Object>) result.get(0).get("value");
                    return Double.parseDouble(value.get(1).toString());
                }
            }
        } catch (Exception e) {
            // Return 0 if Prometheus is unavailable
        }
        return 0.0;
    }

    private List<Map<String, Object>> getContainerMetrics() {
        List<Map<String, Object>> containers = new ArrayList<>();
        try {
            // Get container CPU usage
            String cpuQuery = "rate(container_cpu_usage_seconds_total{name=~\".+\"}[1m]) * 100";
            String url = prometheusUrl + "/api/v1/query?query=" + java.net.URLEncoder.encode(cpuQuery, java.nio.charset.StandardCharsets.UTF_8);
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && "success".equals(response.get("status"))) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> results = (List<Map<String, Object>>) data.get("result");
                if (results != null) {
                    for (Map<String, Object> r : results) {
                        @SuppressWarnings("unchecked")
                        Map<String, String> metric = (Map<String, String>) r.get("metric");
                        @SuppressWarnings("unchecked")
                        List<Object> value = (List<Object>) r.get("value");
                        Map<String, Object> container = new HashMap<>();
                        container.put("name", metric.getOrDefault("name", "unknown"));
                        container.put("cpuPercent", Double.parseDouble(value.get(1).toString()));
                        container.put("memoryUsedBytes", 0L);
                        container.put("memoryLimitBytes", 0L);
                        container.put("status", "running");
                        containers.add(container);
                    }
                }
            }
        } catch (Exception e) {
            // Return empty list if Prometheus is unavailable
        }
        return containers;
    }
}
