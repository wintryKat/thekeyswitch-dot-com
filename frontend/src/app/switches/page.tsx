import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keyboard Switch Comparison | The Key Switch",
  description:
    "Interactive force-curve visualizations and comparison tool for mechanical keyboard switches.",
};

export default function SwitchesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
        Keyboard Switch Comparison Tool
      </h1>
      <p className="mb-10 max-w-2xl text-[var(--muted)] leading-relaxed">
        Compare mechanical keyboard switches side-by-side with interactive D3.js
        force-curve visualizations. Filter by type, actuation force, travel
        distance, and more.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10 3v14M3 10l7-7 7 7" />
            </svg>
          </div>
          <h2 className="mb-2 font-semibold text-[var(--foreground)]">Linear</h2>
          <p className="text-sm text-[var(--muted)]">
            Smooth keystroke with no tactile bump. Popular for gaming.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 14l4-4 3 3 7-7" />
            </svg>
          </div>
          <h2 className="mb-2 font-semibold text-[var(--foreground)]">Tactile</h2>
          <p className="text-sm text-[var(--muted)]">
            Noticeable bump at actuation point. Great for typing accuracy.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="10" cy="10" r="3" />
              <path d="M10 3v2M10 15v2M3 10h2M15 10h2" />
            </svg>
          </div>
          <h2 className="mb-2 font-semibold text-[var(--foreground)]">Clicky</h2>
          <p className="text-sm text-[var(--muted)]">
            Tactile bump with an audible click sound. The classic mechanical feel.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-dashed border-[var(--surface-border)] bg-[var(--surface)]/50 p-12 text-center">
        <div className="mb-3 text-4xl">📈</div>
        <h2 className="mb-2 text-lg font-semibold text-[var(--foreground)]">
          Force Curve Visualization
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Interactive D3.js force-displacement charts will render here. Select
          switches above to compare their actuation profiles in real time.
        </p>
      </div>
    </div>
  );
}
