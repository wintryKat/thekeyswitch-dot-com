import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | The Key Switch",
  description: "Learn more about the engineer behind The Key Switch.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
        About
      </h1>
      <div className="space-y-4 text-[var(--muted)] leading-relaxed">
        <p>
          The Key Switch is a portfolio and engineering showcase built to
          demonstrate modern full-stack development practices. It combines a
          Next.js frontend, a Spring Boot API, PostgreSQL for persistence, and a
          suite of observability tooling.
        </p>
        <p>
          Content on this page is loaded from the headless CMS. Once the GraphQL
          API is connected, biographical information, work history, and project
          highlights will render here dynamically.
        </p>
        <div className="mt-8 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6">
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">
            Tech Stack
          </h2>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Next.js 15 with App Router
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Spring Boot 3 (Kotlin)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              PostgreSQL 17
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              GraphQL with DGS
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Caddy reverse proxy
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Prometheus &amp; Grafana
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
