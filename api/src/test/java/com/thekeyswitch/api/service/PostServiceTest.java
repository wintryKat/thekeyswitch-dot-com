package com.thekeyswitch.api.service;

import com.thekeyswitch.api.dto.CreatePostInput;
import com.thekeyswitch.api.dto.PostConnection;
import com.thekeyswitch.api.dto.UpdatePostInput;
import com.thekeyswitch.api.model.Post;
import com.thekeyswitch.api.repository.PostRepository;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private PostService postService;

    private Post samplePost;
    private UUID postId;

    @BeforeEach
    void setUp() {
        postId = UUID.randomUUID();
        samplePost = new Post();
        samplePost.setId(postId);
        samplePost.setSlug("test-post");
        samplePost.setTitle("Test Post");
        samplePost.setContent("Test content");
        samplePost.setExcerpt("Test excerpt");
        samplePost.setAuthorType("human");
        samplePost.setAuthorName("Test Author");
        samplePost.setStatus("published");
        samplePost.setTags(List.of("java", "testing"));
        samplePost.setReadingTimeMinutes(5);
        samplePost.setCreatedAt(OffsetDateTime.now());
        samplePost.setUpdatedAt(OffsetDateTime.now());
    }

    // ── getPosts ──────────────────────────────────────────────────────────────

    @Test
    void getPosts_noFilters_returnsAll() {
        Page<Post> page = new PageImpl<>(List.of(samplePost));
        when(postRepository.findAll(any(Pageable.class))).thenReturn(page);

        PostConnection result = postService.getPosts(null, null, null, null);

        assertThat(result.totalCount()).isEqualTo(1);
        assertThat(result.nodes()).hasSize(1);
        assertThat(result.nodes().get(0).getTitle()).isEqualTo("Test Post");
        assertThat(result.pageInfo().currentPage()).isEqualTo(1);
        verify(postRepository).findAll(any(Pageable.class));
    }

    @Test
    void getPosts_withStatusFilter_filtersCorrectly() {
        Page<Post> page = new PageImpl<>(List.of(samplePost));
        when(postRepository.findByStatus(eq("published"), any(Pageable.class))).thenReturn(page);

        PostConnection result = postService.getPosts("published", null, null, null);

        assertThat(result.totalCount()).isEqualTo(1);
        verify(postRepository).findByStatus(eq("published"), any(Pageable.class));
    }

    @Test
    void getPosts_withTagFilter_filtersCorrectly() {
        Page<Post> page = new PageImpl<>(List.of(samplePost));
        when(postRepository.findByTagsContaining(eq("java"), any(Pageable.class))).thenReturn(page);

        PostConnection result = postService.getPosts(null, "java", null, null);

        assertThat(result.totalCount()).isEqualTo(1);
        verify(postRepository).findByTagsContaining(eq("java"), any(Pageable.class));
    }

    @Test
    void getPosts_withStatusAndTagFilter_filtersCorrectly() {
        Page<Post> page = new PageImpl<>(List.of(samplePost));
        when(postRepository.findByStatusAndTagsContaining(eq("published"), eq("java"), any(Pageable.class)))
                .thenReturn(page);

        PostConnection result = postService.getPosts("published", "java", null, null);

        assertThat(result.totalCount()).isEqualTo(1);
        verify(postRepository).findByStatusAndTagsContaining(eq("published"), eq("java"), any(Pageable.class));
    }

    @Test
    void getPosts_withEmptyResults_returnsEmptyConnection() {
        Page<Post> emptyPage = new PageImpl<>(List.of());
        when(postRepository.findAll(any(Pageable.class))).thenReturn(emptyPage);

        PostConnection result = postService.getPosts(null, null, null, null);

        assertThat(result.totalCount()).isZero();
        assertThat(result.nodes()).isEmpty();
        assertThat(result.pageInfo().hasNextPage()).isFalse();
        assertThat(result.pageInfo().hasPreviousPage()).isFalse();
    }

    @Test
    void getPosts_withPagination_usesCorrectPageAndSize() {
        Page<Post> page = new PageImpl<>(List.of(samplePost));
        when(postRepository.findAll(any(Pageable.class))).thenReturn(page);

        postService.getPosts(null, null, 2, 10);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(postRepository).findAll(pageableCaptor.capture());
        Pageable captured = pageableCaptor.getValue();
        assertThat(captured.getPageNumber()).isEqualTo(1); // page 2 -> index 1
        assertThat(captured.getPageSize()).isEqualTo(10);
    }

    @Test
    void getPosts_withExcessivePageSize_capsAt100() {
        Page<Post> page = new PageImpl<>(List.of());
        when(postRepository.findAll(any(Pageable.class))).thenReturn(page);

        postService.getPosts(null, null, 1, 500);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(postRepository).findAll(pageableCaptor.capture());
        assertThat(pageableCaptor.getValue().getPageSize()).isEqualTo(100);
    }

    @Test
    void getPosts_withNegativePage_defaultsToZero() {
        Page<Post> page = new PageImpl<>(List.of());
        when(postRepository.findAll(any(Pageable.class))).thenReturn(page);

        postService.getPosts(null, null, -1, null);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(postRepository).findAll(pageableCaptor.capture());
        assertThat(pageableCaptor.getValue().getPageNumber()).isZero();
    }

    // ── getPostBySlug ─────────────────────────────────────────────────────────

    @Test
    void getPostBySlug_found_returnsPost() {
        when(postRepository.findBySlug("test-post")).thenReturn(Optional.of(samplePost));

        Post result = postService.getPostBySlug("test-post");

        assertThat(result).isNotNull();
        assertThat(result.getSlug()).isEqualTo("test-post");
        assertThat(result.getTitle()).isEqualTo("Test Post");
    }

    @Test
    void getPostBySlug_notFound_returnsNull() {
        when(postRepository.findBySlug("nonexistent")).thenReturn(Optional.empty());

        Post result = postService.getPostBySlug("nonexistent");

        assertThat(result).isNull();
    }

    // ── getPostsByAuthorType ──────────────────────────────────────────────────

    @Test
    void getPostsByAuthorType_returnsMatchingPosts() {
        when(postRepository.findByAuthorType("human")).thenReturn(List.of(samplePost));

        List<Post> result = postService.getPostsByAuthorType("human");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAuthorType()).isEqualTo("human");
    }

    // ── createPost ────────────────────────────────────────────────────────────

    @Test
    void createPost_withValidInput_savesAndReturns() {
        CreatePostInput input = new CreatePostInput(
                "new-post", "New Post", "Content here", "Excerpt",
                "human", "Author", Map.of("bio", "tester"),
                "published", List.of("test"), 3, null
        );
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> {
            Post saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        Post result = postService.createPost(input);

        assertThat(result.getSlug()).isEqualTo("new-post");
        assertThat(result.getTitle()).isEqualTo("New Post");
        assertThat(result.getContent()).isEqualTo("Content here");
        assertThat(result.getAuthorType()).isEqualTo("human");
        assertThat(result.getStatus()).isEqualTo("published");
        assertThat(result.getTags()).containsExactly("test");
        verify(postRepository).save(any(Post.class));
    }

    @Test
    void createPost_withNullDefaults_appliesDefaults() {
        CreatePostInput input = new CreatePostInput(
                "slug", "Title", "Content", null,
                null, "Author", null,
                null, null, null, null
        );
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Post result = postService.createPost(input);

        assertThat(result.getAuthorType()).isEqualTo("human");
        assertThat(result.getStatus()).isEqualTo("draft");
        assertThat(result.getTags()).isEmpty();
    }

    // ── updatePost ────────────────────────────────────────────────────────────

    @Test
    void updatePost_withPartialFields_updatesOnlyProvidedFields() {
        when(postRepository.findById(postId)).thenReturn(Optional.of(samplePost));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdatePostInput input = new UpdatePostInput(
                null, "Updated Title", null, null,
                null, null, null,
                null, null, null, null
        );

        Post result = postService.updatePost(postId, input);

        assertThat(result.getTitle()).isEqualTo("Updated Title");
        assertThat(result.getSlug()).isEqualTo("test-post"); // unchanged
        assertThat(result.getContent()).isEqualTo("Test content"); // unchanged
    }

    @Test
    void updatePost_withAllFields_updatesEverything() {
        when(postRepository.findById(postId)).thenReturn(Optional.of(samplePost));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OffsetDateTime now = OffsetDateTime.now();
        UpdatePostInput input = new UpdatePostInput(
                "new-slug", "New Title", "New Content", "New Excerpt",
                "ai_agent", "AI Author", Map.of("model", "gpt"),
                "draft", List.of("ai", "new"), 10, now
        );

        Post result = postService.updatePost(postId, input);

        assertThat(result.getSlug()).isEqualTo("new-slug");
        assertThat(result.getTitle()).isEqualTo("New Title");
        assertThat(result.getContent()).isEqualTo("New Content");
        assertThat(result.getExcerpt()).isEqualTo("New Excerpt");
        assertThat(result.getAuthorType()).isEqualTo("ai_agent");
        assertThat(result.getStatus()).isEqualTo("draft");
        assertThat(result.getTags()).containsExactly("ai", "new");
        assertThat(result.getReadingTimeMinutes()).isEqualTo(10);
    }

    @Test
    void updatePost_notFound_throwsException() {
        when(postRepository.findById(postId)).thenReturn(Optional.empty());

        UpdatePostInput input = new UpdatePostInput(
                null, "Title", null, null,
                null, null, null,
                null, null, null, null
        );

        assertThatThrownBy(() -> postService.updatePost(postId, input))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Post not found");
    }

    // ── deletePost ────────────────────────────────────────────────────────────

    @Test
    void deletePost_existing_returnsTrue() {
        when(postRepository.existsById(postId)).thenReturn(true);

        boolean result = postService.deletePost(postId);

        assertThat(result).isTrue();
        verify(postRepository).deleteById(postId);
    }

    @Test
    void deletePost_nonExisting_returnsFalse() {
        when(postRepository.existsById(postId)).thenReturn(false);

        boolean result = postService.deletePost(postId);

        assertThat(result).isFalse();
        verify(postRepository, never()).deleteById(any());
    }
}
