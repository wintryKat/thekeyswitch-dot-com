import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | The Key Switch",
  description: "Technical articles on web engineering, architecture, and keyboards.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
        Engineering Blog
      </h1>
      <p className="mb-10 text-[var(--muted)] leading-relaxed">
        Technical deep-dives on architecture decisions, performance optimization,
        mechanical keyboards, and lessons from production systems.
      </p>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6"
          >
            <div className="mb-2 h-4 w-24 rounded bg-[var(--surface-border)]" />
            <div className="mb-3 h-6 w-3/4 rounded bg-[var(--surface-border)]" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-[var(--surface-border)]" />
              <div className="h-3 w-5/6 rounded bg-[var(--surface-border)]" />
            </div>
          </div>
        ))}
        <p className="pt-4 text-center text-sm text-[var(--muted)]">
          Blog posts will load from the CMS once the GraphQL API is connected.
        </p>
      </div>
    </div>
  );
}
