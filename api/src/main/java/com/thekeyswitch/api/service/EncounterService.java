package com.thekeyswitch.api.service;

import com.thekeyswitch.api.dto.EncounterConnection;
import com.thekeyswitch.api.dto.ImportEncounterInput;
import com.thekeyswitch.api.dto.PageInfo;
import com.thekeyswitch.api.model.Encounter;
import com.thekeyswitch.api.repository.EncounterRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class EncounterService {

    private final EncounterRepository encounterRepository;

    public EncounterService(EncounterRepository encounterRepository) {
        this.encounterRepository = encounterRepository;
    }

    @Transactional(readOnly = true)
    public EncounterConnection getEncounters(String tag, String platform, Integer page, Integer pageSize) {
        int pageNum = (page != null && page > 0) ? page - 1 : 0;
        int size = (pageSize != null && pageSize > 0) ? Math.min(pageSize, 100) : 20;
        Pageable pageable = PageRequest.of(pageNum, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Encounter> result;
        if (platform != null && tag != null) {
            result = encounterRepository.findByPlatformAndTagsContaining(platform, tag, pageable);
        } else if (platform != null) {
            result = encounterRepository.findByPlatform(platform, pageable);
        } else if (tag != null) {
            result = encounterRepository.findByTagsContaining(tag, pageable);
        } else {
            result = encounterRepository.findAll(pageable);
        }

        PageInfo pageInfo = new PageInfo(
                result.hasNext(),
                result.hasPrevious(),
                pageNum + 1,
                result.getTotalPages()
        );

        return new EncounterConnection(result.getContent(), (int) result.getTotalElements(), pageInfo);
    }

    @Transactional(readOnly = true)
    public Encounter getEncounter(UUID id) {
        return encounterRepository.findById(id).orElse(null);
    }

    @Transactional
    public Encounter importEncounter(ImportEncounterInput input) {
        Encounter encounter = new Encounter();
        encounter.setFilename(input.filename());
        encounter.setPlatform(input.platform());
        encounter.setTitle(input.title());
        encounter.setAbstractText(input.abstractText());
        encounter.setTags(input.tags() != null ? input.tags() : List.of());
        encounter.setContent(input.content());
        encounter.setFrontMatter(input.frontMatter());
        encounter.setSessionDate(input.sessionDate());
        return encounterRepository.save(encounter);
    }
}
