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

    @Query("SELECT s FROM Switch s WHERE s.type = :type AND s.manufacturer = :manufacturer")
    Page<Switch> findByTypeAndManufacturer(@Param("type") String type, @Param("manufacturer") String manufacturer, Pageable pageable);

    @Query("SELECT s FROM Switch s WHERE :tag = ANY(s.tags)")
    Page<Switch> findByTagsContaining(@Param("tag") String tag, Pageable pageable);
}
