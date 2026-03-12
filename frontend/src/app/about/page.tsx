import type { Metadata } from "next";
import { getServerClient } from "@/lib/graphql/client";
import { GET_SITE_CONFIG } from "@/lib/graphql/queries";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "About | The Key Switch",
  description:
    "Learn more about the senior engineer behind The Key Switch — skills, philosophy, and technical background.",
};

interface SkillCategory {
  name: string;
  icon: string;
  skills: string[];
}

const fallbackHero = {
  name: "Kat",
  tagline:
    "Senior web engineer with a passion for building performant, accessible, and well-architected systems. Equally comfortable designing database schemas and pixel-perfect UIs.",
};

const fallbackSkills: SkillCategory[] = [
  {
    name: "Languages",
    icon: "code",
    skills: [
      "TypeScript",
      "JavaScript",
      "Kotlin",
      "Java",
      "Python",
      "SQL",
      "HTML/CSS",
      "Bash",
    ],
  },
  {
    name: "Frontend",
    icon: "layout",
    skills: [
      "React",
      "Next.js",
      "Tailwind CSS",
      "Three.js / WebXR",
      "D3.js",
      "Recharts",
      "Zustand",
      "GraphQL (urql)",
    ],
  },
  {
    name: "Backend",
    icon: "server",
    skills: [
      "Spring Boot",
      "Node.js",
      "GraphQL (DGS)",
      "REST APIs",
      "WebSockets",
      "gRPC",
      "OAuth 2 / JWT",
    ],
  },
  {
    name: "Databases",
    icon: "database",
    skills: [
      "PostgreSQL",
      "Redis",
      "Elasticsearch",
      "MongoDB",
      "SQLite",
    ],
  },
  {
    name: "Infrastructure",
    icon: "cloud",
    skills: [
      "Docker",
      "Kubernetes",
      "Caddy",
      "Nginx",
      "GitHub Actions",
      "Terraform",
      "AWS",
      "Cloudflare",
    ],
  },
  {
    name: "Tools & Observability",
    icon: "tool",
    skills: [
      "Git",
      "Prometheus",
      "Grafana",
      "Loki",
      "Sentry",
      "Playwright",
      "Vitest",
      "JUnit",
    ],
  },
];

async function getProfileData() {
  try {
    const client = getServerClient();

    const [heroRes, skillsRes] = await Promise.all([
      client.request<{ siteConfig: { value: unknown } }>(GET_SITE_CONFIG, {
        key: "profile.hero",
      }),
      client.request<{ siteConfig: { value: unknown } }>(GET_SITE_CONFIG, {
        key: "profile.skills",
      }),
    ]);

    return {
      hero: (heroRes.siteConfig?.value as typeof fallbackHero) ?? fallbackHero,
      skills:
        (skillsRes.siteConfig?.value as SkillCategory[]) ?? fallbackSkills,
    };
  } catch {
    return { hero: fallbackHero, skills: fallbackSkills };
  }
}

export default async function AboutPage() {
  const { hero, skills } = await getProfileData();

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="flex flex-col items-center pb-16 pt-24 text-center md:pb-20 md:pt-36">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-1.5 text-xs font-medium tracking-wide text-[var(--muted)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          About Me
        </div>

        <h1 className="mb-6 bg-gradient-to-b from-[var(--foreground)] to-[var(--muted)] bg-clip-text text-5xl font-extrabold leading-tight tracking-tight text-transparent md:text-7xl">
          {hero.name}
        </h1>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--muted)] md:text-xl">
          {hero.tagline}
        </p>
      </section>

      {/* Skills Grid */}
      <section className="pb-24">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Technical Skills
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((category) => (
            <Card key={category.name}>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-sm text-[var(--accent-light)]">
                  {category.icon === "code" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                  )}
                  {category.icon === "layout" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                  )}
                  {category.icon === "server" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>
                  )}
                  {category.icon === "database" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
                  )}
                  {category.icon === "cloud" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>
                  )}
                  {category.icon === "tool" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                  )}
                </span>
                {category.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <Badge key={skill} variant="accent">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="pb-24">
        <Card className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-xl font-bold text-[var(--foreground)]">
            Engineering Philosophy
          </h2>
          <div className="space-y-3 text-[var(--muted)] leading-relaxed">
            <p>
              I believe great software emerges from a balance of pragmatism and
              craftsmanship. Ship early, iterate often, but never compromise on
              the fundamentals: type safety, automated testing, observability,
              and clear documentation.
            </p>
            <p>
              Every system I build prioritizes developer experience alongside
              user experience. If the codebase is a joy to work in, the product
              will reflect that quality.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
