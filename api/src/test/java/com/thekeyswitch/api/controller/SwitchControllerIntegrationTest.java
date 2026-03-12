package com.thekeyswitch.api.controller;

import com.thekeyswitch.api.config.GraphQlConfig;
import com.thekeyswitch.api.config.MethodSecurityTestConfig;
import com.thekeyswitch.api.dto.PageInfo;
import com.thekeyswitch.api.dto.SwitchConnection;
import com.thekeyswitch.api.model.Switch;
import com.thekeyswitch.api.service.SwitchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.GraphQlTest;
import org.springframework.context.annotation.Import;
import org.springframework.graphql.test.tester.GraphQlTester;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@GraphQlTest(SwitchController.class)
@Import({GraphQlConfig.class, MethodSecurityTestConfig.class})
class SwitchControllerIntegrationTest {

    @Autowired
    private GraphQlTester graphQlTester;

    @MockitoBean
    private SwitchService switchService;

    private Switch sampleSwitch;
    private UUID switchId;

    @BeforeEach
    void setUp() {
        switchId = UUID.randomUUID();
        sampleSwitch = new Switch();
        sampleSwitch.setId(switchId);
        sampleSwitch.setName("Cherry MX Red");
        sampleSwitch.setManufacturer("Cherry");
        sampleSwitch.setType("LINEAR");
        sampleSwitch.setActuationForceGf(new BigDecimal("45.0"));
        sampleSwitch.setBottomOutForceGf(new BigDecimal("60.0"));
        sampleSwitch.setPreTravelMm(new BigDecimal("2.00"));
        sampleSwitch.setTotalTravelMm(new BigDecimal("4.00"));
        sampleSwitch.setSoundProfile("quiet");
        sampleSwitch.setSpringType("standard");
        sampleSwitch.setStemMaterial("POM");
        sampleSwitch.setHousingMaterial("Nylon");
        sampleSwitch.setPriceUsd(new BigDecimal("0.30"));
        sampleSwitch.setTags(List.of("linear", "cherry"));
        sampleSwitch.setCreatedAt(OffsetDateTime.now());
        sampleSwitch.setUpdatedAt(OffsetDateTime.now());
    }

    // ── Query: switches ───────────────────────────────────────────────────────

    @Test
    void querySwitches_returnsPaginatedResults() {
        SwitchConnection connection = new SwitchConnection(
                List.of(sampleSwitch), 1,
                new PageInfo(false, false, 1, 1)
        );
        when(switchService.getSwitches(null, null, null, null)).thenReturn(connection);

        graphQlTester.document("""
                    {
                        switches {
                            totalCount
                            nodes { name manufacturer type }
                            pageInfo { hasNextPage currentPage totalPages }
                        }
                    }
                """)
                .execute()
                .path("switches.totalCount").entity(Integer.class).isEqualTo(1)
                .path("switches.nodes[0].name").entity(String.class).isEqualTo("Cherry MX Red")
                .path("switches.nodes[0].manufacturer").entity(String.class).isEqualTo("Cherry")
                .path("switches.nodes[0].type").entity(String.class).isEqualTo("LINEAR")
                .path("switches.pageInfo.hasNextPage").entity(Boolean.class).isEqualTo(false);
    }

    @Test
    void querySwitches_withTypeFilter_passesFilterToService() {
        SwitchConnection connection = new SwitchConnection(
                List.of(sampleSwitch), 1,
                new PageInfo(false, false, 1, 1)
        );
        when(switchService.getSwitches(eq("LINEAR"), any(), any(), any())).thenReturn(connection);

        graphQlTester.document("""
                    {
                        switches(type: LINEAR) {
                            totalCount
                            nodes { name type }
                        }
                    }
                """)
                .execute()
                .path("switches.totalCount").entity(Integer.class).isEqualTo(1);
    }

    @Test
    void querySwitches_empty_returnsZero() {
        SwitchConnection emptyConnection = new SwitchConnection(
                List.of(), 0,
                new PageInfo(false, false, 1, 0)
        );
        when(switchService.getSwitches(null, null, null, null)).thenReturn(emptyConnection);

        graphQlTester.document("""
                    {
                        switches {
                            totalCount
                            nodes { name }
                        }
                    }
                """)
                .execute()
                .path("switches.totalCount").entity(Integer.class).isEqualTo(0)
                .path("switches.nodes").entityList(Object.class).hasSize(0);
    }

    // ── Query: switch (by ID) ─────────────────────────────────────────────────

    @Test
    void querySwitchById_found_returnsSwitch() {
        when(switchService.getSwitch(switchId)).thenReturn(sampleSwitch);

        graphQlTester.document(String.format("""
                    {
                        switch(id: "%s") {
                            name
                            manufacturer
                            type
                            actuationForceGf
                            soundProfile
                            stemMaterial
                            housingMaterial
                            priceUsd
                        }
                    }
                """, switchId))
                .execute()
                .path("switch.name").entity(String.class).isEqualTo("Cherry MX Red")
                .path("switch.manufacturer").entity(String.class).isEqualTo("Cherry")
                .path("switch.type").entity(String.class).isEqualTo("LINEAR")
                .path("switch.soundProfile").entity(String.class).isEqualTo("quiet");
    }

