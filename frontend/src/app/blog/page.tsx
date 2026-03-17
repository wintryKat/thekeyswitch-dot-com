import type { Metadata } from "next";
import Link from "next/link";
import { getServerClient } from "@/lib/graphql/client";
import { GET_POSTS } from "@/lib/graphql/queries";
import type { Post, PostConnection } from "@/lib/graphql/types";
import Badge from "@/components/ui/Badge";

const decorativeIconProps = {
  "aria-hidden": true,
  focusable: "false",
} as const;

export const metadata: Metadata = {
  title: "Blog | The Key Switch",
  description:
    "Technical articles on web engineering, architecture, and keyboards.",
};

async function getPosts(): Promise<Post[]> {
  try {
    const client = getServerClient();
    const data = await client.request<{ posts: PostConnection }>(GET_POSTS, {
      status: "PUBLISHED",
      page: 1,
      pageSize: 20,
    });
    return data.posts.nodes;
  } catch {
    return [];
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
      {/* Header */}
      <section className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-1.5 text-xs font-medium tracking-wide text-[var(--muted)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Blog
        </div>
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-[var(--foreground)] md:text-5xl">
          Blog
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[var(--muted)]">
          Notes on building things for the web, mechanical keyboards,
          and whatever else I find worth writing about.
        </p>
      </section>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 hover:shadow-lg hover:shadow-[var(--accent)]/5"
            >
              {/* Meta line */}
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                <time dateTime={post.publishedAt ?? post.createdAt}>
                  {formatDate(post.publishedAt ?? post.createdAt)}
                </time>
                {post.readingTimeMinutes && (
                  <>
                    <span className="text-[var(--surface-border)]">&middot;</span>
                    <span>{post.readingTimeMinutes} min read</span>
                  </>
                )}
                {post.authorType === "AI_AGENT" && (
                  <Badge variant="warning">AI Authored</Badge>
                )}
              </div>

              {/* Title */}
              <h2 className="mb-2 text-xl font-semibold leading-snug text-[var(--foreground)]">
                {post.title}
              </h2>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                  {post.excerpt}
                </p>
              )}

              {/* Footer */}
              <div className="mt-auto flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="default">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="default">+{post.tags.length - 3}</Badge>
                  )}
                </div>
                <span className="ml-2 text-xs text-[var(--muted)]">
                  by {post.authorName}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* No posts yet */
        <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-8 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent-light)]">
            <svg
              {...decorativeIconProps}
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
              <line x1="6" y1="8" x2="18" y2="8" />
              <line x1="6" y1="12" x2="14" y2="12" />
              <line x1="6" y1="16" x2="10" y2="16" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
            Nothing here yet
          </h2>
          <p className="max-w-md text-sm text-[var(--muted)]">
            Posts will show up here as they get written. In the meantime,
            the rest of this site is the work sample.
          </p>
        </div>
      )}
    </div>
  );
}
