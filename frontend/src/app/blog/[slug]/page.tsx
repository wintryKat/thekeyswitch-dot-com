import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ")} | Blog | The Key Switch`,
    description: `Read the full article: ${slug.replace(/-/g, " ")}`,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <a
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
      </a>
      <article>
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
          {slug.replace(/-/g, " ")}
        </h1>
        <div className="mb-8 flex items-center gap-3 text-sm text-[var(--muted)]">
          <span>Loading date...</span>
          <span className="text-[var(--surface-border)]">|</span>
          <span>Loading read time...</span>
        </div>
        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-8">
          <p className="text-[var(--muted)]">
            This blog post will be fetched from the CMS via GraphQL using the
            slug <code className="rounded bg-[var(--accent)]/10 px-1.5 py-0.5 text-sm text-[var(--accent-light)]">{slug}</code>.
            Full article content with rich text rendering will appear here once
            the API integration is complete.
          </p>
        </div>
      </article>
    </div>
  );
}
