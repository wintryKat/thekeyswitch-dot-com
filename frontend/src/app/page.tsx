import Link from "next/link";
import Image from "next/image";

const decorativeIconProps = {
  "aria-hidden": true,
  focusable: "false",
} as const;

const features = [
  {
    href: "/switches",
    title: "Switch Comparison",
    description:
      "Interactive force-curve visualizations for mechanical keyboard switches, powered by D3.js and real actuation data.",
    icon: (
      <svg {...decorativeIconProps} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 10h2v4H6z" />
        <path d="M10 10h4v4h-4z" />
        <path d="M16 10h2v4h-2z" />
      </svg>
    ),
    tech: ["D3.js", "GraphQL", "Spring Data"],
  },
  {
    href: "/weather",
    title: "Weather Dashboard",
    description:
      "Real-time weather data with geolocation, city search, forecasts, and temperature trend charts.",
    icon: (
      <svg {...decorativeIconProps} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    tech: ["Recharts", "Open-Meteo API", "Geolocation"],
  },
  {
    href: "/xr",
    title: "WebXR Lab",
    description:
      "Immersive 3D mechanical workshop built with Three.js, featuring interactive keycaps and spatial lighting.",
    icon: (
      <svg {...decorativeIconProps} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z" />
        <circle cx="8" cy="12" r="2" />
        <circle cx="16" cy="12" r="2" />
        <path d="M10 12h4" />
      </svg>
    ),
    tech: ["React Three Fiber", "Drei", "WebGL"],
  },
  {
    href: "/metrics",
    title: "System Metrics",
    description:
      "Live observability dashboards showing CPU, memory, network I/O, and container health in real time.",
    icon: (
      <svg {...decorativeIconProps} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 17l4-8 4 4 4-10" />
      </svg>
    ),
    tech: ["Prometheus", "Micrometer", "Recharts"],
  },
  {
    href: "/blog",
    title: "Engineering Blog",
    description:
      "Technical deep-dives on architecture decisions, performance optimization, and lessons from production.",
    icon: (
      <svg {...decorativeIconProps} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <line x1="6" y1="8" x2="18" y2="8" />
        <line x1="6" y1="12" x2="14" y2="12" />
        <line x1="6" y1="16" x2="10" y2="16" />
      </svg>
    ),
    tech: ["Markdown", "GraphQL", "SSG"],
  },
];

const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "Spring Boot",
  "PostgreSQL",
  "Docker",
  "AWS",
  "Node.js",
  "GraphQL",
  "Tailwind CSS",
];

function SkillsTicker() {
  return (
    <div
      className="flex items-center gap-3 text-sm font-medium text-[var(--muted)]"
      aria-label="Technical skills"
      role="marquee"
    >
      <div className="skills-ticker-track flex gap-3">
        {[...skills, ...skills].map((skill, i) => (
          <span key={`${skill}-${i < skills.length ? "a" : "b"}`} className="flex shrink-0 items-center gap-3">
            <span className="text-[var(--accent-warm)]">{skill}</span>
            <span aria-hidden="true" className="text-[var(--surface-border)]">
              &middot;
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function WatermarkBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 select-none overflow-hidden"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 opacity-[0.025]">
        {["wm-a", "wm-b", "wm-c", "wm-d", "wm-e", "wm-f", "wm-g", "wm-h"].map((id) => (
          <span
            key={id}
            className="whitespace-nowrap text-[6vw] font-black uppercase tracking-[0.2em] text-[var(--foreground)]"
          >
            THEKEYSWITCH
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* Hero — full viewport */}
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 text-center">
        <WatermarkBackground />

        {/* Subtle radial glow behind hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--accent)] opacity-[0.04] blur-[120px]"
        />

        {/* Logo */}
        <div className="hero-fade-in mb-8">
          <Image
            src="/logo.svg"
            alt="The Key Switch logo — a mechanical switch stem rising like a witch's hat with a crescent moon"
            width={120}
            height={120}
            priority
            className="mx-auto drop-shadow-lg"
          />
        </div>

        {/* Name */}
        <h1 className="hero-name-animate mb-4 text-5xl font-extrabold tracking-tight text-[var(--foreground)] md:text-7xl lg:text-8xl">
          Kat Aurelia
        </h1>

        {/* Tagline */}
        <p className="hero-fade-in mb-6 text-lg font-medium text-[var(--muted)] md:text-xl" style={{ animationDelay: "0.6s" }}>
          Senior Software Engineer
        </p>

        {/* Skills ticker */}
        <div className="hero-fade-in mb-10 w-full max-w-lg overflow-hidden" style={{ animationDelay: "0.9s" }}>
          <SkillsTicker />
        </div>

        {/* CTA Links */}
        <div className="hero-fade-in flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: "1.1s" }}>
          <a
            href="https://linkedin.com/in/kaurelia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--accent)]/25 transition-all hover:bg-[var(--accent-light)] hover:shadow-[var(--accent)]/40 hover:-translate-y-0.5"
          >
            <svg aria-hidden="true" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </a>
          <a
            href="mailto:jobs@thekeyswitch.com"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10 hover:-translate-y-0.5"
          >
            <svg aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            jobs@thekeyswitch.com
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="hero-fade-in absolute bottom-8 left-1/2 -translate-x-1/2" style={{ animationDelay: "1.5s" }}>
          <a
            href="#projects"
            aria-label="Scroll to projects"
            className="flex flex-col items-center gap-2 text-[var(--muted)] transition-colors hover:text-[var(--accent-light)]"
          >
            <span className="text-xs font-medium uppercase tracking-widest">Explore</span>
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="scroll-bounce"
            >
              <path d="M10 4v12M5 11l5 5 5-5" />
            </svg>
          </a>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="gradient-line mx-auto max-w-6xl" />

      {/* Feature cards section */}
      <section id="projects" className="mx-auto max-w-6xl px-4 pb-24 pt-16">
        <div className="mb-12 text-center reveal">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-4xl">
            What I Build
          </h2>
          <p className="mx-auto max-w-xl text-[var(--muted)]">
            Full-stack applications demonstrating expertise across the modern web stack — from interactive data visualizations to real-time infrastructure monitoring.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 reveal-stagger">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="card-hover group relative flex flex-col rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6 hover:border-[var(--accent)]/40 hover:shadow-lg hover:shadow-[var(--accent)]/5 reveal"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent-light)] transition-colors group-hover:bg-[var(--accent)]/20">
                {feature.icon}
              </div>

              <h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">
                {feature.title}
              </h3>

              <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                {feature.description}
              </p>

              {/* Tech tags */}
              <div className="mb-4 flex flex-wrap gap-1.5">
                {feature.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[var(--background)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)] ring-1 ring-[var(--surface-border)]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent-light)] transition-transform group-hover:translate-x-1">
                Explore
                <svg
                  {...decorativeIconProps}
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

      {/* Tech stack summary */}
      <section className="border-t border-[var(--surface-border)] bg-[var(--surface)]/50 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center reveal">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Built With
          </h2>
          <p className="mb-8 text-sm text-[var(--muted)]">
            The architecture behind this site
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-[var(--muted)]">
            {[
              "Next.js 15",
              "Spring Boot 3",
              "PostgreSQL 16",
              "GraphQL",
              "Docker Compose",
              "Caddy",
              "Prometheus",
              "GitHub Actions",
            ].map((item) => (
              <span
                key={item}
                className="flex items-center gap-2 transition-colors hover:text-[var(--foreground)]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
