import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | The Key Switch",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3 border-b border-[var(--surface-border)] pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent-light)]">
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
            <circle cx="8" cy="5" r="3" />
            <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Admin Panel
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Authentication gating will be added in a future iteration.
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
