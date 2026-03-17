package com.thekeyswitch.api.service;

import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class AssetService {

    private final BlobContainerClient containerClient;
    private final String cdnEndpoint;

    public AssetService(
            @Value("${azure.storage.connection-string:}") String connectionString,
            @Value("${azure.storage.container:switch-assets}") String containerName,
            @Value("${azure.cdn.endpoint:}") String cdnEndpoint) {
        this.cdnEndpoint = cdnEndpoint;
        if (connectionString != null && !connectionString.isBlank()) {
            BlobServiceClient serviceClient = new BlobServiceClientBuilder()
                    .connectionString(connectionString)
                    .buildClient();
            this.containerClient = serviceClient.getBlobContainerClient(containerName);
        } else {
            this.containerClient = null;
        }
    }

    /**
     * Generate a SAS URL for direct browser-to-blob upload and the resulting CDN URL.
     *
     * @param filename    Original filename (used for extension extraction)
     * @param contentType MIME type of the file
     * @return Map with "uploadUrl" (SAS URL for PUT) and "cdnUrl" (public read URL)
     */
    public Map<String, String> generateUploadUrl(String filename, String contentType) {
        if (containerClient == null) {
            throw new IllegalStateException("Azure Storage is not configured. Set azure.storage.connection-string.");
        }

        // Generate a unique blob name to prevent collisions
        String extension = "";
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = filename.substring(dotIndex);
        }
        String blobName = UUID.randomUUID() + extension;

        var blobClient = containerClient.getBlobClient(blobName);

        // Create SAS token valid for 15 minutes, write-only
        BlobSasPermission permission = new BlobSasPermission().setWritePermission(true).setCreatePermission(true);
        BlobServiceSasSignatureValues sasValues = new BlobServiceSasSignatureValues(
                OffsetDateTime.now().plusMinutes(15), permission)
                .setContentType(contentType);

        String sasToken = blobClient.generateSas(sasValues);
        String uploadUrl = blobClient.getBlobUrl() + "?" + sasToken;

        // CDN URL for reading the blob after upload
        String publicUrl;
        if (cdnEndpoint != null && !cdnEndpoint.isBlank()) {
            publicUrl = "https://" + cdnEndpoint + "/" + containerClient.getBlobContainerName() + "/" + blobName;
        } else {
            // Fall back to direct blob URL
            publicUrl = blobClient.getBlobUrl();
        }

        return Map.of("uploadUrl", uploadUrl, "cdnUrl", publicUrl);
    }
}
