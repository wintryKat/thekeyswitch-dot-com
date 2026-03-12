package com.thekeyswitch.api.repository;

import com.thekeyswitch.api.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    Optional<Post> findBySlug(String slug);

    Page<Post> findByStatus(String status, Pageable pageable);

    @Query(value = "SELECT * FROM posts WHERE :tag = ANY(tags)", nativeQuery = true)
    Page<Post> findByTagsContaining(@Param("tag") String tag, Pageable pageable);

    @Query(value = "SELECT * FROM posts WHERE status = :status AND :tag = ANY(tags)", nativeQuery = true)
    Page<Post> findByStatusAndTagsContaining(@Param("status") String status, @Param("tag") String tag, Pageable pageable);

    List<Post> findByAuthorType(String authorType);
}
