import type { MetadataRoute } from "next";
import { getServerClient } from "@/lib/graphql/client";
import { GET_POSTS } from "@/lib/graphql/queries";
import type { PostConnection } from "@/lib/graphql/types";

const BASE_URL = "https://thekeyswitch.com";

const STATIC_ROUTES = [
  "/",
  "/about",
  "/resume",
  "/blog",
  "/switches",
  "/weather",
  "/xr",
  "/metrics",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1.0 : 0.8,
  }));

  try {
    const client = getServerClient();
    const data = await client.request<{ posts: PostConnection }>(GET_POSTS, {
      status: "PUBLISHED",
      pageSize: 1000,
    });

    const blogEntries: MetadataRoute.Sitemap = data.posts.nodes.map(
      (post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.publishedAt
          ? new Date(post.publishedAt)
          : new Date(post.createdAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }),
    );

    return [...staticEntries, ...blogEntries];
  } catch {
    return staticEntries;
  }
}
