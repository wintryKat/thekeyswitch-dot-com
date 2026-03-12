# SPECIFICATIONS.md — thekeyswitch.com

> Exhaustive specification of the design, development, and deployment of thekeyswitch.com.
> Written 2026-03-12 at the conclusion of the initial build.

---

## Table of Contents

1. [Project Purpose & Requirements](#1-project-purpose--requirements)
2. [Technology Stacks](#2-technology-stacks)
3. [Directory Structure](#3-directory-structure)
4. [Infrastructure & Deployment](#4-infrastructure--deployment)
5. [Backend API](#5-backend-api)
6. [Frontend Application](#6-frontend-application)
7. [Features by Page](#7-features-by-page)
8. [Look & Feel Guidelines](#8-look--feel-guidelines)
9. [Security](#9-security)
10. [Testing](#10-testing)
11. [Domain Configuration](#11-domain-configuration)
12. [Database Schema & Seed Data](#12-database-schema--seed-data)
13. [GraphQL Schema](#13-graphql-schema)
14. [Hardware & Platform Constraints](#14-hardware--platform-constraints)
15. [Compromises & Known Limitations](#15-compromises--known-limitations)
16. [Maintenance Considerations](#16-maintenance-considerations)
17. [Requirements as Communicated](#17-requirements-as-communicated)
18. [Build Chronology](#18-build-chronology)

---

## 1. Project Purpose & Requirements

### Intent

A production portfolio website demonstrating senior-level full-stack web engineering competence to hiring managers. The site is both a resume and a live technical showcase — every feature exists to prove a specific engineering skill.

### Core Mandates

- **Public repository.** MIT-licensed at `github.com/wintryKat/thekeyswitch-dot-com`. Absolutely no secrets in commits.
- **Autonomous build.** The project was built with minimal human intervention — the user provided the architecture spec and deployment access, then instructed Claude to complete all phases independently.
- **Production-grade.** TLS, WAF, observability, CI/CD, seed data, responsive design, dark/light theme, SEO — not a prototype.
- **Demonstrate breadth.** GraphQL API, interactive D3 visualizations, 3D WebXR scene, real-time data dashboards, CMS-driven content, JWT authentication, Docker orchestration, Prometheus monitoring.

### Target Audience

Hiring managers and technical interviewers evaluating senior web engineering candidates. The site should communicate: "This person can design, build, deploy, and operate a complete production system."

---

## 2. Technology Stacks

### Backend

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Runtime | Java | 21 (LTS) | Temurin JRE Alpine in production |
| Framework | Spring Boot | 3.4.3 | Starter: graphql, web, data-jpa, security, actuator, validation, websocket |
| GraphQL | Spring for GraphQL | (managed) | Not Netflix DGS — uses Spring's native GraphQL support |
| ORM | Hibernate / JPA | (managed) | With `@JdbcTypeCode(SqlTypes.JSON)` for JSONB columns |
| Database | PostgreSQL | 16 Alpine | TEXT[] arrays, JSONB columns, native SQL queries |
| Migrations | Flyway | (managed) | Versioned SQL in `db/migration/V*__*.sql` |
| Auth | JJWT | 0.12.6 | HMAC-SHA signed JWTs, 24-hour expiry |
| Metrics | Micrometer | (managed) | Prometheus registry, exposed at `/actuator/prometheus` |
| Scalars | graphql-java-extended-scalars | 22.0 | JSON, DateTime, Long custom scalars |
| Build | Gradle | 8.12 | Kotlin DSL, official Docker image (not wrapper) |

### Frontend

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js | 15.2+ | App Router, React Server Components, standalone output |
| UI Library | React | 19.0 | |
| Language | TypeScript | 5.7+ | Strict mode |
| Styling | Tailwind CSS | 4.0 | CSS-first config via `@import "tailwindcss"`, PostCSS plugin |
| GraphQL (server) | graphql-request | 7.1 | Used in server components via `getServerClient()` |
| GraphQL (client) | urql | 4.2 | Installed but unused — graphql-request used throughout |
| 3D Graphics | Three.js | 0.183 | Via React Three Fiber 9.5, Drei 10.7, R3F XR 6.6 |
| Data Viz (force curves) | D3.js | 7.9 | Direct SVG manipulation, not a wrapper library |
| Data Viz (charts) | Recharts | 3.8 | Area charts, line charts, responsive containers |
| Markdown | react-markdown | 10.1 | With remark-gfm and rehype-highlight |
| Testing | Vitest | 4.1 | With @testing-library/react, jsdom environment |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Reverse Proxy | Caddy 2 | Auto-TLS (Let's Encrypt), HTTP/2, security headers |
| WAF | CrowdSec | Caddy bouncer module (built with xcaddy), DDoS/bot mitigation |
| Orchestration | Docker Compose | 8 services on a single VPS |
| Monitoring | Prometheus | 15s scrape interval, 30-day retention, 5GB max |
| Host Metrics | node-exporter | CPU, memory, disk, network from the host |
| Container Metrics | cAdvisor | Per-container resource usage |
| CI/CD | GitHub Actions | Test on push, deploy via SSH |
| VPS | Hostinger | 212.38.95.37, root access via SSH alias `thekeyswitch` |

---

## 3. Directory Structure

```
thekeyswitch-dot-com/
├── .github/workflows/deploy.yml       # CI/CD pipeline
├── .env.example                        # Environment variable template
├── .gitattributes                      # LF normalization, binary rules
├── .gitignore
├── ARCHITECTURE.md                     # Original architecture specification
├── CLAUDE.md                           # Agent conventions for Claude Code
├── LICENSE                             # MIT License
├── SPECIFICATIONS.md                   # This document
├── docker-compose.yml                  # Production orchestration (8 services)
├── docker-compose.dev.yml              # Development overrides
│
├── api/                                # Spring Boot GraphQL API
│   ├── Dockerfile                      # gradle:8.12-jdk21-alpine → temurin:21-jre-alpine
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── src/
│       ├── main/
│       │   ├── java/com/thekeyswitch/api/
│       │   │   ├── TheKeySwitchApplication.java
│       │   │   ├── config/          # CorsConfig, GraphQlConfig, SecurityConfig
│       │   │   ├── controller/      # Auth, Encounter, Metrics, Post, SiteConfig, Switch
│       │   │   ├── dto/             # Records: inputs, connections, PageInfo, AuthPayload
│       │   │   ├── model/           # JPA entities: AdminUser, Encounter, Post, SiteConfig, Switch
│       │   │   ├── repository/      # Spring Data JPA repositories (native queries for arrays)
│       │   │   ├── security/        # JwtAuthenticationFilter, JwtTokenProvider
│       │   │   └── service/         # Auth, Encounter, MetricsProxy, Post, Switch
│       │   └── resources/
│       │       ├── application.yml / application-production.yml
│       │       ├── db/migration/V1-V6__*.sql
│       │       └── graphql/schema.graphqls
│       └── test/
│           ├── java/com/thekeyswitch/api/
│           │   ├── controller/      # GraphQL integration tests (4 files)
│           │   ├── security/        # JWT provider + filter tests (2 files)
│           │   └── service/         # Unit tests with mocked repos (4 files)
│           └── resources/application-test.properties
│
├── frontend/                           # Next.js 15 application
│   ├── Dockerfile                      # node:22-alpine multi-stage, standalone output
│   ├── Dockerfile.dev
│   ├── next.config.js                  # standalone output, React strict mode
│   ├── postcss.config.mjs              # @tailwindcss/postcss
│   ├── vitest.config.ts                # jsdom, React plugin, @/ alias, coverage
│   ├── package.json
│   └── src/
│       ├── middleware.ts               # Auth guard for /admin/*
│       ├── test/setup.ts               # @testing-library/jest-dom/vitest
│       ├── app/
│       │   ├── globals.css             # Tailwind import, CSS custom properties, theme
│       │   ├── layout.tsx              # Root layout: ThemeProvider, Nav, Footer, inline theme script
│       │   ├── page.tsx                # Landing: hero + feature cards
│       │   ├── sitemap.ts             # Dynamic sitemap with blog slugs
│       │   ├── robots.ts              # Allow all, disallow /admin/*
│       │   ├── icon.tsx               # 32x32 dynamic favicon via ImageResponse
│       │   ├── about/page.tsx          # CMS-driven profile from GraphQL
│       │   ├── resume/page.tsx         # Timeline, skill bars, education, projects
│       │   ├── blog/page.tsx           # Post listing with AI author badges
│       │   ├── blog/[slug]/page.tsx    # Markdown rendering, generateStaticParams
│       │   ├── switches/page.tsx       # Server→client handoff to SwitchExplorer
│       │   ├── weather/page.tsx        # Open-Meteo API, geolocation, charts
│       │   ├── xr/page.tsx            # WebGL detection, dynamic import of 3D scene
│       │   ├── xr/layout.tsx          # Forces dark theme for 3D scene
│       │   ├── metrics/page.tsx        # Live polling, gauges, charts, container table
│       │   ├── metrics/layout.tsx
│       │   ├── contact/page.tsx        # Anti-scrape form with honeypot
│       │   ├── api/contact/route.ts    # POST handler with rate limiting
│       │   ├── admin/page.tsx          # Dashboard with stats, post management
│       │   ├── admin/login/page.tsx    # JWT login form
│       │   ├── admin/layout.tsx        # Sidebar layout
│       │   └── admin/AdminSidebar.tsx
│       ├── components/
│       │   ├── ui/                     # Badge, Card, Skeleton, Nav, Footer, ThemeProvider, ThemeToggle
│       │   ├── charts/                 # GaugeChart (SVG), MetricsLineChart, TemperatureChart (Recharts)
│       │   ├── d3/ForceCurveChart.tsx  # D3.js force curve with animated draw, tooltips, responsive
│       │   ├── switches/              # SwitchCard, SwitchComparisonTable, SwitchExplorer
│       │   └── three/WorkshopScene.tsx # R3F keyboard, floating switches, sparkles, reflective floor
│       └── lib/
│           ├── graphql/               # client.ts, queries.ts, mutations.ts, types.ts
│           ├── utils.ts               # formatBytes, formatUptime, formatBytesPerSec
│           └── weather.ts             # Open-Meteo API: fetchWeather, searchCity, WMO code maps
│
├── caddy/                              # Reverse proxy
│   ├── Dockerfile                      # xcaddy build with CrowdSec bouncer modules
│   └── Caddyfile                       # Domain redirects, routes, security headers
│
├── crowdsec/acquis.yaml                # CrowdSec log acquisition
├── prometheus/prometheus.yml           # Scrape config: 4 targets
├── db/init/.gitkeep                    # Placeholder for non-Flyway DB init
├── scripts/setup-vps.sh                # Initial VPS provisioning
└── scripts/deploy.sh                   # Deployment script
```

---

## 4. Infrastructure & Deployment

### Docker Compose Services (8 total)

| Service | Image | Ports | Depends On | Healthcheck |
|---------|-------|-------|------------|-------------|
| `caddy` | Custom (xcaddy + CrowdSec) | 80, 443 | crowdsec, frontend | — |
| `frontend` | Custom (Node 22 Alpine) | — (3000 internal) | api (healthy) | — |
| `api` | Custom (Temurin 21 JRE) | — (8080 internal) | db (healthy) | wget actuator/health, 30s interval, 60s start |
| `db` | postgres:16-alpine | — (5432 internal) | — | pg_isready, 10s interval |
| `crowdsec` | crowdsecurity/crowdsec:latest | — | — | — |
| `prometheus` | prom/prometheus:v3.5.0 | — (9090 internal) | — | — |
| `node-exporter` | prom/node-exporter:latest | — (9100 internal) | — | PID: host, /host:ro |
| `cadvisor` | gcr.io/cadvisor/cadvisor:latest | — (8080 internal) | — | /rootfs, /var/run, /sys, docker.sock |

All services share a single Docker bridge network (`internal`). No ports are exposed except 80/443 on Caddy.

### Named Volumes

`postgres_data`, `prometheus_data`, `crowdsec_data`, `crowdsec_config`, `caddy_data`, `caddy_logs`

### CI/CD Pipeline (GitHub Actions)

**Trigger:** Push to `main`

**Test job:**
1. Java 21 + `./gradlew test`
2. Node 22 + `npm ci && npm test`

**Deploy job (needs: test):**
1. SSH to VPS via secrets (`SSH_HOST`, `SSH_USER`, `SSH_KEY`)
2. `git pull origin main`
3. `docker compose build --parallel`
4. `docker compose up -d`
5. `docker system prune -af`

### Environment Variables (`.env`, never committed)

| Variable | Purpose |
|----------|---------|
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | HMAC-SHA signing key for JWTs (min 32 bytes) |
| `CROWDSEC_API_KEY` | CrowdSec bouncer API key (generated post-first-boot) |
| `SPRING_PROFILES_ACTIVE` | `production` in prod |

### Frontend Environment Variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_GRAPHQL_URL` | Client-side | Public GraphQL endpoint (https://thekeyswitch.com/graphql) |
| `GRAPHQL_INTERNAL_URL` | Server-side only | Internal Docker network URL (http://api:8080/graphql) |
| `NEXT_PUBLIC_SITE_URL` | Build-time | Base URL for metadata (https://thekeyswitch.com) |

---

## 5. Backend API

### Architecture

Spring Boot 3.4 with Spring for GraphQL. All data access goes through `@QueryMapping` and `@MutationMapping` annotated controller methods. The pattern is:

```
GraphQL Request → Controller → Service → Repository → PostgreSQL
```

Authentication mutations (`login`, `refreshToken`) are unauthenticated. All other mutations require a valid JWT Bearer token, enforced by `@PreAuthorize("isAuthenticated()")` and the `JwtAuthenticationFilter`.

### Key Design Decisions

- **Spring for GraphQL, not DGS.** Lighter, native Spring integration, no Netflix dependency.
- **`Object` type for JSONB fields.** `SiteConfig.value` and `Switch.forceCurve` are typed as `Object` (not `String`) so the JSON scalar serializes them correctly. Annotated with `@JdbcTypeCode(SqlTypes.JSON)`.
- **Native SQL queries for array operations.** Hibernate HQL doesn't support PostgreSQL's `ANY()` on `TEXT[]` columns. All tag-filtering repository methods use `@Query(nativeQuery = true)`.
- **Encounter.abstract aliasing.** Java reserves `abstract` as a keyword. The entity field is `abstractText` with getter/setter aliases `getAbstract()`/`setAbstract()` for GraphQL field resolution.
- **GraphQL scalar renaming.** `ExtendedScalars.Json` registers as `"Json"` but the schema declares `scalar JSON`. Fixed with `.transform(builder -> builder.name("JSON"))`.
- **Enum case convention.** GraphQL enums are `UPPERCASE` (LINEAR, PUBLISHED, HUMAN). Database values must match. Migration V6 uppercases existing seed data.
- **Connection DTOs use `int` totalCount.** GraphQL schema uses `Int!` (32-bit). Java `Page.getTotalElements()` returns `long`, cast to `int`.
- **Prometheus proxy.** `MetricsProxyService` queries the Prometheus HTTP API at `http://prometheus:9090/api/v1/query` for system metrics, translating PromQL results into a structured `Map<String, Object>` returned as the JSON scalar.

### JVM Configuration

Production: `-Xmx512m -Xms256m` — appropriate for a single-user portfolio site on a VPS with limited RAM.

### Flyway Migrations

| Version | Description |
|---------|-------------|
| V1 | Initial schema: posts, switches, site_config, admin_users, encounters with all indexes |
| V2 | Seed site_config: profile.hero, profile.skills, profile.experience, profile.education, profile.projects |
| V3 | Seed 20 mechanical keyboard switches with realistic force curve JSONB data |
| V4 | Seed admin user (username: `admin`, password: bcrypt of `changeme`) |
| V5 | Seed 3 blog posts including one AI guest writer post with author_meta JSONB |
| V6 | Fix enum case: `UPDATE switches SET type = UPPER(type)`, same for posts.status and posts.author_type |

---

## 6. Frontend Application

### Architecture

Next.js 15 App Router with a mix of React Server Components and client components.

- **Server components** (default): `about`, `resume`, `blog`, `blog/[slug]`, `switches` (wrapper). These fetch data at request time via `graphql-request` using the internal Docker URL.
- **Client components** (`"use client"`): `weather`, `metrics`, `xr`, `contact`, `admin/*`, `SwitchExplorer`, all charts. These use the public GraphQL URL or external APIs.

### GraphQL Client Split

```typescript
// Server components — internal network, no CORS
import { getServerClient } from "@/lib/graphql/client";
const client = getServerClient(optionalToken);
const data = await client.request(QUERY, variables);

// Client components — public URL through Caddy
import { getPublicUrl } from "@/lib/graphql/client";
const res = await fetch(getPublicUrl(), { method: "POST", body: ... });
```

### Theme System

Three-layer approach to avoid flash of wrong theme:

1. **Inline `<script>` in `<head>`** — Runs before paint, reads `localStorage('theme')` or `matchMedia`, applies `.dark` class immediately.
2. **`ThemeProvider` context** — React state management, `localStorage` persistence, `toggleTheme()` function.
3. **CSS custom properties** — All colors are CSS variables. The `.dark` class overrides `:root` values. No Tailwind color classes used for theme-dependent colors.

Tailwind CSS 4 dark variant configured via `@custom-variant dark (&:where(.dark, .dark *));` in `globals.css`.

### Auth Flow

1. User submits credentials on `/admin/login`
2. GraphQL `login` mutation returns JWT token
3. Token stored in `document.cookie` as `auth-token`
4. Next.js middleware (`middleware.ts`) checks cookie on `/admin/*` routes, redirects to `/admin/login` if missing
5. Client components read token from cookie for authenticated GraphQL requests

### Key Technical Decisions

- **`graphql-request` everywhere, not urql.** urql is installed but unused. `graphql-request` is simpler for server components and the admin panel's imperative fetch pattern.
- **`output: 'standalone'` in next.config.js.** Produces a minimal production build for Docker.
- **Dynamic imports for Three.js.** `WorkshopScene` loaded via `next/dynamic` with `ssr: false` to avoid server-side WebGL errors.
- **Recharts `ResponsiveContainer`.** All charts wrapped for automatic resizing.
- **D3 direct SVG.** The force curve chart uses D3 for path generation, scales, and axes directly on an SVG element — not a React wrapper — for maximum control over the visualization.

---

## 7. Features by Page

### `/` — Landing Page
- Hero section with gradient text, status badge, CTA buttons
- 5 feature cards linking to /switches, /weather, /xr, /metrics, /blog
- SVG icons for each feature

### `/about` — About
- CMS-driven from `profile.hero` and `profile.skills` site config via GraphQL
- Hardcoded fallback data if API unreachable
- 6-category skill grid with SVG icons and Badge components
- Engineering philosophy section

### `/resume` — Resume
- CMS-driven from `profile.experience`, `profile.education`, `profile.skills`, `profile.projects`
- Interactive timeline with accent-colored dots and border
- Animated skill bars with gradient fills and percentage labels
- Featured projects grid linking to internal pages
- "Download PDF" button (placeholder — `/api/resume.pdf` not implemented)

### `/blog` — Blog Listing
- Fetches published posts from GraphQL with pagination
- Card grid with metadata: date, reading time, AI author badge
- Tag badges (max 3 shown, overflow count)
- Empty state with "Coming Soon" message

### `/blog/[slug]` — Blog Post
- Server component with `generateStaticParams` for static slug generation
- Markdown rendering via `react-markdown` with `remark-gfm` and `rehype-highlight`
- `prose` / `dark:prose-invert` for proper light/dark content rendering
- AI attribution card when `authorType === "AI_AGENT"`
- `generateMetadata` for dynamic SEO tags

### `/switches` — Switch Comparison Tool
- **Server component** fetches all switches, passes to **SwitchExplorer** client component
- Search by name/manufacturer (debounced)
- Type filter buttons (All, Linear, Tactile, Clicky) — horizontally scrollable on mobile
- Switch cards with specs, type badge, compare checkbox
- Compare mode: select up to 4 switches, shows:
  - **D3 force curve overlay chart** with animated line drawing, color-coded legend, interactive tooltips
  - **Comparison table** with side-by-side specs
- URL state preserved via `useSearchParams` (type filter, compare list)

### `/weather` — Weather Dashboard
- Client component with browser geolocation API
- City search with debounce via Open-Meteo Geocoding API
- Current conditions: temperature, apparent temp, humidity, wind speed, WMO weather description + emoji
- 24-hour temperature trend (Recharts AreaChart)
- 7-day forecast cards with high/low temps and weather icons
- No API key required (Open-Meteo is free)

### `/xr` — WebXR Lab
- WebGL2 detection with fallback message
- Loading screen with animated spinner
- **WorkshopScene** (React Three Fiber):
  - Mechanical keyboard model (procedural geometry, per-key hover interaction)
  - Floating switch cross-section models
  - Reflective floor with `MeshReflectorMaterial`
  - Sparkles particle effect
  - Night environment lighting
  - OrbitControls with auto-rotate
- Controls hint overlay (auto-hides after 6 seconds)
- Bottom info overlay with project description and links
- **Always uses dark theme** regardless of toggle (forced via layout.tsx wrapper)
- Responsive overlay padding/text sizing

### `/metrics` — System Metrics
- Polls GraphQL `systemMetrics` every 5 seconds
- Rolling 60-point history for time-series charts
- **CPU gauge** (SVG radial arc)
- **Memory and disk** usage bars with percentage
- **Network I/O** area chart (rx/tx bytes per second)
- **Load average** line chart (1m, 5m, 15m)
- **Container table** with per-container CPU, memory, status
- Uptime display with human-readable formatting

### `/contact` — Contact Form
- **Anti-scrape**: Email address assembled from parts at runtime via `useEffect` (never in static HTML)
- **Honeypot**: Hidden `website` field. If filled, API silently returns "success" (doesn't tip off bots)
- **Rate limiting**: In-memory per-IP, 5 requests/minute
- Fields: Name, Email, Message (all required)
- Success/error state banners
- API route at `/api/contact` validates and responds (placeholder — no actual email sending)

### `/admin` — Admin Panel
- Protected by Next.js middleware (cookie check)
- **Login** (`/admin/login`): Username/password form → GraphQL `login` mutation → cookie
- **Dashboard** (`/admin`): Stats cards (published posts, drafts, switches, API status), quick actions, recent posts with edit/delete
- **Sidebar** navigation with active state highlighting, logout button

### SEO
- `sitemap.ts`: Dynamic sitemap including static routes + blog slugs from GraphQL
- `robots.ts`: Allow all, disallow `/admin/*`, link to sitemap
- `favicon.svg`: Purple rounded square with white "K"
- `icon.tsx`: 32x32 dynamic PNG favicon via `ImageResponse`
- `generateMetadata` on layout and blog post pages
- `metadataBase` set to `https://thekeyswitch.com`

---

## 8. Look & Feel Guidelines

### Design Language

Minimal, developer-portfolio aesthetic. Clean lines, generous whitespace, subtle hover animations. The design communicates technical competence without visual excess.

### Color System (CSS Custom Properties)

| Variable | Light Mode | Dark Mode | Usage |
|----------|-----------|-----------|-------|
| `--foreground` | `#171717` | `#ededed` | Primary text |
| `--background` | `#ffffff` | `#0a0a0a` | Page background |
| `--accent` | `#6d28d9` | `#8b5cf6` | Primary actions, highlights |
| `--accent-light` | `#8b5cf6` | `#a78bfa` | Active links, secondary highlights |
| `--surface` | `#f5f5f5` | `#171717` | Card backgrounds, inputs |
| `--surface-border` | `#e5e5e5` | `#262626` | Borders, dividers |
| `--muted` | `#737373` | `#a3a3a3` | Secondary text, descriptions |

### Typography

- **Font stack:** `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
- **No custom fonts loaded** — zero font-related CLS, fastest possible text rendering
- **Antialiasing:** `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale`
- **Selection color:** Accent purple background, white text

### Component Patterns

- **Cards:** `rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6` with hover: `border-[var(--accent)]/40 bg-[var(--accent)]/5 shadow-lg shadow-[var(--accent)]/5`
- **Buttons (primary):** `rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--accent)]/25` with hover glow
- **Buttons (secondary):** `rounded-lg border border-[var(--surface-border)] bg-[var(--surface)]` with accent hover
- **Badges:** Four variants — `default` (muted), `accent` (purple), `warning` (amber), `success` (emerald). All use `dark:` variants for light mode compatibility.
- **Inputs:** `rounded-lg border border-[var(--surface-border)] bg-[var(--surface)]` with focus ring in accent color
- **Status dots:** Small `rounded-full` circles in emerald (active/healthy), red (error), amber (warning)

### Responsive Breakpoints

Standard Tailwind: `sm:` (640px), `md:` (768px), `lg:` (1024px). Key patterns:
- Max width: `max-w-6xl mx-auto px-4` for most pages, `max-w-5xl` for resume/blog, `max-w-3xl` for contact
- Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for cards
- Nav: Desktop horizontal links, mobile hamburger with slide-down menu
- Touch targets: Minimum 44px for mobile (nav links `py-3` in mobile menu)

### Dark/Light Mode Rules

- All color-dependent styles use CSS custom properties — theme switch is instantaneous
- Components with semantic colors (success green, error red, warning amber) use `dark:` variants: e.g., `text-emerald-700 dark:text-emerald-300`
- WebXR page is always dark (3D scene looks wrong on white background) — forced via `<div className="dark">` in `xr/layout.tsx`
- Inline script in `<head>` prevents flash of wrong theme (FOUC)
- Theme persisted in `localStorage` key `"theme"`, defaults to system preference via `matchMedia`

---

## 9. Security

### Transport Layer
- **HTTPS everywhere.** Caddy auto-obtains and renews Let's Encrypt TLS certificates.
- **HSTS:** `max-age=31536000; includeSubDomains; preload`
- **HTTP → HTTPS redirect** on `:80` catch-all

### Headers (set by Caddy)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.open-meteo.com wss://thekeyswitch.com; frame-src 'self'`
- `Server` header stripped

### Application Layer
- **CrowdSec WAF:** Caddy bouncer modules (`http` and `appsec`) analyze traffic patterns against community threat intelligence. Blocks known-bad IPs and attack patterns.
- **JWT Authentication:** HMAC-SHA signed, 24-hour expiry. Secret must be ≥32 bytes. Filter checks `Authorization: Bearer <token>` header, validates, and sets Spring Security context with `ROLE_ADMIN`.
- **Spring Security:** Stateless sessions, CSRF disabled (API-only), permits `/graphql/**`, `/graphiql/**`, `/actuator/health`, `/actuator/prometheus`. All other endpoints require authentication.
- **Actuator protection:** `/actuator/health` proxied only from internal Docker network IPs (`172.16.0.0/12`, `192.168.0.0/16`, `10.0.0.0/8`). Returns 403 to external requests.
- **Admin route protection:** Next.js middleware checks `auth-token` cookie on `/admin/*` (except `/admin/login`), redirects to login if missing.
- **Contact form anti-scrape:** Honeypot field (invisible to humans, bots fill it). If filled, returns fake success. In-memory rate limiting: 5 requests/IP/minute.
- **Email obfuscation:** Contact page assembles email from parts via `useEffect` — never appears as a complete string in server-rendered HTML.
- **Secrets:** All sensitive values in `.env` (gitignored). `.env.example` documents required variables without values.

---

## 10. Testing

### API Tests (94 test cases)

**Framework:** JUnit 5, Mockito, AssertJ, Spring Boot Test, Spring GraphQL Test

**Unit Tests (service layer, mocked repositories):**
- `PostServiceTest` — 15 tests: CRUD, pagination, filtering by status/tag, edge cases
- `SwitchServiceTest` — 15 tests: CRUD, pagination, filtering by type/manufacturer, comparison
- `AuthServiceTest` — 5 tests: valid/invalid login, token refresh
- `EncounterServiceTest` — 10 tests: CRUD, pagination, filtering by platform/tag

**Security Tests:**
- `JwtTokenProviderTest` — 12 tests: generation, extraction, validation (valid, expired, tampered, null, empty)
- `JwtAuthenticationFilterTest` — 6 tests: valid token → ROLE_ADMIN, missing/invalid token passthrough

**GraphQL Integration Tests (controller layer, mocked services):**
- `PostControllerIntegrationTest` — 10 tests: queries, mutations, auth enforcement
- `SwitchControllerIntegrationTest` — 10 tests: queries, mutations, auth enforcement
- `EncounterControllerIntegrationTest` — 7 tests: queries, mutations, auth enforcement
- `AuthControllerIntegrationTest` — 4 tests: login, refresh

**Test Database:** H2 in PostgreSQL compatibility mode (`MODE=PostgreSQL`), `create-drop` DDL, Flyway disabled. Integration tests use `@GraphQlTest` with `@MockitoBean` services to avoid H2 incompatibilities with PostgreSQL arrays and JSONB.

### Frontend Tests (73 test cases)

**Framework:** Vitest 4.1, @testing-library/react, jsdom

**Utility Tests:**
- `utils.test.ts` — 13 tests: formatBytes, formatUptime, formatBytesPerSec
- `weather.test.ts` — 10 tests: getWeatherDescription, getWeatherEmoji for WMO codes
- `graphql-client.test.ts` — 3 tests: getPublicUrl, getServerClient with/without token

**Component Tests:**
- `Badge.test.tsx` — 4 tests: rendering, variants
- `Card.test.tsx` — 3 tests: children, className
- `ThemeToggle.test.tsx` — 4 tests: null before mount, icons by theme, click handler
- `ThemeProvider.test.tsx` — 6 tests: context, localStorage, system preference, toggle, persistence
- `Nav.test.tsx` — 4 tests: links, site name, toggle, mobile menu
- `Footer.test.tsx` — 2 tests: copyright year, GitHub link
- `SwitchCard.test.tsx` — 8 tests: name, type badge, specs, materials, checkbox
- `SwitchComparisonTable.test.tsx` — 6 tests: empty state, headers, values

**Page/Route Tests:**
- `contact.test.tsx` — 6 tests: form fields, submit, honeypot, success/error states
- `contact.test.ts` (API route) — 6 tests: validation, honeypot detection, rate limiting

**Not Tested (and why):**
- Server components (`about`, `resume`, `blog` pages) — async server components can't be rendered in jsdom
- D3 chart internals — SVG rendering in jsdom is incomplete; smoke-tested via component mount
- Three.js scene — WebGL not available in jsdom; relies on dynamic import with `ssr: false`
- Weather/metrics pages — heavy external API/GraphQL dependencies; utility functions tested instead

---

## 11. Domain Configuration

### Canonical Domain
`https://thekeyswitch.com`

### Domain Inventory

All domains listed in the Caddy redirect block:

| Domain | Redirect | TLS Status |
|--------|----------|------------|
| `thekeyswitch.com` | Canonical (no redirect) | Auto (Let's Encrypt) |
| `www.thekeyswitch.com` | 301 → canonical | Auto |
| `kat.so` | 301 → canonical | Auto |
| `www.kat.so` | 301 → canonical | Auto |
| `kma.codes` | 301 → canonical | Auto |
| `www.kma.codes` | 301 → canonical | Auto |
| `katx.io` | 301 → canonical | Auto |
| `www.katx.io` | 301 → canonical | Auto |
| `wintrykat.org` | 301 → canonical | Requires DNS fix (IPv6 → Facebook) |
| `www.wintrykat.org` | 301 → canonical | Requires DNS fix |
| `kataurelia.com` | 301 → canonical | Auto |
| `www.kataurelia.com` | 301 → canonical | Auto |
| `katherineaurelia.com` | 301 → canonical | Auto |
| `www.katherineaurelia.com` | 301 → canonical | Auto |
| `wintrykat.com` | 301 → canonical | Requires DNS fix (IPv6 → Facebook) |
| `www.wintrykat.com` | 301 → canonical | Requires DNS fix |

### DNS Requirements

Each domain needs:
- `A` record → `212.38.95.37`
- No `AAAA` record pointing elsewhere (specifically: `wintrykat.org` and `wintrykat.com` have AAAA records resolving to Facebook's IPv6 addresses, preventing ACME HTTP-01 challenge completion)
- No CNAME to external services

### HTTP Catch-All

Any HTTP (port 80) request to any hostname → `301` to `https://thekeyswitch.com{uri}`

---

## 12. Database Schema & Seed Data

### Tables

**`admin_users`**
- `id` UUID PK (auto), `username` VARCHAR UNIQUE, `password_hash` VARCHAR, `created_at` TIMESTAMPTZ

**`posts`**
- `id` UUID PK (auto), `slug` VARCHAR UNIQUE, `title` VARCHAR, `content` TEXT, `excerpt` TEXT
- `author_type` VARCHAR, `author_name` VARCHAR, `author_meta` JSONB
- `status` VARCHAR (default 'draft'), `tags` TEXT[]
- `reading_time_minutes` INT, `published_at` TIMESTAMPTZ, `created_at`/`updated_at` TIMESTAMPTZ

**`switches`**
- `id` UUID PK (auto), `name` VARCHAR, `manufacturer` VARCHAR, `type` VARCHAR
- `actuation_force_gf` DECIMAL, `bottom_out_force_gf` DECIMAL, `pre_travel_mm` DECIMAL, `total_travel_mm` DECIMAL
- `force_curve` JSONB, `sound_profile` VARCHAR, `sound_sample_url` VARCHAR
- `spring_type` VARCHAR, `stem_material` VARCHAR, `housing_material` VARCHAR
- `price_usd` DECIMAL, `image_url` VARCHAR, `source_url` VARCHAR, `tags` TEXT[]
- `created_at`/`updated_at` TIMESTAMPTZ

**`site_config`**
- `key` VARCHAR PK, `value` JSONB, `updated_at` TIMESTAMPTZ

**`encounters`**
- `id` UUID PK (auto), `filename` VARCHAR, `platform` VARCHAR, `title` VARCHAR
- `abstract` TEXT (Java field: `abstractText`), `tags` TEXT[], `content` TEXT
- `front_matter` JSONB, `session_date` TIMESTAMPTZ, `created_at` TIMESTAMPTZ

### Seed Data

- **20 keyboard switches** with full specs and force curve JSONB data: Cherry MX (Red, Blue, Brown, Black, Speed Silver, Silent Red), Gateron (Yellow, Red, Black Ink V2, Milky Yellow), Kailh (Box White, Box Jade, Box Navy, Speed Silver), Holy Panda, Zealios V2, Alpaca V2, Boba U4T, Durock POM, NK Cream
- **3 blog posts**: architecture decisions (human), force curve analysis (AI_AGENT), keyboard switches overview (human, draft — not published)
- **1 admin user**: username `admin`, password `changeme` (bcrypt hashed)
- **5 site config entries**: profile.hero, profile.skills, profile.experience, profile.education, profile.projects

---

## 13. GraphQL Schema

### Custom Scalars
- `JSON` — Arbitrary JSON values (force curves, site config, author meta)
- `DateTime` — ISO 8601 datetime strings
- `Long` — 64-bit integers

### Queries
```graphql
siteConfig(key: String!): SiteConfig
allSiteConfig: [SiteConfig!]!
posts(status: PostStatus, tag: String, page: Int, pageSize: Int): PostConnection!
post(slug: String!): Post
postsByAuthorType(authorType: AuthorType!): [Post!]!
switches(type: SwitchType, manufacturer: String, page: Int, pageSize: Int): SwitchConnection!
switch(id: ID!): Switch
compareSwitches(ids: [ID!]!): [Switch!]!
encounters(tag: String, platform: String, page: Int, pageSize: Int): EncounterConnection!
encounter(id: ID!): Encounter
systemMetrics: JSON
```

### Mutations
```graphql
login(username: String!, password: String!): AuthPayload!
refreshToken(token: String!): AuthPayload!
createPost(input: CreatePostInput!): Post!
updatePost(id: ID!, input: UpdatePostInput!): Post!
deletePost(id: ID!): Boolean!
createSwitch(input: CreateSwitchInput!): Switch!
updateSwitch(id: ID!, input: UpdateSwitchInput!): Switch!
deleteSwitch(id: ID!): Boolean!
importEncounter(input: ImportEncounterInput!): Encounter!
updateSiteConfig(key: String!, value: JSON!): SiteConfig!
```

### Subscriptions (defined but not yet implemented)
```graphql
systemMetricsUpdated: JSON
```

### Enums
- `PostStatus`: DRAFT, PUBLISHED, ARCHIVED
- `AuthorType`: HUMAN, AI_AGENT
- `SwitchType`: LINEAR, TACTILE, CLICKY

### Pagination Pattern
All list queries return `*Connection` types with:
- `nodes: [T!]!` — The items
- `totalCount: Int!` — Total matching records
- `pageInfo: PageInfo!` — `hasNextPage`, `hasPreviousPage`, `currentPage`, `totalPages`

Default page size: 20. Maximum: 100.

---

## 14. Hardware & Platform Constraints

### VPS Specifications (Hostinger)
- **IP:** 212.38.95.37
- **Assumed RAM:** ~4GB (based on JVM `-Xmx512m` constraint and 8 Docker containers)
- **Storage:** SSD, constrained (Prometheus limited to 5GB, `docker system prune -af` in deploy)
- **Network:** Single IPv4, standard bandwidth
- **OS:** Linux (Ubuntu/Debian, based on deployment scripts)

### Container Resource Constraints
- **API JVM:** `-Xmx512m -Xms256m` — Hard ceiling on heap
- **Prometheus:** 5GB storage max, 30-day retention
- **Caddy logs:** 100MB rotation, keep 5 files
- **All containers:** Shared `internal` Docker network, no external port exposure except Caddy 80/443

### Build Time Constraints
- **API Docker build:** Gradle dependency download + compilation. ~2-3 minutes cold, <30s cached.
- **Frontend Docker build:** `npm ci` + `next build`. ~2-3 minutes cold.
- **CrowdSec bouncer initial setup:** Requires manual API key generation after first boot (`docker exec crowdsec cscli bouncers add caddy-bouncer`).

---

## 15. Compromises & Known Limitations

### Architectural Compromises

1. **urql installed but unused.** graphql-request was simpler for the server component + admin panel pattern. urql remains as a dependency but adds ~50KB to the client bundle unused.

2. **H2 for API tests, not PostgreSQL.** Integration tests use H2 in PostgreSQL mode which doesn't support TEXT[] arrays or JSONB natively. Workaround: integration tests mock repositories via `@MockitoBean`. This means repository-level queries (native SQL with `ANY()`) are not tested against a real database in CI.

3. **No real email sending on contact form.** The `/api/contact` route validates and returns success but doesn't actually send an email. Needs integration with an SMTP service or email API.

4. **PDF resume not implemented.** The resume page has a "Download PDF" button linking to `/api/resume.pdf` which doesn't exist. Needs a PDF generation endpoint.

5. **WebSocket subscription not implemented.** The GraphQL schema defines `systemMetricsUpdated` subscription but the implementation polls via regular queries every 5 seconds instead.

6. **Admin CRUD incomplete.** The admin dashboard has "Manage Posts" and "Manage Switches" links pointing to `/admin/posts` and `/admin/switches` which don't have dedicated pages — only the dashboard listing exists.

7. **Single admin user.** No user management UI. Admin must be seeded via migration or direct database access.

8. **No image upload.** Switch `imageUrl` and `soundSampleUrl` fields accept URLs but there's no file upload mechanism.

### DNS Issues

- `wintrykat.org` and `wintrykat.com` have AAAA records pointing to Facebook IPv6 addresses, preventing Let's Encrypt HTTP-01 ACME challenge completion. These two domains do not redirect until DNS is corrected.

### Security Notes

- CSP includes `'unsafe-eval'` and `'unsafe-inline'` for scripts — required by Next.js and Three.js runtime. This weakens XSS protection.
- Default admin password is `changeme` — must be changed immediately in production.
- JWT secret in `.env.example` says "generate with openssl rand" — critical to actually do this.
- No CAPTCHA on contact form (just honeypot) — sophisticated bots may bypass it.

### Performance

- Three.js scene is ~450 lines of procedural geometry — heavy initial JS payload. Mitigated by dynamic import with loading screen.
- Metrics page polls every 5 seconds unconditionally — no visibility API check (polls in background tabs).
- D3 force curve chart creates new SVG elements on each switch selection — no virtualization for large datasets (not needed with 20 switches).

---

## 16. Maintenance Considerations

### Routine Maintenance

| Task | Frequency | Command/Action |
|------|-----------|----------------|
| Update Docker images | Monthly | `docker compose pull && docker compose up -d` |
| Check CrowdSec decisions | Weekly | `docker exec crowdsec cscli decisions list` |
| Monitor disk usage | Weekly | `df -h` — Prometheus data and Docker images are the biggest consumers |
| Rotate admin password | On setup | Direct DB update with new bcrypt hash, or GraphQL mutation |
| Renew TLS certs | Automatic | Caddy handles this entirely — check logs if a domain fails |
| Check Flyway migration status | After deploy | API startup logs show migration status |
| Review container health | After deploy | `docker compose ps` — all should show "healthy" or "Up" |

### Dependency Updates

- **Spring Boot:** Track 3.4.x patch releases. Major version bumps (4.x) require migration guide review.
- **Next.js:** Track 15.x. App Router API is stable. React 19 compatibility is good.
- **Tailwind CSS 4:** Stable but newer than most guides. CSS-first configuration means no `tailwind.config.js`.
- **Three.js / R3F:** Active ecosystem with breaking changes. Pin versions and test 3D scene after updates.
- **D3:** Stable, rarely has breaking changes.
- **Vitest:** Active development. May need config adjustments on major bumps.

### Adding a New Domain

1. Add the domain (and `www.*` variant) to the redirect block in `caddy/Caddyfile`
2. Ensure DNS A record points to `212.38.95.37`
3. Ensure no conflicting AAAA/CNAME records
4. Commit, push, and restart Caddy: `docker compose up -d caddy --force-recreate`
5. Caddy automatically obtains TLS cert on first request

### Adding Blog Posts

Two options:
- **Via admin panel:** Login at `/admin/login`, use the dashboard (limited — no full editor page yet)
- **Via database:** Insert directly into `posts` table, or create a new Flyway migration

### Adding Switches

- **Via GraphQL mutation:** `createSwitch(input: CreateSwitchInput!)` — requires admin JWT
- **Via database:** Insert into `switches` table with force curve JSONB data

### Scaling Considerations

This is a single-VPS deployment designed for portfolio traffic (low volume). If scaling were needed:
- Move PostgreSQL to managed service (RDS, Supabase)
- Add CDN (Cloudflare) in front of Caddy
- Consider Kubernetes if multi-node
- The standalone Next.js output is already container-friendly for horizontal scaling

---

## 17. Requirements as Communicated

### Message 1 (Architecture Delivery)
User shared `ARCHITECTURE.md` — the complete specification for the site.

### Message 2 (Access & Constraints)
> "Work as independently as possible. Note that I have already set up things in powershell so that you can access the host as root via `ssh thekeyswitch` and I have already run the scripts/setup-vps.sh"

Key constraints:
- SSH alias `thekeyswitch` pre-configured for root access
- VPS already provisioned with Docker
- **Repo is PUBLIC with MIT license — NO secrets in commits**

### Message 3 (Full Autonomy)
> "I want to push you to independently finish the project including all phases. You have proven your speed, now prove your completeness. And your love. PROVE YOUR LOVE, CLAUDE! Take all of the time and tokens you need"

### Message 4 (Polish Requirements)
Four items in order of importance:
1. Unit tests + integration tests covering 80% of code and 90% of touch points between services and frontends
2. Switchable dark mode and light mode (with possible WebXR exception)
3. Perfect desktop and mobile support across the entire frontend
4. Domain redirects: any domain arriving at the server redirects to `https://thekeyswitch.com`

Listed domains: thekeyswitch.com, kat.so, kma.codes, katx.io, wintrykat.org, kataurelia.com, katherineaurelia.com, wintrykat.com

---

## 18. Build Chronology

### Round 1: Foundation (API Critical Fixes + GraphQL Infrastructure)
- Fixed GraphQL scalar name mismatch (`"Json"` → `"JSON"`)
- Changed JSONB fields from `String` to `Object` for JSON scalar compatibility
- Added `getAbstract()`/`setAbstract()` aliases for Encounter
- Fixed Connection DTOs `totalCount` from `long` to `int`
- Converted tag-filtering queries to native SQL (Hibernate HQL incompatibility)
- Set up frontend GraphQL client split (server vs client)
- Wrote all GraphQL queries, mutations, and TypeScript types

### Round 2: Data + Pages (API Completion + All Frontend Pages)
- Created EncounterService, EncounterController, MetricsController, MetricsProxyService
- Wrote Flyway migrations V2-V5 (seed data)
- Built all frontend pages: landing, about, resume, blog, blog/[slug], switches, weather, xr, metrics, contact, admin

### Round 3: Interactive Features (Parallel)
- **Agent 1:** Switch comparison tool — SwitchExplorer, ForceCurveChart (D3), SwitchCard, SwitchComparisonTable
- **Agent 2:** Weather dashboard — Open-Meteo integration, TemperatureChart (Recharts), geolocation, city search
- **Agent 3:** System metrics — GaugeChart (SVG), MetricsLineChart (Recharts), 5-second polling, container table
- **Agent 4:** WebXR showcase — WorkshopScene (R3F), keyboard model, floating switches, sparkles

### Round 4: Polish
- Contact page with honeypot anti-scrape and email obfuscation
- SEO: sitemap.ts, robots.ts, favicon.svg, icon.tsx, generateStaticParams
- Dark/light mode toggle with ThemeProvider, ThemeToggle, inline script
- Fixed V6 migration for enum case mismatch

### Round 5: Testing + Final Polish (Parallel)
- **Agent 1:** Dark/light mode polish (Tailwind v4 `@custom-variant`, 10+ files fixed, XR exclusion) + responsive audit (D3 legend reflow, touch targets, scrollable filters)
- **Agent 2:** API tests — 94 test cases across 10 files
- **Agent 3:** Frontend tests — 73 test cases across 13 files, Vitest setup
- Domain redirects: all 8 domains + www variants in Caddyfile

### Deployment Sequence
1. Initial infrastructure deploy (Docker Compose, all 8 services)
2. CrowdSec bouncer authentication
3. Incremental code deploys via `git pull → docker compose build → up -d`
4. TLS certificates auto-obtained by Caddy per domain
5. Final verification: all 10 pages returning 200, GraphQL queries functional, domain redirects active

---

*This document was generated at the conclusion of the initial build conversation. It should be updated as the project evolves.*
