package com.thekeyswitch.api.controller;

import com.thekeyswitch.api.dto.CreateSwitchInput;
import com.thekeyswitch.api.dto.SwitchConnection;
import com.thekeyswitch.api.dto.UpdateSwitchInput;
import com.thekeyswitch.api.model.Switch;
import com.thekeyswitch.api.service.SwitchService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Controller
public class SwitchController {

    private final SwitchService switchService;

    public SwitchController(SwitchService switchService) {
        this.switchService = switchService;
    }

    @QueryMapping
    public SwitchConnection switches(@Argument String type,
                                     @Argument String manufacturer,
                                     @Argument Integer page,
                                     @Argument Integer pageSize) {
        return switchService.getSwitches(type, manufacturer, page, pageSize);
    }

    @QueryMapping(name = "switch")
    public Switch getSwitch(@Argument String id) {
        return switchService.getSwitch(UUID.fromString(id));
    }

    @QueryMapping
    public List<Switch> compareSwitches(@Argument List<String> ids) {
        List<UUID> uuids = ids.stream()
                .map(UUID::fromString)
                .collect(Collectors.toList());
        return switchService.compareSwitches(uuids);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Switch createSwitch(@Argument CreateSwitchInput input) {
        return switchService.createSwitch(input);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Switch updateSwitch(@Argument String id, @Argument UpdateSwitchInput input) {
        return switchService.updateSwitch(UUID.fromString(id), input);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public boolean deleteSwitch(@Argument String id) {
        return switchService.deleteSwitch(UUID.fromString(id));
    }
}
