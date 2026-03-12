package com.thekeyswitch.api.service;

import com.thekeyswitch.api.dto.EncounterConnection;
import com.thekeyswitch.api.dto.ImportEncounterInput;
import com.thekeyswitch.api.model.Encounter;
import com.thekeyswitch.api.repository.EncounterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EncounterServiceTest {

    @Mock
    private EncounterRepository encounterRepository;

    @InjectMocks
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
        sampleEncounter.setAbstractText("An abstract");
        sampleEncounter.setContent("Full content here");
        sampleEncounter.setTags(List.of("ai", "test"));
        sampleEncounter.setCreatedAt(OffsetDateTime.now());
    }

    // ── getEncounters ─────────────────────────────────────────────────────────

    @Test
    void getEncounters_noFilters_returnsAll() {
        Page<Encounter> page = new PageImpl<>(List.of(sampleEncounter));
        when(encounterRepository.findAll(any(Pageable.class))).thenReturn(page);

        EncounterConnection result = encounterService.getEncounters(null, null, null, null);

        assertThat(result.totalCount()).isEqualTo(1);
        assertThat(result.nodes()).hasSize(1);
        assertThat(result.nodes().get(0).getTitle()).isEqualTo("Test Encounter");
        verify(encounterRepository).findAll(any(Pageable.class));
    }

    @Test
    void getEncounters_withPlatformFilter_filtersCorrectly() {
        Page<Encounter> page = new PageImpl<>(List.of(sampleEncounter));
        when(encounterRepository.findByPlatform(eq("claude"), any(Pageable.class))).thenReturn(page);

        EncounterConnection result = encounterService.getEncounters(null, "claude", null, null);

        assertThat(result.totalCount()).isEqualTo(1);
        verify(encounterRepository).findByPlatform(eq("claude"), any(Pageable.class));
    }

    @Test
    void getEncounters_withTagFilter_filtersCorrectly() {
        Page<Encounter> page = new PageImpl<>(List.of(sampleEncounter));
        when(encounterRepository.findByTagsContaining(eq("ai"), any(Pageable.class))).thenReturn(page);

        EncounterConnection result = encounterService.getEncounters("ai", null, null, null);

        assertThat(result.totalCount()).isEqualTo(1);
        verify(encounterRepository).findByTagsContaining(eq("ai"), any(Pageable.class));
    }

    @Test
    void getEncounters_withPlatformAndTagFilter_filtersCorrectly() {
        Page<Encounter> page = new PageImpl<>(List.of(sampleEncounter));
        when(encounterRepository.findByPlatformAndTagsContaining(eq("claude"), eq("ai"), any(Pageable.class)))
                .thenReturn(page);

        EncounterConnection result = encounterService.getEncounters("ai", "claude", null, null);

        assertThat(result.totalCount()).isEqualTo(1);
        verify(encounterRepository).findByPlatformAndTagsContaining(eq("claude"), eq("ai"), any(Pageable.class));
    }

    @Test
    void getEncounters_emptyResults_returnsEmptyConnection() {
        Page<Encounter> emptyPage = new PageImpl<>(List.of());
        when(encounterRepository.findAll(any(Pageable.class))).thenReturn(emptyPage);

        EncounterConnection result = encounterService.getEncounters(null, null, null, null);

        assertThat(result.totalCount()).isZero();
        assertThat(result.nodes()).isEmpty();
        assertThat(result.pageInfo().hasNextPage()).isFalse();
        assertThat(result.pageInfo().hasPreviousPage()).isFalse();
    }

    @Test
    void getEncounters_withPagination_usesCorrectValues() {
        Page<Encounter> page = new PageImpl<>(List.of());
        when(encounterRepository.findAll(any(Pageable.class))).thenReturn(page);

        encounterService.getEncounters(null, null, 2, 10);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(encounterRepository).findAll(captor.capture());
        assertThat(captor.getValue().getPageNumber()).isEqualTo(1); // page 2 -> index 1
        assertThat(captor.getValue().getPageSize()).isEqualTo(10);
    }

    @Test
    void getEncounters_excessivePageSize_capsAt100() {
        Page<Encounter> page = new PageImpl<>(List.of());
        when(encounterRepository.findAll(any(Pageable.class))).thenReturn(page);

        encounterService.getEncounters(null, null, 1, 200);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(encounterRepository).findAll(captor.capture());
        assertThat(captor.getValue().getPageSize()).isEqualTo(100);
    }

    // ── getEncounter ──────────────────────────────────────────────────────────

    @Test
    void getEncounter_found_returnsEncounter() {
        when(encounterRepository.findById(encounterId)).thenReturn(Optional.of(sampleEncounter));

        Encounter result = encounterService.getEncounter(encounterId);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Encounter");
        assertThat(result.getPlatform()).isEqualTo("claude");
    }

    @Test
    void getEncounter_notFound_returnsNull() {
        UUID unknownId = UUID.randomUUID();
        when(encounterRepository.findById(unknownId)).thenReturn(Optional.empty());

        Encounter result = encounterService.getEncounter(unknownId);

        assertThat(result).isNull();
    }

    // ── importEncounter ───────────────────────────────────────────────────────

    @Test
    void importEncounter_withValidInput_savesAndReturns() {
        OffsetDateTime sessionDate = OffsetDateTime.now();
        ImportEncounterInput input = new ImportEncounterInput(
                "session-002.md", "chatgpt", "New Session",
                "Abstract text", List.of("coding", "debug"),
                "# Content\nFull session here",
                Map.of("model", "gpt-4"), sessionDate
        );
        when(encounterRepository.save(any(Encounter.class))).thenAnswer(invocation -> {
            Encounter saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        Encounter result = encounterService.importEncounter(input);

        assertThat(result.getFilename()).isEqualTo("session-002.md");
        assertThat(result.getPlatform()).isEqualTo("chatgpt");
        assertThat(result.getTitle()).isEqualTo("New Session");
        assertThat(result.getAbstractText()).isEqualTo("Abstract text");
        assertThat(result.getTags()).containsExactly("coding", "debug");
        assertThat(result.getContent()).contains("Full session here");
        assertThat(result.getSessionDate()).isEqualTo(sessionDate);
        verify(encounterRepository).save(any(Encounter.class));
    }

    @Test
    void importEncounter_withNullTags_defaultsToEmptyList() {
        ImportEncounterInput input = new ImportEncounterInput(
                "file.md", "platform", "Title",
                null, null, "Content",
                null, null
        );
        when(encounterRepository.save(any(Encounter.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Encounter result = encounterService.importEncounter(input);

        assertThat(result.getTags()).isEmpty();
    }

    @Test
    void importEncounter_withNullOptionalFields_setsNulls() {
        ImportEncounterInput input = new ImportEncounterInput(
                "file.md", "platform", "Title",
                null, List.of(), "Content",
                null, null
        );
        when(encounterRepository.save(any(Encounter.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Encounter result = encounterService.importEncounter(input);

        assertThat(result.getAbstractText()).isNull();
        assertThat(result.getFrontMatter()).isNull();
        assertThat(result.getSessionDate()).isNull();
    }
}
