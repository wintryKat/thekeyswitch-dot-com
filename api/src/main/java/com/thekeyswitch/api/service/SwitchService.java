package com.thekeyswitch.api.service;

import com.thekeyswitch.api.dto.CreateSwitchInput;
import com.thekeyswitch.api.dto.PageInfo;
import com.thekeyswitch.api.dto.SwitchConnection;
import com.thekeyswitch.api.dto.UpdateSwitchInput;
import com.thekeyswitch.api.model.Switch;
import com.thekeyswitch.api.repository.SwitchRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SwitchService {

    private final SwitchRepository switchRepository;

    public SwitchService(SwitchRepository switchRepository) {
        this.switchRepository = switchRepository;
    }

    @Transactional(readOnly = true)
    public SwitchConnection getSwitches(String type, String manufacturer, Integer page, Integer pageSize) {
        int pageNum = (page != null && page > 0) ? page - 1 : 0;
        int size = (pageSize != null && pageSize > 0) ? Math.min(pageSize, 100) : 20;
        Pageable pageable = PageRequest.of(pageNum, size, Sort.by(Sort.Direction.ASC, "name"));

        Page<Switch> result;
        if (type != null && manufacturer != null) {
            result = switchRepository.findByTypeAndManufacturer(type, manufacturer, pageable);
        } else if (type != null) {
            result = switchRepository.findByType(type, pageable);
        } else if (manufacturer != null) {
            result = switchRepository.findByManufacturer(manufacturer, pageable);
        } else {
            result = switchRepository.findAll(pageable);
        }

        PageInfo pageInfo = new PageInfo(
                result.hasNext(),
                result.hasPrevious(),
                pageNum + 1,
                result.getTotalPages()
        );

        return new SwitchConnection(result.getContent(), result.getTotalElements(), pageInfo);
    }

    @Transactional(readOnly = true)
    public Switch getSwitch(UUID id) {
        return switchRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<Switch> compareSwitches(List<UUID> ids) {
        return switchRepository.findAllById(ids);
    }

    @Transactional
    public Switch createSwitch(CreateSwitchInput input) {
        Switch sw = new Switch();
        sw.setName(input.name());
        sw.setManufacturer(input.manufacturer());
        sw.setType(input.type());
        sw.setActuationForceGf(input.actuationForceGf());
        sw.setBottomOutForceGf(input.bottomOutForceGf());
        sw.setPreTravelMm(input.preTravelMm());
        sw.setTotalTravelMm(input.totalTravelMm());
        sw.setForceCurve(input.forceCurve());
        sw.setSoundProfile(input.soundProfile());
        sw.setSoundSampleUrl(input.soundSampleUrl());
        sw.setSpringType(input.springType());
        sw.setStemMaterial(input.stemMaterial());
        sw.setHousingMaterial(input.housingMaterial());
        sw.setPriceUsd(input.priceUsd());
        sw.setImageUrl(input.imageUrl());
        sw.setSourceUrl(input.sourceUrl());
        sw.setTags(input.tags() != null ? input.tags() : List.of());
        return switchRepository.save(sw);
    }

    @Transactional
    public Switch updateSwitch(UUID id, UpdateSwitchInput input) {
        Switch sw = switchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Switch not found: " + id));

        if (input.name() != null) sw.setName(input.name());
        if (input.manufacturer() != null) sw.setManufacturer(input.manufacturer());
        if (input.type() != null) sw.setType(input.type());
        if (input.actuationForceGf() != null) sw.setActuationForceGf(input.actuationForceGf());
        if (input.bottomOutForceGf() != null) sw.setBottomOutForceGf(input.bottomOutForceGf());
        if (input.preTravelMm() != null) sw.setPreTravelMm(input.preTravelMm());
        if (input.totalTravelMm() != null) sw.setTotalTravelMm(input.totalTravelMm());
        if (input.forceCurve() != null) sw.setForceCurve(input.forceCurve());
        if (input.soundProfile() != null) sw.setSoundProfile(input.soundProfile());
        if (input.soundSampleUrl() != null) sw.setSoundSampleUrl(input.soundSampleUrl());
        if (input.springType() != null) sw.setSpringType(input.springType());
        if (input.stemMaterial() != null) sw.setStemMaterial(input.stemMaterial());
        if (input.housingMaterial() != null) sw.setHousingMaterial(input.housingMaterial());
        if (input.priceUsd() != null) sw.setPriceUsd(input.priceUsd());
        if (input.imageUrl() != null) sw.setImageUrl(input.imageUrl());
        if (input.sourceUrl() != null) sw.setSourceUrl(input.sourceUrl());
        if (input.tags() != null) sw.setTags(input.tags());

        return switchRepository.save(sw);
    }

    @Transactional
    public boolean deleteSwitch(UUID id) {
        if (switchRepository.existsById(id)) {
            switchRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
