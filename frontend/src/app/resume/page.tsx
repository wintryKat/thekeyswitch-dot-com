import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume | The Key Switch",
  description: "Professional experience and technical skills.",
};

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
        Resume
      </h1>
      <p className="mb-8 text-[var(--muted)] leading-relaxed">
        Professional experience, education, and technical skills will be loaded
        from the CMS via GraphQL. A downloadable PDF version will also be
        available.
      </p>
      <div className="space-y-6">
        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6">
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">
            Experience
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Work history entries will be rendered here once the API is connected.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6">
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">
            Skills
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Technical skills with proficiency indicators will appear here.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6">
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">
            Education
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Education history will be populated from the CMS.
          </p>
        </div>
      </div>
    </div>
  );
}
