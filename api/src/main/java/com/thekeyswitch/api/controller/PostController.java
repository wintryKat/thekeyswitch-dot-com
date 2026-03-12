package com.thekeyswitch.api.controller;

import com.thekeyswitch.api.dto.CreatePostInput;
import com.thekeyswitch.api.dto.PostConnection;
import com.thekeyswitch.api.dto.UpdatePostInput;
import com.thekeyswitch.api.model.Post;
import com.thekeyswitch.api.service.PostService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @QueryMapping
    public PostConnection posts(@Argument String status,
                                @Argument String tag,
                                @Argument Integer page,
                                @Argument Integer pageSize) {
        return postService.getPosts(status, tag, page, pageSize);
    }

    @QueryMapping
    public Post post(@Argument String slug) {
        return postService.getPostBySlug(slug);
    }

    @QueryMapping
    public List<Post> postsByAuthorType(@Argument String authorType) {
        return postService.getPostsByAuthorType(authorType);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Post createPost(@Argument CreatePostInput input) {
        return postService.createPost(input);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Post updatePost(@Argument String id, @Argument UpdatePostInput input) {
        return postService.updatePost(UUID.fromString(id), input);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public boolean deletePost(@Argument String id) {
        return postService.deletePost(UUID.fromString(id));
    }
}
