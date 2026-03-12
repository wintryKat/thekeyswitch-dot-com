package com.thekeyswitch.api.controller;

import com.thekeyswitch.api.dto.EncounterConnection;
import com.thekeyswitch.api.dto.ImportEncounterInput;
import com.thekeyswitch.api.model.Encounter;
import com.thekeyswitch.api.service.EncounterService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
public class EncounterController {

    private final EncounterService encounterService;

    public EncounterController(EncounterService encounterService) {
        this.encounterService = encounterService;
    }

    @QueryMapping
    public EncounterConnection encounters(@Argument String tag,
                                          @Argument String platform,
                                          @Argument Integer page,
                                          @Argument Integer pageSize) {
        return encounterService.getEncounters(tag, platform, page, pageSize);
    }

    @QueryMapping
    public Encounter encounter(@Argument String id) {
        return encounterService.getEncounter(UUID.fromString(id));
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Encounter importEncounter(@Argument ImportEncounterInput input) {
        return encounterService.importEncounter(input);
    }
}
