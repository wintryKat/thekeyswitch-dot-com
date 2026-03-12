import Link from "next/link";

const features = [
  {
    href: "/switches",
    title: "Switch Comparison",
    description:
      "Interactive force-curve visualizations for mechanical keyboard switches, powered by D3.js and real actuation data.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 10h2v4H6z" />
        <path d="M10 10h4v4h-4z" />
        <path d="M16 10h2v4h-2z" />
      </svg>
    ),
  },
  {
    href: "/weather",
    title: "Weather Dashboard",
    description:
      "Real-time weather data with interactive maps, forecasts, and historical trend analysis.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    href: "/xr",
    title: "WebXR Lab",
    description:
      "Immersive 3D experiences built with WebXR, Three.js, and spatial computing APIs for VR and AR headsets.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z" />
        <circle cx="8" cy="12" r="2" />
        <circle cx="16" cy="12" r="2" />
        <path d="M10 12h4" />
      </svg>
    ),
  },
  {
    href: "/metrics",
    title: "System Metrics",
    description:
      "Live observability dashboards showing infrastructure health, API latency, and deployment stats.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 17l4-8 4 4 4-10" />
      </svg>
    ),
  },
  {
    href: "/blog",
    title: "Engineering Blog",
    description:
      "Technical deep-dives on architecture decisions, performance optimization, and lessons from production.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <line x1="6" y1="8" x2="18" y2="8" />
        <line x1="6" y1="12" x2="14" y2="12" />
        <line x1="6" y1="16" x2="10" y2="16" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center pb-16 pt-24 text-center md:pb-24 md:pt-36">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-1.5 text-xs font-medium tracking-wide text-[var(--muted)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Portfolio &amp; Engineering Showcase
        </div>

        <h1 className="mb-6 bg-gradient-to-b from-[var(--foreground)] to-[var(--muted)] bg-clip-text text-5xl font-extrabold leading-tight tracking-tight text-transparent md:text-7xl">
          The Key Switch
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[var(--muted)] md:text-xl">
          Senior web engineering meets mechanical keyboard enthusiasm. Full-stack
          projects built with Next.js, Spring Boot, PostgreSQL, and a love for
          tactile feedback.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/about"
            className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--accent)]/25 transition-all hover:bg-[var(--accent-light)] hover:shadow-[var(--accent)]/40"
          >
            Learn More
          </Link>
          <Link
            href="/switches"
            className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10"
          >
            Try the Switch Tool
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group relative flex flex-col rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 hover:shadow-lg hover:shadow-[var(--accent)]/5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent-light)]">
                {feature.icon}
              </div>

              <h2 className="mb-2 text-lg font-semibold text-[var(--foreground)]">
                {feature.title}
              </h2>

              <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                {feature.description}
              </p>

              <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent-light)] transition-transform group-hover:translate-x-1">
                Explore
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
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
