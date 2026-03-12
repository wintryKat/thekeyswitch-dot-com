package com.thekeyswitch.api.controller;

import com.thekeyswitch.api.config.GraphQlConfig;
import com.thekeyswitch.api.config.MethodSecurityTestConfig;
import com.thekeyswitch.api.dto.EncounterConnection;
import com.thekeyswitch.api.dto.PageInfo;
import com.thekeyswitch.api.model.Encounter;
import com.thekeyswitch.api.service.EncounterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.GraphQlTest;
import org.springframework.context.annotation.Import;
import org.springframework.graphql.test.tester.GraphQlTester;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@GraphQlTest(EncounterController.class)
@Import({GraphQlConfig.class, MethodSecurityTestConfig.class})
class EncounterControllerIntegrationTest {

    @Autowired
    private GraphQlTester graphQlTester;

    @MockitoBean
    private EncounterService encounterService;

    private Encounter sampleEncounter;
    private UUID encounterId;

    @BeforeEach
    void setUp() {
        encounterId = UUID.randomUUID();
        sampleEncounter = new Encounter();
        sampleEncounter.setId(encounterId);
        sampleEncounter.setFilename("session-001.md");
        sampleEncounter.setPlatform("claude");
        sampleEncounter.setTitle("Test Encounter");
        sampleEncounter.setAbstractText("An abstract summary");
        sampleEncounter.setContent("Full content here");
        sampleEncounter.setTags(List.of("ai", "test"));
        sampleEncounter.setSessionDate(OffsetDateTime.now());
        sampleEncounter.setCreatedAt(OffsetDateTime.now());
    }

    // ── Query: encounters ─────────────────────────────────────────────────────

    @Test
    void queryEncounters_returnsPaginatedResults() {
        EncounterConnection connection = new EncounterConnection(
                List.of(sampleEncounter), 1,
                new PageInfo(false, false, 1, 1)
        );
        when(encounterService.getEncounters(null, null, null, null)).thenReturn(connection);

        graphQlTester.document("""
                    {
                        encounters {
                            totalCount
                            nodes { title platform filename }
                            pageInfo { hasNextPage currentPage }
                        }
                    }
                """)
                .execute()
                .path("encounters.totalCount").entity(Integer.class).isEqualTo(1)
                .path("encounters.nodes[0].title").entity(String.class).isEqualTo("Test Encounter")
                .path("encounters.nodes[0].platform").entity(String.class).isEqualTo("claude")
                .path("encounters.nodes[0].filename").entity(String.class).isEqualTo("session-001.md");
    }

    @Test
    void queryEncounters_empty_returnsZero() {
        EncounterConnection emptyConnection = new EncounterConnection(
                List.of(), 0,
                new PageInfo(false, false, 1, 0)
        );
        when(encounterService.getEncounters(null, null, null, null)).thenReturn(emptyConnection);

        graphQlTester.document("""
                    {
                        encounters {
                            totalCount
                            nodes { title }
                        }
                    }
                """)
                .execute()
                .path("encounters.totalCount").entity(Integer.class).isEqualTo(0)
                .path("encounters.nodes").entityList(Object.class).hasSize(0);
    }

    @Test
    void queryEncounters_withPlatformFilter_passesFilterToService() {
        EncounterConnection connection = new EncounterConnection(
                List.of(sampleEncounter), 1,
                new PageInfo(false, false, 1, 1)
        );
        when(encounterService.getEncounters(null, "claude", null, null)).thenReturn(connection);

        graphQlTester.document("""
                    {
                        encounters(platform: "claude") {
                            totalCount
                            nodes { title platform }
                        }
                    }
                """)
                .execute()
                .path("encounters.totalCount").entity(Integer.class).isEqualTo(1)
                .path("encounters.nodes[0].platform").entity(String.class).isEqualTo("claude");
    }

    // ── Query: encounter (by ID) ──────────────────────────────────────────────

    @Test
    void queryEncounterById_found_returnsEncounter() {
        when(encounterService.getEncounter(encounterId)).thenReturn(sampleEncounter);

        graphQlTester.document(String.format("""
                    {
                        encounter(id: "%s") {
                            title
                            platform
                            filename
                            content
                        }
                    }
                """, encounterId))
                .execute()
                .path("encounter.title").entity(String.class).isEqualTo("Test Encounter")
                .path("encounter.platform").entity(String.class).isEqualTo("claude")
                .path("encounter.content").entity(String.class).isEqualTo("Full content here");
    }

    @Test
    void queryEncounterById_notFound_returnsNull() {
        UUID unknownId = UUID.randomUUID();
        when(encounterService.getEncounter(unknownId)).thenReturn(null);

        graphQlTester.document(String.format("""
                    {
                        encounter(id: "%s") {
                            title
                        }
                    }
                """, unknownId))
                .execute()
                .path("encounter").valueIsNull();
    }

    // ── Mutation: importEncounter (requires auth) ─────────────────────────────

    @Test
    void importEncounter_withoutAuth_returnsUnauthorized() {
        graphQlTester.document("""
                    mutation {
                        importEncounter(input: {
                            filename: "test.md"
                            platform: "claude"
                            title: "Test"
                            content: "Content"
                        }) {
                            title
                        }
                    }
                """)
                .execute()
                .errors()
                .satisfy(errors -> assertThat(errors).isNotEmpty());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void importEncounter_withAuth_succeeds() {
        Encounter imported = new Encounter();
        imported.setId(UUID.randomUUID());
        imported.setFilename("imported.md");
        imported.setPlatform("chatgpt");
        imported.setTitle("Imported Session");
        imported.setContent("Imported content");
        imported.setTags(List.of());
        imported.setCreatedAt(OffsetDateTime.now());

        when(encounterService.importEncounter(any())).thenReturn(imported);

        graphQlTester.document("""
                    mutation {
                        importEncounter(input: {
                            filename: "imported.md"
                            platform: "chatgpt"
                            title: "Imported Session"
                            content: "Imported content"
                        }) {
                            title
                            platform
                            filename
                        }
                    }
                """)
                .execute()
                .path("importEncounter.title").entity(String.class).isEqualTo("Imported Session")
                .path("importEncounter.platform").entity(String.class).isEqualTo("chatgpt")
                .path("importEncounter.filename").entity(String.class).isEqualTo("imported.md");
    }
}
