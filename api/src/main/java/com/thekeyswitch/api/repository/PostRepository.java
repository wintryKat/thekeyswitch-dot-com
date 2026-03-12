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

    @Query("SELECT p FROM Post p WHERE :tag = ANY(p.tags)")
    Page<Post> findByTagsContaining(@Param("tag") String tag, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.status = :status AND :tag = ANY(p.tags)")
    Page<Post> findByStatusAndTagsContaining(@Param("status") String status, @Param("tag") String tag, Pageable pageable);

    List<Post> findByAuthorType(String authorType);
}
