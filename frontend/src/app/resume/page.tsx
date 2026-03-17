import type { Metadata } from "next";
import Link from "next/link";
import { getServerClient } from "@/lib/graphql/client";
import { GET_SITE_CONFIG } from "@/lib/graphql/queries";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "R\u00e9sum\u00e9 | The Key Switch",
  description:
    "Professional experience, technical skills, and education for a senior full-stack software engineer.",
};

interface Experience {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  highlights: string[];
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

interface SkillGroup {
  category: string;
  items: { name: string; level: number }[];
}

interface Project {
  name: string;
  href: string;
  description: string;
}

const decorativeIconProps = {
  "aria-hidden": true,
  focusable: "false",
} as const;

const fallbackExperience: Experience[] = [
  {
    company: "Cubic Transportation Systems / Umo Mobility",
    title: "Senior Front End Software Engineer",
    location: "Austin, TX",
    startDate: "2021",
    endDate: "2026",
    highlights: [
      "Built a Flutter mobile UI module integrating AWS Cognito authentication, designed for embedding into native iOS and Android applications",
      "Developed and maintained AWS Lambda function handlers extending Cognito capabilities via API Gateway",
      "Extended Angular applications with new authentication flows, UI features, and functionality; contributed to React application maintenance",
      "Developed WCAG 2.1 accessibility testing automation for Flutter applications using Appium and Dart",
      "Applied GitHub Copilot daily for prototyping, refactoring, and code quality review",
      "Reviewed pull requests across the engineering team for quality assurance and standards compliance",
      "Updated Terraform infrastructure definitions for services under active development",
    ],
  },
  {
    company: "Cubic Corporation",
    title: "Senior Full-stack Web Developer",
    location: "Austin, TX",
    startDate: "2019",
    endDate: "2021",
    highlights: [
      "Maintained and extended an internal ideation platform and peer-recognition system built on AngularJS, Node.js, Express.js, and MongoDB, containerized with Docker",
      "Augmented frontend and backend with new features and data support per stakeholder direction",
      "Prototyped new projects to validate technical approaches before committing to full development",
      "Administered services and MongoDB database for internally hosted applications",
    ],
  },
  {
    company: "Cond\u00e9 Nast",
    title: "Senior Analyst: Custom Applications",
    location: "Wilmington, DE; later Austin, TX",
    startDate: "2009",
    endDate: "2018",
    highlights: [
      "Designed, prototyped, and built web applications across Vogue, Bon App\u00e9tit, Cond\u00e9 Nast Entertainment, and Golf Digest",
      "Built and owned a JavaScript-based content collection and scoring system used by 1,200 reviewers across multiple years",
      "Led extension of the Atex Polopoly CMS (Java) that became the backbone of the company\u2019s intranet",
      "Developed applications across PHP, Java, Python, Node.js, Ember.js, and SQL with various templating engines",
      "Owned systems end-to-end: requirements gathering, prototyping, development, deployment, and iterative improvement",
    ],
  },
];

const fallbackEducation: Education[] = [
  {
    institution: "Drexel University, College of Engineering",
    degree: "Bachelor of Arts",
    field: "Computer Science",
    startYear: "2000",
    endYear: "2006",
  },
];

const fallbackSkills: SkillGroup[] = [
  {
    category: "Frontend",
    items: [
      { name: "JavaScript / TypeScript", level: 90 },
      { name: "Angular / AngularJS", level: 85 },
      { name: "Flutter / Dart", level: 80 },
      { name: "HTML / CSS / SASS", level: 90 },
      { name: "React (professional exposure)", level: 30 },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js / Express.js", level: 85 },
      { name: "Java / Spring Boot", level: 60 },
      { name: "PHP / Python / Flask", level: 70 },
      { name: "SQL (SQL Server, Oracle, SQLite)", level: 80 },
      { name: "MongoDB", level: 75 },
    ],
  },
  {
    category: "Infrastructure & Tools",
    items: [
      { name: "AWS (Lambda, Cognito, API Gateway, S3)", level: 75 },
      { name: "Docker / Compose", level: 70 },
      { name: "Terraform / GitHub Actions", level: 65 },
      { name: "Git / GitHub / Jira", level: 90 },
      { name: "Linux (multi-distro)", level: 80 },
    ],
  },
];

const fallbackProjects: Project[] = [
  {
    name: "Switch Comparison Tool",
    href: "/switches",
    description:
      "Interactive force-curve visualizations for mechanical keyboard switches with D3.js.",
  },
  {
    name: "Weather Dashboard",
    href: "/weather",
    description:
      "Real-time weather data with interactive maps and historical trend analysis.",
  },
  {
    name: "WebXR Lab",
    href: "/xr",
    description:
      "Immersive 3D experiences built with Three.js and WebXR APIs.",
  },
  {
    name: "System Metrics",
    href: "/metrics",
    description:
      "Live observability dashboard showing infrastructure health and container stats.",
  },
];

async function getResumeData() {
  try {
    const client = getServerClient();
    const keys = [
      "profile.experience",
      "profile.education",
      "profile.skills",
      "profile.projects",
    ];
    const results = await Promise.all(
      keys.map((key) =>
        client.request<{ siteConfig: { value: unknown } }>(GET_SITE_CONFIG, {
          key,
        })
      )
    );
    return {
      experience:
        (results[0].siteConfig?.value as Experience[]) ?? fallbackExperience,
      education:
        (results[1].siteConfig?.value as Education[]) ?? fallbackEducation,
      skills:
        (results[2].siteConfig?.value as SkillGroup[]) ?? fallbackSkills,
      projects:
        (results[3].siteConfig?.value as Project[]) ?? fallbackProjects,
    };
  } catch {
    return {
      experience: fallbackExperience,
      education: fallbackEducation,
      skills: fallbackSkills,
      projects: fallbackProjects,
    };
  }
}

export default async function ResumePage() {
  const { experience, education, skills, projects } = await getResumeData();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
      {/* Header */}
      <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-[var(--foreground)] md:text-5xl">
            R&eacute;sum&eacute;
          </h1>
          <p className="text-lg text-[var(--muted)]">
            Professional experience, skills, and education.
          </p>
        </div>
        <a
          href="mailto:jobs@thekeyswitch.com?subject=R%C3%A9sum%C3%A9%20Request"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--accent)]/25 transition-all hover:bg-[var(--accent-light)] hover:shadow-[var(--accent)]/40 hover:-translate-y-0.5"
        >
          <svg
            {...decorativeIconProps}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Request R&eacute;sum&eacute;
        </a>
      </div>

      {/* Experience Timeline */}
      <section className="mb-16 reveal">
        <h2 className="mb-8 text-2xl font-bold text-[var(--foreground)]">
          Experience
        </h2>
        <div className="relative border-l-2 border-[var(--surface-border)] pl-8">
          {experience.map((job, i) => (
            <div key={i} className="relative mb-10 last:mb-0">
              {/* Timeline dot */}
              <div className="absolute -left-[calc(2rem+5px)] top-1.5 h-3 w-3 rounded-full border-2 border-[var(--accent)] bg-[var(--background)]" />

              <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {job.title}
                </h3>
                <Badge variant="accent">{job.company}</Badge>
              </div>

              <p className="mb-3 text-sm text-[var(--muted)]">
                {job.location} &middot; {job.startDate} &ndash;{" "}
                {job.endDate ?? "Present"}
              </p>

              <ul className="space-y-1.5">
                {job.highlights.map((highlight, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm leading-relaxed text-[var(--muted)]"
                  >
                    <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--accent-light)]" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-[var(--foreground)] reveal">
          Skills
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 reveal-stagger">
          {skills.map((group) => (
            <Card key={group.category} className="reveal">
              <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
                {group.category}
              </h3>
              <div className="space-y-3">
                {group.items.map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-[var(--muted)]">{skill.name}</span>
                      <span className="text-xs text-[var(--muted)]">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-border)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)]"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-16 reveal">
        <h2 className="mb-8 text-2xl font-bold text-[var(--foreground)]">
          Education
        </h2>
        <div className="space-y-4">
          {education.map((edu, i) => (
            <Card key={i}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    {edu.degree} in {edu.field}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    {edu.institution}
                  </p>
                </div>
                <Badge variant="default">
                  {edu.startYear} &ndash; {edu.endYear}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-[var(--foreground)] reveal">
          Featured Projects
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 reveal-stagger">
          {projects.map((project) => (
            <Link
              key={project.name}
              href={project.href}
              className="card-hover group reveal rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6 hover:border-[var(--accent)]/40 hover:shadow-lg hover:shadow-[var(--accent)]/5"
            >
              <h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">
                {project.name}
              </h3>
              <p className="mb-3 text-sm leading-relaxed text-[var(--muted)]">
                {project.description}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent-light)] transition-transform group-hover:translate-x-1">
                View Project
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
    </div>
  );
}
