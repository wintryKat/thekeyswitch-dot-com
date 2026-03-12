package com.thekeyswitch.api.service;

import com.thekeyswitch.api.dto.CreateSwitchInput;
import com.thekeyswitch.api.dto.SwitchConnection;
import com.thekeyswitch.api.dto.UpdateSwitchInput;
import com.thekeyswitch.api.model.Switch;
import com.thekeyswitch.api.repository.SwitchRepository;
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

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SwitchServiceTest {

    @Mock
    private SwitchRepository switchRepository;

    @InjectMocks
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
        sampleSwitch.setType("linear");
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

    // ── getSwitches ───────────────────────────────────────────────────────────

    @Test
    void getSwitches_noFilters_returnsAll() {
        Page<Switch> page = new PageImpl<>(List.of(sampleSwitch));
        when(switchRepository.findAll(any(Pageable.class))).thenReturn(page);

        SwitchConnection result = switchService.getSwitches(null, null, null, null);

        assertThat(result.totalCount()).isEqualTo(1);
        assertThat(result.nodes()).hasSize(1);
        assertThat(result.nodes().get(0).getName()).isEqualTo("Cherry MX Red");
        verify(switchRepository).findAll(any(Pageable.class));
    }

    @Test
    void getSwitches_withTypeFilter_filtersCorrectly() {
        Page<Switch> page = new PageImpl<>(List.of(sampleSwitch));
        when(switchRepository.findByType(eq("linear"), any(Pageable.class))).thenReturn(page);

        SwitchConnection result = switchService.getSwitches("linear", null, null, null);

        assertThat(result.totalCount()).isEqualTo(1);
        verify(switchRepository).findByType(eq("linear"), any(Pageable.class));
    }

    @Test
    void getSwitches_withManufacturerFilter_filtersCorrectly() {
        Page<Switch> page = new PageImpl<>(List.of(sampleSwitch));
        when(switchRepository.findByManufacturer(eq("Cherry"), any(Pageable.class))).thenReturn(page);

        SwitchConnection result = switchService.getSwitches(null, "Cherry", null, null);

        assertThat(result.totalCount()).isEqualTo(1);
        verify(switchRepository).findByManufacturer(eq("Cherry"), any(Pageable.class));
    }

    @Test
    void getSwitches_withTypeAndManufacturerFilter_filtersCorrectly() {
        Page<Switch> page = new PageImpl<>(List.of(sampleSwitch));
        when(switchRepository.findByTypeAndManufacturer(eq("linear"), eq("Cherry"), any(Pageable.class)))
                .thenReturn(page);

        SwitchConnection result = switchService.getSwitches("linear", "Cherry", null, null);

        assertThat(result.totalCount()).isEqualTo(1);
        verify(switchRepository).findByTypeAndManufacturer(eq("linear"), eq("Cherry"), any(Pageable.class));
    }

    @Test
    void getSwitches_emptyResults_returnsEmptyConnection() {
        Page<Switch> emptyPage = new PageImpl<>(List.of());
        when(switchRepository.findAll(any(Pageable.class))).thenReturn(emptyPage);

        SwitchConnection result = switchService.getSwitches(null, null, null, null);

        assertThat(result.totalCount()).isZero();
        assertThat(result.nodes()).isEmpty();
    }

    @Test
    void getSwitches_withPagination_usesCorrectPageAndSize() {
        Page<Switch> page = new PageImpl<>(List.of(sampleSwitch));
        when(switchRepository.findAll(any(Pageable.class))).thenReturn(page);

        switchService.getSwitches(null, null, 3, 15);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(switchRepository).findAll(captor.capture());
        assertThat(captor.getValue().getPageNumber()).isEqualTo(2); // page 3 -> index 2
        assertThat(captor.getValue().getPageSize()).isEqualTo(15);
    }

    @Test
    void getSwitches_excessivePageSize_capsAt100() {
        Page<Switch> page = new PageImpl<>(List.of());
        when(switchRepository.findAll(any(Pageable.class))).thenReturn(page);

        switchService.getSwitches(null, null, 1, 999);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(switchRepository).findAll(captor.capture());
        assertThat(captor.getValue().getPageSize()).isEqualTo(100);
    }

    // ── getSwitch ─────────────────────────────────────────────────────────────

    @Test
    void getSwitch_found_returnsSwitch() {
        when(switchRepository.findById(switchId)).thenReturn(Optional.of(sampleSwitch));

        Switch result = switchService.getSwitch(switchId);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Cherry MX Red");
    }

    @Test
    void getSwitch_notFound_returnsNull() {
        UUID unknownId = UUID.randomUUID();
        when(switchRepository.findById(unknownId)).thenReturn(Optional.empty());

        Switch result = switchService.getSwitch(unknownId);

        assertThat(result).isNull();
    }

    // ── compareSwitches ───────────────────────────────────────────────────────

    @Test
    void compareSwitches_withValidIds_returnsList() {
        Switch switch2 = new Switch();
        switch2.setId(UUID.randomUUID());
        switch2.setName("Gateron Yellow");
        switch2.setManufacturer("Gateron");
        switch2.setType("linear");

        List<UUID> ids = List.of(switchId, switch2.getId());
        when(switchRepository.findAllById(ids)).thenReturn(List.of(sampleSwitch, switch2));

        List<Switch> result = switchService.compareSwitches(ids);

        assertThat(result).hasSize(2);
        verify(switchRepository).findAllById(ids);
    }

    @Test
    void compareSwitches_withEmptyIds_returnsEmpty() {
        when(switchRepository.findAllById(List.of())).thenReturn(List.of());

        List<Switch> result = switchService.compareSwitches(List.of());

        assertThat(result).isEmpty();
    }

    // ── createSwitch ──────────────────────────────────────────────────────────

    @Test
    void createSwitch_withValidInput_savesAndReturns() {
        CreateSwitchInput input = new CreateSwitchInput(
                "Holy Panda", "Drop", "tactile",
                new BigDecimal("67.0"), new BigDecimal("80.0"),
                new BigDecimal("2.00"), new BigDecimal("4.00"),
                null, "thocky", null,
                "long spring", "POM", "Nylon/PC",
                new BigDecimal("1.10"), null, null,
                List.of("tactile", "premium")
        );
        when(switchRepository.save(any(Switch.class))).thenAnswer(invocation -> {
            Switch saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        Switch result = switchService.createSwitch(input);

        assertThat(result.getName()).isEqualTo("Holy Panda");
        assertThat(result.getManufacturer()).isEqualTo("Drop");
        assertThat(result.getType()).isEqualTo("tactile");
        assertThat(result.getActuationForceGf()).isEqualByComparingTo(new BigDecimal("67.0"));
        assertThat(result.getSoundProfile()).isEqualTo("thocky");
        assertThat(result.getTags()).containsExactly("tactile", "premium");
        verify(switchRepository).save(any(Switch.class));
    }

    @Test
    void createSwitch_withNullTags_defaultsToEmptyList() {
        CreateSwitchInput input = new CreateSwitchInput(
                "Test", "Mfg", "linear",
                null, null, null, null, null, null, null,
                null, null, null, null, null, null, null
        );
        when(switchRepository.save(any(Switch.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Switch result = switchService.createSwitch(input);

        assertThat(result.getTags()).isEmpty();
    }

    // ── updateSwitch ──────────────────────────────────────────────────────────

    @Test
    void updateSwitch_withPartialFields_updatesOnlyProvided() {
        when(switchRepository.findById(switchId)).thenReturn(Optional.of(sampleSwitch));
        when(switchRepository.save(any(Switch.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateSwitchInput input = new UpdateSwitchInput(
                "Cherry MX Red v2", null, null,
                null, null, null, null, null, null, null,
                null, null, null, null, null, null, null
        );

        Switch result = switchService.updateSwitch(switchId, input);

        assertThat(result.getName()).isEqualTo("Cherry MX Red v2");
        assertThat(result.getManufacturer()).isEqualTo("Cherry"); // unchanged
        assertThat(result.getType()).isEqualTo("linear"); // unchanged
    }

    @Test
    void updateSwitch_withAllFields_updatesEverything() {
        when(switchRepository.findById(switchId)).thenReturn(Optional.of(sampleSwitch));
        when(switchRepository.save(any(Switch.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateSwitchInput input = new UpdateSwitchInput(
                "New Name", "New Mfg", "tactile",
                new BigDecimal("55.0"), new BigDecimal("70.0"),
                new BigDecimal("1.80"), new BigDecimal("3.50"),
                null, "clacky", "https://sound.url",
                "progressive", "UHMWPE", "Polycarbonate",
                new BigDecimal("0.50"), "https://img.url", "https://source.url",
                List.of("updated")
        );

        Switch result = switchService.updateSwitch(switchId, input);

        assertThat(result.getName()).isEqualTo("New Name");
        assertThat(result.getManufacturer()).isEqualTo("New Mfg");
        assertThat(result.getType()).isEqualTo("tactile");
        assertThat(result.getSoundProfile()).isEqualTo("clacky");
        assertThat(result.getTags()).containsExactly("updated");
    }

    @Test
    void updateSwitch_notFound_throwsException() {
        when(switchRepository.findById(switchId)).thenReturn(Optional.empty());

        UpdateSwitchInput input = new UpdateSwitchInput(
                "Name", null, null,
                null, null, null, null, null, null, null,
                null, null, null, null, null, null, null
        );

        assertThatThrownBy(() -> switchService.updateSwitch(switchId, input))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Switch not found");
    }

    // ── deleteSwitch ──────────────────────────────────────────────────────────

    @Test
    void deleteSwitch_existing_returnsTrue() {
        when(switchRepository.existsById(switchId)).thenReturn(true);

        boolean result = switchService.deleteSwitch(switchId);

        assertThat(result).isTrue();
        verify(switchRepository).deleteById(switchId);
    }

    @Test
    void deleteSwitch_nonExisting_returnsFalse() {
        when(switchRepository.existsById(switchId)).thenReturn(false);

        boolean result = switchService.deleteSwitch(switchId);

        assertThat(result).isFalse();
        verify(switchRepository, never()).deleteById(any());
    }
}
