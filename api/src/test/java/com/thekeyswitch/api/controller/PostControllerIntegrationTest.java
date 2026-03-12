package com.thekeyswitch.api.controller;

import com.thekeyswitch.api.dto.PageInfo;
import com.thekeyswitch.api.dto.PostConnection;
import com.thekeyswitch.api.model.Post;
import com.thekeyswitch.api.service.PostService;
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
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@GraphQlTest(PostController.class)
class PostControllerIntegrationTest {

    @Autowired
    private GraphQlTester graphQlTester;

    @MockitoBean
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
        samplePost.setContent("Test content body");
        samplePost.setExcerpt("Test excerpt");
        samplePost.setAuthorType("human");
        samplePost.setAuthorName("Test Author");
        samplePost.setStatus("published");
        samplePost.setTags(List.of("java", "testing"));
        samplePost.setReadingTimeMinutes(5);
        samplePost.setCreatedAt(OffsetDateTime.now());
        samplePost.setUpdatedAt(OffsetDateTime.now());
    }

    // ── Query: posts ──────────────────────────────────────────────────────────

    @Test
    void queryPosts_returnsConnection() {
        PostConnection connection = new PostConnection(
                List.of(samplePost), 1,
                new PageInfo(false, false, 1, 1)
        );
        when(postService.getPosts(null, null, null, null)).thenReturn(connection);

        graphQlTester.document("""
                    {
                        posts {
                            totalCount
                            nodes { title slug status authorName }
                            pageInfo { hasNextPage currentPage totalPages }
                        }
                    }
                """)
                .execute()
                .path("posts.totalCount").entity(Integer.class).isEqualTo(1)
                .path("posts.nodes[0].title").entity(String.class).isEqualTo("Test Post")
                .path("posts.nodes[0].slug").entity(String.class).isEqualTo("test-post")
                .path("posts.nodes[0].status").entity(String.class).isEqualTo("published")
                .path("posts.pageInfo.hasNextPage").entity(Boolean.class).isEqualTo(false)
                .path("posts.pageInfo.currentPage").entity(Integer.class).isEqualTo(1);
    }

    @Test
    void queryPosts_withStatusFilter_passesFilterToService() {
        PostConnection connection = new PostConnection(
                List.of(samplePost), 1,
                new PageInfo(false, false, 1, 1)
        );
        when(postService.getPosts(eq("PUBLISHED"), any(), any(), any())).thenReturn(connection);

        graphQlTester.document("""
                    {
                        posts(status: PUBLISHED) {
                            totalCount
                            nodes { title }
                        }
                    }
                """)
                .execute()
                .path("posts.totalCount").entity(Integer.class).isEqualTo(1);
    }

    @Test
    void queryPosts_empty_returnsZeroTotalCount() {
        PostConnection emptyConnection = new PostConnection(
                List.of(), 0,
                new PageInfo(false, false, 1, 0)
        );
        when(postService.getPosts(null, null, null, null)).thenReturn(emptyConnection);

        graphQlTester.document("""
                    {
                        posts {
                            totalCount
                            nodes { title }
                        }
                    }
                """)
                .execute()
                .path("posts.totalCount").entity(Integer.class).isEqualTo(0)
                .path("posts.nodes").entityList(Object.class).hasSize(0);
    }

    // ── Query: post (by slug) ─────────────────────────────────────────────────

    @Test
    void queryPostBySlug_found_returnsPost() {
        when(postService.getPostBySlug("test-post")).thenReturn(samplePost);

        graphQlTester.document("""
                    {
                        post(slug: "test-post") {
                            title
                            slug
                            content
                            authorName
                            readingTimeMinutes
                        }
                    }
                """)
                .execute()
                .path("post.title").entity(String.class).isEqualTo("Test Post")
                .path("post.slug").entity(String.class).isEqualTo("test-post")
                .path("post.content").entity(String.class).isEqualTo("Test content body")
                .path("post.readingTimeMinutes").entity(Integer.class).isEqualTo(5);
    }

    @Test
    void queryPostBySlug_notFound_returnsNull() {
        when(postService.getPostBySlug("nonexistent")).thenReturn(null);

        graphQlTester.document("""
                    {
                        post(slug: "nonexistent") {
                            title
                        }
                    }
                """)
                .execute()
                .path("post").valueIsNull();
    }

    // ── Query: postsByAuthorType ──────────────────────────────────────────────

    @Test
    void queryPostsByAuthorType_returnsMatchingPosts() {
        when(postService.getPostsByAuthorType("HUMAN")).thenReturn(List.of(samplePost));

        graphQlTester.document("""
                    {
                        postsByAuthorType(authorType: HUMAN) {
                            title
                            authorType
                        }
                    }
                """)
                .execute()
                .path("postsByAuthorType").entityList(Object.class).hasSize(1)
                .path("postsByAuthorType[0].title").entity(String.class).isEqualTo("Test Post");
    }

    // ── Mutation: createPost (requires auth) ──────────────────────────────────

    @Test
    void createPost_withoutAuth_returnsUnauthorized() {
        graphQlTester.document("""
                    mutation {
                        createPost(input: {
                            slug: "new-post"
                            title: "New Post"
                            content: "Content"
                            authorType: HUMAN
                            authorName: "Author"
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
    void createPost_withAuth_succeeds() {
        Post created = new Post();
        created.setId(UUID.randomUUID());
        created.setSlug("new-post");
        created.setTitle("New Post");
        created.setContent("Content");
        created.setAuthorType("human");
        created.setAuthorName("Author");
        created.setStatus("draft");
        created.setTags(List.of());
        created.setCreatedAt(OffsetDateTime.now());
        created.setUpdatedAt(OffsetDateTime.now());

        when(postService.createPost(any())).thenReturn(created);

        graphQlTester.document("""
                    mutation {
                        createPost(input: {
                            slug: "new-post"
                            title: "New Post"
                            content: "Content"
                            authorType: HUMAN
                            authorName: "Author"
                        }) {
                            title
                            slug
                            status
                        }
                    }
                """)
                .execute()
                .path("createPost.title").entity(String.class).isEqualTo("New Post")
                .path("createPost.slug").entity(String.class).isEqualTo("new-post")
                .path("createPost.status").entity(String.class).isEqualTo("draft");
    }

    // ── Mutation: updatePost (requires auth) ──────────────────────────────────

    @Test
    void updatePost_withoutAuth_returnsUnauthorized() {
        graphQlTester.document(String.format("""
                    mutation {
                        updatePost(id: "%s", input: {
                            title: "Updated"
                        }) {
                            title
                        }
                    }
                """, postId))
                .execute()
                .errors()
                .satisfy(errors -> assertThat(errors).isNotEmpty());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void updatePost_withAuth_succeeds() {
        samplePost.setTitle("Updated Title");
        when(postService.updatePost(eq(postId), any())).thenReturn(samplePost);

        graphQlTester.document(String.format("""
                    mutation {
                        updatePost(id: "%s", input: {
                            title: "Updated Title"
                        }) {
                            title
                        }
                    }
                """, postId))
                .execute()
                .path("updatePost.title").entity(String.class).isEqualTo("Updated Title");
    }

    // ── Mutation: deletePost (requires auth) ──────────────────────────────────

    @Test
    void deletePost_withoutAuth_returnsUnauthorized() {
        graphQlTester.document(String.format("""
                    mutation {
                        deletePost(id: "%s")
                    }
                """, postId))
                .execute()
                .errors()
                .satisfy(errors -> assertThat(errors).isNotEmpty());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void deletePost_withAuth_succeeds() {
        when(postService.deletePost(postId)).thenReturn(true);

        graphQlTester.document(String.format("""
                    mutation {
                        deletePost(id: "%s")
                    }
                """, postId))
                .execute()
                .path("deletePost").entity(Boolean.class).isEqualTo(true);
    }
}
