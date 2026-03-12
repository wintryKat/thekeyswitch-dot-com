package com.thekeyswitch.api.repository;

import com.thekeyswitch.api.model.Switch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SwitchRepository extends JpaRepository<Switch, UUID> {

    Page<Switch> findByType(String type, Pageable pageable);

    Page<Switch> findByManufacturer(String manufacturer, Pageable pageable);

    Page<Switch> findByTypeAndManufacturer(String type, String manufacturer, Pageable pageable);

    @Query(value = "SELECT * FROM switches WHERE :tag = ANY(tags)", nativeQuery = true)
    Page<Switch> findByTagsContaining(@Param("tag") String tag, Pageable pageable);
}
