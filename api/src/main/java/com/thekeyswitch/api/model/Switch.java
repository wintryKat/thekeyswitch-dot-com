package com.thekeyswitch.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "switches")
public class Switch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 255)
    private String manufacturer;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(name = "actuation_force_gf", precision = 5, scale = 1)
    private BigDecimal actuationForceGf;

    @Column(name = "bottom_out_force_gf", precision = 5, scale = 1)
    private BigDecimal bottomOutForceGf;

    @Column(name = "pre_travel_mm", precision = 4, scale = 2)
    private BigDecimal preTravelMm;

    @Column(name = "total_travel_mm", precision = 4, scale = 2)
    private BigDecimal totalTravelMm;

    @Column(name = "force_curve", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String forceCurve;

    @Column(name = "sound_profile", length = 100)
    private String soundProfile;

    @Column(name = "sound_sample_url", length = 500)
    private String soundSampleUrl;

    @Column(name = "spring_type", length = 100)
    private String springType;

    @Column(name = "stem_material", length = 100)
    private String stemMaterial;

    @Column(name = "housing_material", length = 100)
    private String housingMaterial;

    @Column(name = "price_usd", precision = 8, scale = 2)
    private BigDecimal priceUsd;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @Column(columnDefinition = "TEXT[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> tags;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getActuationForceGf() {
        return actuationForceGf;
    }

    public void setActuationForceGf(BigDecimal actuationForceGf) {
        this.actuationForceGf = actuationForceGf;
    }

    public BigDecimal getBottomOutForceGf() {
        return bottomOutForceGf;
    }

    public void setBottomOutForceGf(BigDecimal bottomOutForceGf) {
        this.bottomOutForceGf = bottomOutForceGf;
    }

    public BigDecimal getPreTravelMm() {
        return preTravelMm;
    }

    public void setPreTravelMm(BigDecimal preTravelMm) {
        this.preTravelMm = preTravelMm;
    }

    public BigDecimal getTotalTravelMm() {
        return totalTravelMm;
    }

    public void setTotalTravelMm(BigDecimal totalTravelMm) {
        this.totalTravelMm = totalTravelMm;
    }

    public String getForceCurve() {
        return forceCurve;
    }

    public void setForceCurve(String forceCurve) {
        this.forceCurve = forceCurve;
    }

    public String getSoundProfile() {
        return soundProfile;
    }

    public void setSoundProfile(String soundProfile) {
        this.soundProfile = soundProfile;
    }

    public String getSoundSampleUrl() {
        return soundSampleUrl;
    }

    public void setSoundSampleUrl(String soundSampleUrl) {
        this.soundSampleUrl = soundSampleUrl;
    }

    public String getSpringType() {
        return springType;
    }

    public void setSpringType(String springType) {
        this.springType = springType;
    }

    public String getStemMaterial() {
        return stemMaterial;
    }

    public void setStemMaterial(String stemMaterial) {
        this.stemMaterial = stemMaterial;
    }

    public String getHousingMaterial() {
        return housingMaterial;
    }

    public void setHousingMaterial(String housingMaterial) {
        this.housingMaterial = housingMaterial;
    }

    public BigDecimal getPriceUsd() {
        return priceUsd;
    }

    public void setPriceUsd(BigDecimal priceUsd) {
        this.priceUsd = priceUsd;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
