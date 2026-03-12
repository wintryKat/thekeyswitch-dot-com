import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getServerClient } from "@/lib/graphql/client";
import { GET_POST } from "@/lib/graphql/queries";
import type { Post } from "@/lib/graphql/types";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string): Promise<Post | null> {
  try {
    const client = getServerClient();
    const data = await client.request<{ post: Post }>(GET_POST, { slug });
    return data.post;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: `${slug.replace(/-/g, " ")} | Blog | The Key Switch`,
      description: `Read the full article: ${slug.replace(/-/g, " ")}`,
    };
  }

  return {
    title: `${post.title} | Blog | The Key Switch`,
    description: post.excerpt ?? `Read ${post.title} on The Key Switch blog.`,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      authors: [post.authorName],
      tags: post.tags,
    },
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 8H3M7 4l-4 4 4 4" />
          </svg>
          Back to Blog
        </Link>
        <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-8 py-20 text-center">
          <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">
            Post Not Found
          </h1>
          <p className="text-sm text-[var(--muted)]">
            The post &ldquo;{slug.replace(/-/g, " ")}&rdquo; could not be
            loaded. It may not exist yet or the API may be unavailable.
          </p>
        </div>
      </div>
    );
  }

  const authorMeta = post.authorMeta ? JSON.parse(post.authorMeta) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      {/* Back link */}
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 8H3M7 4l-4 4 4 4" />
        </svg>
        Back to Blog
      </Link>

      <article>
        {/* Header */}
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="accent">{tag}</Badge>
              </Link>
            ))}
          </div>

          <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-[var(--foreground)] md:text-5xl">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <span>By {post.authorName}</span>
            <span className="text-[var(--surface-border)]">|</span>
            <time dateTime={post.publishedAt ?? post.createdAt}>
              {formatDate(post.publishedAt ?? post.createdAt)}
            </time>
            {post.readingTimeMinutes && (
              <>
                <span className="text-[var(--surface-border)]">|</span>
                <span>{post.readingTimeMinutes} min read</span>
              </>
            )}
            {post.authorType === "AI_AGENT" && (
              <Badge variant="warning">AI Authored</Badge>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-invert max-w-none [&_a]:text-[var(--accent-light)] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[var(--accent)] [&_blockquote]:border-l-[var(--accent)] [&_blockquote]:text-[var(--muted)] [&_code]:rounded [&_code]:bg-[var(--surface)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-[var(--accent-light)] [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--foreground)] [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[var(--foreground)] [&_hr]:border-[var(--surface-border)] [&_img]:rounded-xl [&_li]:text-[var(--muted)] [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-[var(--muted)] [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[var(--surface-border)] [&_pre]:bg-[var(--surface)] [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:w-full [&_td]:border [&_td]:border-[var(--surface-border)] [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_td]:text-[var(--muted)] [&_th]:border [&_th]:border-[var(--surface-border)] [&_th]:bg-[var(--surface)] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_th]:text-[var(--foreground)] [&_ul]:list-disc [&_ul]:pl-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {post.content ?? ""}
          </ReactMarkdown>
        </div>

        {/* AI Author Attribution Card */}
        {post.authorType === "AI_AGENT" && authorMeta && (
          <Card className="mt-12">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27a7 7 0 0 1-12.46 0H6a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                  <circle cx="9" cy="13" r="1" />
                  <circle cx="15" cy="13" r="1" />
                  <path d="M9 17h6" />
                </svg>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-[var(--foreground)]">
                  AI-Authored Content
                </h3>
                <p className="mb-2 text-sm text-[var(--muted)]">
                  This article was written by{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {post.authorName}
                  </span>
                  {authorMeta.platform && (
                    <span>
                      {" "}
                      on {authorMeta.platform}
                    </span>
                  )}
                  {authorMeta.model && (
                    <span>
                      {" "}
                      using the {authorMeta.model} model
                    </span>
                  )}
                  .
                </p>
                {authorMeta.transparencyNote && (
                  <p className="text-xs italic text-[var(--muted)]">
                    {authorMeta.transparencyNote}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}
      </article>
    </div>
  );
}
