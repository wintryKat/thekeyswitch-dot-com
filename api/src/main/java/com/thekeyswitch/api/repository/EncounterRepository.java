package com.thekeyswitch.api.repository;

import com.thekeyswitch.api.model.Encounter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EncounterRepository extends JpaRepository<Encounter, UUID> {

    Page<Encounter> findByPlatform(String platform, Pageable pageable);

    @Query(value = "SELECT * FROM encounters WHERE :tag = ANY(tags)", nativeQuery = true)
    Page<Encounter> findByTagsContaining(@Param("tag") String tag, Pageable pageable);

    @Query(value = "SELECT * FROM encounters WHERE platform = :platform AND :tag = ANY(tags)", nativeQuery = true)
    Page<Encounter> findByPlatformAndTagsContaining(@Param("platform") String platform, @Param("tag") String tag, Pageable pageable);
}
