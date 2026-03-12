"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getPublicUrl } from "@/lib/graphql/client";
import { GET_POSTS, GET_SWITCHES } from "@/lib/graphql/queries";
import type { Post, PostConnection, SwitchConnection } from "@/lib/graphql/types";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(getPublicUrl(), {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? "GraphQL error");
  }
  return json.data;
}

interface DashboardStats {
  publishedPosts: number;
  draftPosts: number;
  switchEntries: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentPosts: Post[];
}

const DELETE_POST = `
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

export default function AdminPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [publishedRes, draftRes, switchRes] = await Promise.all([
        gqlRequest<{ posts: PostConnection }>(GET_POSTS, {
          status: "PUBLISHED",
          page: 1,
          pageSize: 5,
        }),
        gqlRequest<{ posts: PostConnection }>(GET_POSTS, {
          status: "DRAFT",
          page: 1,
          pageSize: 1,
        }),
        gqlRequest<{ switches: SwitchConnection }>(GET_SWITCHES, {
          page: 1,
          pageSize: 1,
        }),
      ]);

      setData({
        stats: {
          publishedPosts: publishedRes.posts.totalCount,
          draftPosts: draftRes.posts.totalCount,
          switchEntries: switchRes.switches.totalCount,
        },
        recentPosts: publishedRes.posts.nodes,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeletingId(id);
    try {
      await gqlRequest(DELETE_POST, { id });
      await fetchData();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to delete post"
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
          Dashboard
        </h1>
        <Link
          href="/admin/posts"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--accent)]/25 transition-all hover:bg-[var(--accent-light)] hover:shadow-[var(--accent)]/40"
        >
          New Post
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <p className="font-medium">Failed to load data</p>
          <p className="mt-1 text-red-400/80">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-xs font-medium underline underline-offset-2 hover:text-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={`stat-skeleton-${i}`}>
              <Skeleton className="mb-2 h-3 w-24" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))
        ) : (
          <>
            <Card>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                Published Posts
              </p>
              <p className="text-3xl font-bold text-[var(--foreground)]">
                {data?.stats.publishedPosts ?? 0}
              </p>
            </Card>
            <Card>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                Draft Posts
              </p>
              <p className="text-3xl font-bold text-[var(--foreground)]">
                {data?.stats.draftPosts ?? 0}
              </p>
            </Card>
            <Card>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                Switch Entries
              </p>
              <p className="text-3xl font-bold text-[var(--foreground)]">
                {data?.stats.switchEntries ?? 0}
              </p>
            </Card>
            <Card>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                API Status
              </p>
              <p className="text-3xl font-bold">
                {error ? (
                  <span className="text-red-400">Down</span>
                ) : (
                  <span className="text-emerald-400">Healthy</span>
                )}
              </p>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/posts"
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-light)]"
          >
            Manage Posts
          </Link>
          <Link
            href="/admin/switches"
            className="rounded-lg border border-[var(--surface-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10"
          >
            Manage Switches
          </Link>
          <Link
            href="/blog"
            className="rounded-lg border border-[var(--surface-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10"
          >
            View Blog
          </Link>
        </div>
      </Card>

      {/* Recent Posts */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
          Recent Posts
        </h2>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`post-skeleton-${i}`} className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="mb-2 h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.recentPosts && data.recentPosts.length > 0 ? (
          <div className="divide-y divide-[var(--surface-border)]">
            {data.recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--accent-light)]"
                  >
                    {post.title}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--muted)]">
                    <span>
                      {formatDate(post.publishedAt ?? post.createdAt)}
                    </span>
                    {post.authorType === "AI_AGENT" && (
                      <Badge variant="warning">AI</Badge>
                    )}
                    <Badge
                      variant={
                        post.status === "PUBLISHED" ? "success" : "default"
                      }
                    >
                      {post.status}
                    </Badge>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="rounded-md px-2.5 py-1 text-xs font-medium text-[var(--accent-light)] transition-colors hover:bg-[var(--accent)]/10"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="rounded-md px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {deletingId === post.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            No posts yet. Create your first blog post to get started.
          </p>
        )}
      </Card>
    </div>
  );
}