    @Test
    void querySwitchById_notFound_returnsNull() {
        UUID unknownId = UUID.randomUUID();
        when(switchService.getSwitch(unknownId)).thenReturn(null);

        graphQlTester.document(String.format("""
                    {
                        switch(id: "%s") {
                            name
                        }
                    }
                """, unknownId))
                .execute()
                .path("switch").valueIsNull();
    }

    // ── Query: compareSwitches ────────────────────────────────────────────────

    @Test
    void queryCompareSwitches_returnsMultipleSwitches() {
        Switch switch2 = new Switch();
        switch2.setId(UUID.randomUUID());
        switch2.setName("Gateron Yellow");
        switch2.setManufacturer("Gateron");
        switch2.setType("LINEAR");
        switch2.setTags(List.of());
        switch2.setCreatedAt(OffsetDateTime.now());
        switch2.setUpdatedAt(OffsetDateTime.now());

        when(switchService.compareSwitches(any())).thenReturn(List.of(sampleSwitch, switch2));

        graphQlTester.document(String.format("""
                    {
                        compareSwitches(ids: ["%s", "%s"]) {
                            name
                            manufacturer
                            type
                        }
                    }
                """, switchId, switch2.getId()))
                .execute()
                .path("compareSwitches").entityList(Object.class).hasSize(2)
                .path("compareSwitches[0].name").entity(String.class).isEqualTo("Cherry MX Red")
                .path("compareSwitches[1].name").entity(String.class).isEqualTo("Gateron Yellow");
    }

    // ── Mutation: createSwitch (requires auth) ────────────────────────────────

    @Test
    void createSwitch_withoutAuth_returnsUnauthorized() {
        graphQlTester.document("""
                    mutation {
                        createSwitch(input: {
                            name: "New Switch"
                            manufacturer: "Test Mfg"
                            type: LINEAR
                        }) {
                            name
                        }
                    }
                """)
                .execute()
                .errors()
                .satisfy(errors -> assertThat(errors).isNotEmpty());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void createSwitch_withAuth_succeeds() {
        Switch created = new Switch();
        created.setId(UUID.randomUUID());
        created.setName("New Switch");
        created.setManufacturer("Test Mfg");
        created.setType("LINEAR");
        created.setTags(List.of());
        created.setCreatedAt(OffsetDateTime.now());
        created.setUpdatedAt(OffsetDateTime.now());

        when(switchService.createSwitch(any())).thenReturn(created);

        graphQlTester.document("""
                    mutation {
                        createSwitch(input: {
                            name: "New Switch"
                            manufacturer: "Test Mfg"
                            type: LINEAR
                        }) {
                            name
                            manufacturer
                            type
                        }
                    }
                """)
                .execute()
                .path("createSwitch.name").entity(String.class).isEqualTo("New Switch")
                .path("createSwitch.manufacturer").entity(String.class).isEqualTo("Test Mfg")
                .path("createSwitch.type").entity(String.class).isEqualTo("LINEAR");
    }

    // ── Mutation: updateSwitch (requires auth) ────────────────────────────────

    @Test
    void updateSwitch_withoutAuth_returnsUnauthorized() {
        graphQlTester.document(String.format("""
                    mutation {
                        updateSwitch(id: "%s", input: {
                            name: "Updated"
                        }) {
                            name
                        }
                    }
                """, switchId))
                .execute()
                .errors()
                .satisfy(errors -> assertThat(errors).isNotEmpty());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void updateSwitch_withAuth_succeeds() {
        sampleSwitch.setName("Updated Switch");
        when(switchService.updateSwitch(eq(switchId), any())).thenReturn(sampleSwitch);

        graphQlTester.document(String.format("""
                    mutation {
                        updateSwitch(id: "%s", input: {
                            name: "Updated Switch"
                        }) {
                            name
                        }
                    }
                """, switchId))
                .execute()
                .path("updateSwitch.name").entity(String.class).isEqualTo("Updated Switch");
    }

    // ── Mutation: deleteSwitch (requires auth) ────────────────────────────────

    @Test
    void deleteSwitch_withoutAuth_returnsUnauthorized() {
        graphQlTester.document(String.format("""
                    mutation {
                        deleteSwitch(id: "%s")
                    }
                """, switchId))
                .execute()
                .errors()
                .satisfy(errors -> assertThat(errors).isNotEmpty());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void deleteSwitch_withAuth_succeeds() {
        when(switchService.deleteSwitch(switchId)).thenReturn(true);

        graphQlTester.document(String.format("""
                    mutation {
                        deleteSwitch(id: "%s")
                    }
                """, switchId))
                .execute()
                .path("deleteSwitch").entity(Boolean.class).isEqualTo(true);
    }
}
