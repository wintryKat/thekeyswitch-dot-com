package com.thekeyswitch.api.service;

import com.thekeyswitch.api.dto.CreatePostInput;
import com.thekeyswitch.api.dto.PageInfo;
import com.thekeyswitch.api.dto.PostConnection;
import com.thekeyswitch.api.dto.UpdatePostInput;
import com.thekeyswitch.api.model.Post;
import com.thekeyswitch.api.repository.PostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Transactional(readOnly = true)
    public PostConnection getPosts(String status, String tag, Integer page, Integer pageSize) {
        int pageNum = (page != null && page > 0) ? page - 1 : 0;
        int size = (pageSize != null && pageSize > 0) ? Math.min(pageSize, 100) : 20;
        Pageable pageable = PageRequest.of(pageNum, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Post> result;
        if (status != null && tag != null) {
            result = postRepository.findByStatusAndTagsContaining(status, tag, pageable);
        } else if (status != null) {
            result = postRepository.findByStatus(status, pageable);
        } else if (tag != null) {
            result = postRepository.findByTagsContaining(tag, pageable);
        } else {
            result = postRepository.findAll(pageable);
        }

        PageInfo pageInfo = new PageInfo(
                result.hasNext(),
                result.hasPrevious(),
                pageNum + 1,
                result.getTotalPages()
        );

        return new PostConnection(result.getContent(), result.getTotalElements(), pageInfo);
    }

    @Transactional(readOnly = true)
    public Post getPostBySlug(String slug) {
        return postRepository.findBySlug(slug).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<Post> getPostsByAuthorType(String authorType) {
        return postRepository.findByAuthorType(authorType);
    }

    @Transactional
    public Post createPost(CreatePostInput input) {
        Post post = new Post();
        post.setSlug(input.slug());
        post.setTitle(input.title());
        post.setContent(input.content());
        post.setExcerpt(input.excerpt());
        post.setAuthorType(input.authorType() != null ? input.authorType() : "human");
        post.setAuthorName(input.authorName());
        post.setAuthorMeta(input.authorMeta());
        post.setStatus(input.status() != null ? input.status() : "draft");
        post.setTags(input.tags() != null ? input.tags() : List.of());
        post.setReadingTimeMinutes(input.readingTimeMinutes());
        post.setPublishedAt(input.publishedAt());
        return postRepository.save(post);
    }

    @Transactional
    public Post updatePost(UUID id, UpdatePostInput input) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + id));

        if (input.slug() != null) post.setSlug(input.slug());
        if (input.title() != null) post.setTitle(input.title());
        if (input.content() != null) post.setContent(input.content());
        if (input.excerpt() != null) post.setExcerpt(input.excerpt());
        if (input.authorType() != null) post.setAuthorType(input.authorType());
        if (input.authorName() != null) post.setAuthorName(input.authorName());
        if (input.authorMeta() != null) post.setAuthorMeta(input.authorMeta());
        if (input.status() != null) post.setStatus(input.status());
        if (input.tags() != null) post.setTags(input.tags());
        if (input.readingTimeMinutes() != null) post.setReadingTimeMinutes(input.readingTimeMinutes());
        if (input.publishedAt() != null) post.setPublishedAt(input.publishedAt());

        return postRepository.save(post);
    }

    @Transactional
    public boolean deletePost(UUID id) {
        if (postRepository.existsById(id)) {
            postRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
