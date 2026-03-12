# thekeyswitch.com — Complete Architecture Specification

**Version:** 1.0.0
**Date:** 2026-03-12
**Author:** Kat (operator) + Claude (architect)
**Purpose:** Comprehensive architecture document for an agent (Claude Code) to independently build, configure, and deploy the entire site from a fresh VPS.

---

## Table of Contents

1. [Strategic Overview](#1-strategic-overview)
2. [Domain & Identity](#2-domain--identity)
3. [Infrastructure Layer](#3-infrastructure-layer)
4. [Security Layer](#4-security-layer)
5. [Database Layer](#5-database-layer)
6. [Backend API Layer](#6-backend-api-layer)
7. [Frontend Layer](#7-frontend-layer)
8. [Feature: Portfolio & Résumé](#8-feature-portfolio--résumé)
9. [Feature: Blog with AI Guest Writers](#9-feature-blog-with-ai-guest-writers)
10. [Feature: Keyboard Switch Comparison Tool](#10-feature-keyboard-switch-comparison-tool)
11. [Feature: Live Weather Dashboard](#11-feature-live-weather-dashboard)
12. [Feature: WebXR Showcase](#12-feature-webxr-showcase)
13. [Feature: Interactive System Metrics](#13-feature-interactive-system-metrics)
14. [Feature: Contact (Anti-Scrape)](#14-feature-contact-anti-scrape)
15. [Monitoring & Observability](#15-monitoring--observability)
16. [CI/CD & Deployment](#16-cicd--deployment)
17. [Technology Assessment Matrix](#17-technology-assessment-matrix)
18. [Resource Budget](#18-resource-budget)
19. [Repository Structure](#19-repository-structure)
20. [Implementation Roadmap](#20-implementation-roadmap)
21. [Agent Build Instructions](#21-agent-build-instructions)

---

## 1. Strategic Overview

### What This Is

A production portfolio website at `thekeyswitch.com` that serves as both a personal-professional web presence and a living demonstration of senior-level web engineering competence. This replaces the previously planned `kat.so` ecosystem entirely — all concepts (blog, lab, tools, portfolio) are consolidated into a single domain and deployment.

### What It Proves to Hiring Managers

The site demonstrates mastery across the full stack. The frontend is React/Next.js with App Router, server components, and interactive data visualizations. The backend is a Spring Boot (Java 21) GraphQL API — a deliberate choice to demonstrate enterprise Java fluency alongside the JavaScript ecosystem. The infrastructure is self-hosted on a VPS with Docker Compose, Caddy reverse proxy, CrowdSec WAF, and Prometheus-based observability. The content pipeline integrates AI agents transparently via encounter-kit.

Every technology choice maps directly to qualifications that appear on senior web engineering job descriptions. Where a choice was made for practical reasons that diverge from interview appeal, that reasoning is documented.

### Core Architectural Principles

The frontend never talks directly to the database. All data flows through the Spring Boot GraphQL API. The frontend is a Next.js application that consumes GraphQL for dynamic data and uses ISR/SSG for content pages. The API layer owns all business logic, validation, authentication, and data access. The database is PostgreSQL, chosen for its open-source license, GraphQL ecosystem compatibility, and ubiquity in job listings.

---

## 2. Domain & Identity

### Domain

`thekeyswitch.com` — registered, DNS managed via Hostinger. The mechanical keyboard connotation is intentional and will be leveraged by the Keyboard Switch Comparison Tool feature.

### Migration from kat.so

This is a full replacement. The `kat.so` domain and its subdomains (`blog.kat.so`, `api.kat.so`, etc.) are deprecated. Concepts from the prior planning (multi-framework blog, lab demos, encounter-kit integration) carry forward but are consolidated under the single `thekeyswitch.com` domain.

The multi-framework blog concept from `blog.kat.so` (Angular, Vue, Svelte, Flutter for Web alongside React) is **not** carried forward into this architecture. The rationale: this site's mission is to get hired, and spreading implementation effort across five frameworks dilutes the depth of each. The blog here is React/Next.js only, implemented deeply and well. The multi-framework concept can be revisited as a standalone demo linked from the portfolio after employment is secured.

### URL Structure

All features live under the single domain with path-based routing:

| Path | Feature |
|------|---------|
| `/` | Landing / portfolio hero |
| `/about` | Detailed profile, skills, experience |
| `/resume` | Interactive résumé with downloadable PDF |
| `/blog` | Blog listing |
| `/blog/[slug]` | Individual blog post |
| `/switches` | Keyboard switch comparison tool |
| `/weather` | Live weather dashboard |
| `/xr` | WebXR showcase |
| `/metrics` | Live system metrics dashboard |
| `/contact` | Anti-scrape contact page |
| `/admin` | CMS admin panel (authenticated) |

---

## 3. Infrastructure Layer

### Host Environment

| Property | Value |
|----------|-------|
| Provider | Hostinger |
| IP | 212.38.95.37 |
| Plan | KVM 2 |
| CPU | 2 vCPU cores |
| RAM | 8 GB |
| Storage | 100 GB SSD |
| OS | Ubuntu 24.04 LTS (clean install) |
| Backups | Provider weekly (Saturday), manual snapshots as needed |

### Why Docker Compose (Not Kubernetes)

Full Kubernetes requires a control plane (etcd, kube-apiserver, kube-scheduler, kube-controller-manager) that consumes approximately 2–3 GB RAM and a full CPU core on a single-node cluster. On a 2-core/8GB machine, that leaves almost nothing for actual workloads. Even K3s, the lightweight distribution, carries overhead that is unjustifiable for a single-node deployment with fewer than 10 services.

Docker Compose provides containerization, service orchestration, health checks, resource constraints, networking, and restart policies — which are the actual skills tested in infrastructure interviews. The honest interview answer is: "I chose Compose over Kubernetes because the resource profile of a single-node VPS doesn't justify the control plane overhead. That's an engineering judgment, not a capability gap."

**Appropriateness rating: 9/10** — Docker Compose is the right tool for this job. The missing point is that a Kubernetes deployment would be a stronger résumé signal, but running it poorly on inadequate hardware is worse than not running it at all.

### Caddy Reverse Proxy

Caddy serves as the edge layer, handling TLS termination (automatic Let's Encrypt), HTTP/2, reverse proxying to all backend services, static asset serving, and security headers. Caddy was specified in the requirements and is an excellent choice for this setup: zero-config HTTPS, minimal resource usage, and a clean configuration language.

Caddy will be built with the CrowdSec bouncer module using `xcaddy`. A custom Docker image is produced at build time.

**Caddyfile structure:**

```
{
    email kat@thekeyswitch.com
    crowdsec {
        api_url http://crowdsec:8080
        api_key {$CROWDSEC_API_KEY}
        ticker_interval 15s
    }
}

thekeyswitch.com {
    log {
        output file /var/log/caddy/access.log
        format json
    }

    route {
        crowdsec

        # API proxy
        handle /graphql* {
            reverse_proxy api:8080
        }

        # Prometheus metrics (internal only, blocked by CrowdSec + IP allowlist)
        handle /internal/metrics* {
            @allowed remote_ip 127.0.0.1 172.16.0.0/12
            respond @allowed 403
            reverse_proxy prometheus:9090
        }

        # Next.js application
        handle {
            reverse_proxy frontend:3000
        }
    }

    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
        Permissions-Policy "camera=(), microphone=(), geolocation=(self)"
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.open-meteo.com wss://thekeyswitch.com; frame-src 'self'"
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    }
}
```

**Appropriateness rating: 10/10** — Caddy is ideal for this use case. Automatic HTTPS, minimal configuration, low memory footprint, and first-class Docker support.

### Docker Compose Service Map

```yaml
services:
  caddy:          # Reverse proxy + TLS + WAF bouncer
  frontend:       # Next.js application
  api:            # Spring Boot GraphQL API
  db:             # PostgreSQL 16
  crowdsec:       # Security engine (log analysis + community blocklists)
  prometheus:     # Metrics collection
  node-exporter:  # Host-level metrics
  cadvisor:       # Container-level metrics
```

Total services: 8. Each is detailed in its respective section below.

---

## 4. Security Layer

### CrowdSec

CrowdSec is a free, open-source security automation tool that analyzes logs, detects attacks using behavior-based scenarios, and enforces decisions through bouncers. It also participates in a crowd-sourced IP reputation network — essentially a community-driven threat intelligence feed.

For this setup, CrowdSec performs three functions: it reads Caddy access logs and detects brute force, scanning, and other attack patterns. It receives community blocklist updates with known-bad IPs. It communicates decisions to the Caddy bouncer module, which blocks malicious requests before they reach the application.

The AppSec component adds WAF-like inspection of HTTP request bodies, catching SQL injection, XSS, and known CVE exploit patterns.

**Implementation:**

A custom Caddy Docker image is built using `xcaddy` with the CrowdSec bouncer modules:

```dockerfile
FROM caddy:2-builder AS builder
RUN xcaddy build \
    --with github.com/hslatman/caddy-crowdsec-bouncer/http@main \
    --with github.com/hslatman/caddy-crowdsec-bouncer/appsec@main

FROM caddy:2
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
```

CrowdSec runs as a separate container, reading Caddy's JSON access logs from a shared volume:

```yaml
crowdsec:
  image: crowdsecurity/crowdsec:latest
  restart: unless-stopped
  volumes:
    - ./crowdsec/acquis.yaml:/etc/crowdsec/acquis.yaml
    - ./caddy_logs:/var/log/caddy:ro
    - crowdsec_data:/var/lib/crowdsec/data
    - crowdsec_config:/etc/crowdsec
  environment:
    COLLECTIONS: "crowdsecurity/caddy crowdsecurity/http-cve crowdsecurity/base-http-scenarios"
  networks:
    - internal
```

**Appropriateness rating: 8/10** — CrowdSec is genuinely useful, free, and increasingly recognized in DevSecOps circles. It's not as universally known as Cloudflare WAF or AWS WAF, but it demonstrates security-consciousness and self-hosted operational skill. The community bouncer module for Caddy is well-maintained.

### Additional Security Measures

**Rate limiting:** Caddy's built-in rate limiting for the `/graphql` endpoint. Spring Boot's own rate limiting for mutations (write operations).

**CORS:** The API only accepts requests from `https://thekeyswitch.com`. During development, `http://localhost:3000` is also allowed.

**Authentication:** JWT-based authentication for the admin panel. Tokens issued by the Spring Boot API after credential verification against bcrypt-hashed passwords in PostgreSQL. No external auth provider needed for a single-admin site.

**Secrets management:** All secrets (database password, JWT signing key, CrowdSec API key) are stored in a `.env` file excluded from version control. Docker Compose reads them via `env_file` directives. For a single-VPS deployment, this is sufficient. In a team or multi-environment setup, you'd graduate to Vault or a cloud secrets manager.

---

## 5. Database Layer

### PostgreSQL 16

**Why PostgreSQL instead of MongoDB:**

MongoDB was mentioned as a candidate in the requirements. PostgreSQL is the override, for several reasons. PostgreSQL is genuinely open source (PostgreSQL License), while MongoDB uses the Server Side Public License (SSPL) which has licensing implications for service providers. PostgreSQL's JSONB column type provides document-store flexibility when needed, without sacrificing relational integrity for structured data. The GraphQL tooling ecosystem for PostgreSQL is substantially richer (PostGraphile, Hasura, Spring Data JPA). PostgreSQL appears on more job listings than MongoDB for backend/full-stack roles. PostgreSQL handles the diverse data shapes in this project (structured résumé data, semi-structured blog content, time-series metrics, relational switch comparison data) without requiring separate databases.

**Docker configuration:**

```yaml
db:
  image: postgres:16-alpine
  restart: unless-stopped
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./db/init:/docker-entrypoint-initdb.d
  environment:
    POSTGRES_DB: thekeyswitch
    POSTGRES_USER: ${DB_USER}
    POSTGRES_PASSWORD: ${DB_PASSWORD}
  networks:
    - internal
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d thekeyswitch"]
    interval: 10s
    timeout: 5s
    retries: 5
```

**Appropriateness rating: 10/10** — PostgreSQL is the correct choice for this project on every axis: licensing, capability, ecosystem, and hiring signal.

### Schema Overview

The schema uses a mix of relational tables and JSONB columns where flexibility is needed.

```sql
-- Core content
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_type VARCHAR(50) NOT NULL DEFAULT 'human',  -- 'human' | 'ai_agent'
    author_name VARCHAR(255) NOT NULL,
    author_meta JSONB,  -- agent platform, model, session info for AI authors
    status VARCHAR(20) NOT NULL DEFAULT 'draft',  -- 'draft' | 'published' | 'archived'
    tags TEXT[] NOT NULL DEFAULT '{}',
    reading_time_minutes INTEGER,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keyboard switches
CREATE TABLE switches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,  -- 'linear' | 'tactile' | 'clicky'
    actuation_force_gf NUMERIC(5,1),
    bottom_out_force_gf NUMERIC(5,1),
    pre_travel_mm NUMERIC(4,2),
    total_travel_mm NUMERIC(4,2),
    force_curve JSONB,  -- array of {distance_mm, force_gf} points for D3 plotting
    sound_profile VARCHAR(100),
    sound_sample_url VARCHAR(500),
    spring_type VARCHAR(100),
    stem_material VARCHAR(100),
    housing_material VARCHAR(100),
    price_usd NUMERIC(8,2),
    image_url VARCHAR(500),
    source_url VARCHAR(500),
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Site configuration and profile data
CREATE TABLE site_config (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin user(s)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Encounter documents (from encounter-kit, stored for blog integration)
CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(500) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    abstract TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    content TEXT NOT NULL,
    front_matter JSONB,
    session_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_switches_type ON switches(type);
CREATE INDEX idx_switches_manufacturer ON switches(manufacturer);
CREATE INDEX idx_switches_tags ON switches USING GIN(tags);
CREATE INDEX idx_encounters_tags ON encounters USING GIN(tags);
CREATE INDEX idx_encounters_platform ON encounters(platform);
```

---

## 6. Backend API Layer

### Spring Boot 3.x with Spring for GraphQL

**Why Spring Boot (Java) instead of Go or NestJS:**

This was a deliberate decision with eyes open about the tradeoffs. Spring Boot is the heaviest option in terms of memory usage (~400–800 MB at runtime) and startup time. On a 2-core/8GB VPS, that's a meaningful chunk of resources. However, the hiring signal is the strongest: Java/Spring remains the single most requested backend skill in enterprise job postings. Go is growing fast and would be a lighter footprint, but Spring Boot on a résumé opens more doors today.

The specific combination of Spring Boot + Spring for GraphQL (the official Spring project, not the archived third-party kickstart library) demonstrates awareness of the modern Spring ecosystem. Spring Data JPA provides the database abstraction. Spring Security handles JWT authentication. Spring Actuator provides health checks and metrics endpoints that Prometheus scrapes.

**Appropriateness rating: 7/10** — The rating reflects the resource tension. Spring Boot is the right career choice but an expensive one on this hardware. The implementation must be tuned: use `spring.jpa.open-in-view=false`, configure connection pool sizes conservatively (`spring.datasource.hikari.maximum-pool-size=5`), and set JVM heap limits explicitly (`-Xmx512m`). If the VPS starts running hot, the fallback plan is to swap to NestJS (TypeScript), which can do the same job in ~100 MB.

**Java version:** 21 LTS (latest long-term support).

**Build tool:** Gradle with Kotlin DSL. Maven is equally valid but Gradle is trending upward in job listings and is faster for incremental builds.

**Key dependencies:**

```kotlin
// build.gradle.kts
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-graphql")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    implementation("org.postgresql:postgresql")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")
    implementation("io.micrometer:micrometer-registry-prometheus")
}
```

**Docker configuration:**

```dockerfile
# Multi-stage build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY gradle/ gradle/
COPY gradlew build.gradle.kts settings.gradle.kts ./
RUN ./gradlew dependencies --no-daemon
COPY src/ src/
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx512m", "-Xms256m", "-jar", "app.jar"]
```

```yaml
api:
  build:
    context: ./api
    dockerfile: Dockerfile
  restart: unless-stopped
  environment:
    SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/thekeyswitch
    SPRING_DATASOURCE_USERNAME: ${DB_USER}
    SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
    JWT_SECRET: ${JWT_SECRET}
    SPRING_PROFILES_ACTIVE: production
  depends_on:
    db:
      condition: service_healthy
  networks:
    - internal
  healthcheck:
    test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/actuator/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### GraphQL Schema

```graphql
type Query {
    # Portfolio / Profile
    siteConfig(key: String!): SiteConfig
    allSiteConfig: [SiteConfig!]!

    # Blog
    posts(status: PostStatus, tag: String, page: Int, pageSize: Int): PostConnection!
    post(slug: String!): Post
    postsByAuthorType(authorType: AuthorType!): [Post!]!

    # Keyboard switches
    switches(type: SwitchType, manufacturer: String, page: Int, pageSize: Int): SwitchConnection!
    switch(id: ID!): Switch
    compareSwitches(ids: [ID!]!): [Switch!]!

    # Encounters
    encounters(tag: String, platform: String, page: Int, pageSize: Int): EncounterConnection!
    encounter(id: ID!): Encounter

    # System metrics (proxied from Prometheus)
    systemMetrics: SystemMetrics!
}

type Mutation {
    # Auth
    login(username: String!, password: String!): AuthPayload!
    refreshToken(token: String!): AuthPayload!

    # Blog (authenticated)
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!

    # Switches (authenticated)
    createSwitch(input: CreateSwitchInput!): Switch!
    updateSwitch(id: ID!, input: UpdateSwitchInput!): Switch!
    deleteSwitch(id: ID!): Boolean!

    # Encounters (authenticated)
    importEncounter(input: ImportEncounterInput!): Encounter!

    # Site config (authenticated)
    updateSiteConfig(key: String!, value: JSON!): SiteConfig!
}

type Subscription {
    # Live system metrics via WebSocket
    systemMetricsUpdated: SystemMetrics!
}

# Types
type Post {
    id: ID!
    slug: String!
    title: String!
    content: String!
    excerpt: String
    authorType: AuthorType!
    authorName: String!
    authorMeta: JSON
    status: PostStatus!
    tags: [String!]!
    readingTimeMinutes: Int
    publishedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
}

type Switch {
    id: ID!
    name: String!
    manufacturer: String!
    type: SwitchType!
    actuationForceGf: Float
    bottomOutForceGf: Float
    preTravelMm: Float
    totalTravelMm: Float
    forceCurve: JSON
    soundProfile: String
    soundSampleUrl: String
    springType: String
    stemMaterial: String
    housingMaterial: String
    priceUsd: Float
    imageUrl: String
    sourceUrl: String
    tags: [String!]!
}

type SystemMetrics {
    cpuUsagePercent: Float!
    memoryUsedBytes: Long!
    memoryTotalBytes: Long!
    diskUsedBytes: Long!
    diskTotalBytes: Long!
    uptimeSeconds: Long!
    loadAverage1m: Float!
    loadAverage5m: Float!
    loadAverage15m: Float!
    networkRxBytesPerSec: Float!
    networkTxBytesPerSec: Float!
    containerMetrics: [ContainerMetric!]!
    timestamp: DateTime!
}

type ContainerMetric {
    name: String!
    cpuPercent: Float!
    memoryUsedBytes: Long!
    memoryLimitBytes: Long!
    status: String!
}

enum PostStatus { DRAFT, PUBLISHED, ARCHIVED }
enum AuthorType { HUMAN, AI_AGENT }
enum SwitchType { LINEAR, TACTILE, CLICKY }

# Pagination
type PostConnection {
    nodes: [Post!]!
    totalCount: Int!
    pageInfo: PageInfo!
}

type SwitchConnection {
    nodes: [Switch!]!
    totalCount: Int!
    pageInfo: PageInfo!
}

type EncounterConnection {
    nodes: [Encounter!]!
    totalCount: Int!
    pageInfo: PageInfo!
}

type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    currentPage: Int!
    totalPages: Int!
}

scalar JSON
scalar DateTime
scalar Long
```

### Data Flow

```
Browser → Caddy (TLS + CrowdSec) → Next.js (SSR/ISR pages)
                                  → Spring Boot API (/graphql)
                                      → PostgreSQL
                                      → Prometheus (metrics proxy)
```

The frontend uses Next.js server components to call the GraphQL API at build time (for static/ISR pages) and at request time (for dynamic data). Client-side interactivity (weather dashboard, switch comparison, system metrics) uses React client components with direct GraphQL queries via a lightweight client (urql or graphql-request).

---

## 7. Frontend Layer

### Next.js 15 with App Router

**Framework:** Next.js 15 (latest stable) with the App Router.

**Styling:** Tailwind CSS 4 for utility-first layout, spacing, and responsive design. CSS Modules for component-scoped styles where encapsulation matters (complex animations, WebXR UI, custom data visualization styling). This is a pragmatic compromise — Tailwind is the keyword on job listings, CSS Modules are the engineering principle for reusable components.

**State management:** React Server Components handle most data fetching. For client-side interactive state (switch comparison selections, weather location, metrics WebSocket), use React's built-in `useState`/`useReducer` and `useContext`. No Redux needed — this site doesn't have the state complexity that justifies it, and demonstrating restraint in library selection is itself a senior signal.

**GraphQL client:** `graphql-request` for simple queries from server components. `urql` for client-side queries with caching and subscriptions (system metrics WebSocket).

**Data visualization:** Recharts for standard charts (weather trends, metrics time series). D3.js for the keyboard switch force curves (custom SVG rendering). Three.js/React Three Fiber for the WebXR scene.

**Docker configuration:**

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]
```

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  restart: unless-stopped
  environment:
    NEXT_PUBLIC_GRAPHQL_URL: https://thekeyswitch.com/graphql
    GRAPHQL_INTERNAL_URL: http://api:8080/graphql
  depends_on:
    api:
      condition: service_healthy
  networks:
    - internal
```

Note: `GRAPHQL_INTERNAL_URL` is used by server components (Docker internal network, no TLS overhead). `NEXT_PUBLIC_GRAPHQL_URL` is used by client components (through Caddy, with TLS).

**Appropriateness rating: 10/10** — Next.js with App Router is the dominant React meta-framework. Using it with server components, ISR, and the standalone output mode demonstrates current best practices.

---

## 8. Feature: Portfolio & Résumé

### Purpose

The landing page and about section are the first things a recruiter or hiring manager sees. They must load fast, look polished, and communicate competence within 5 seconds.

### Implementation

The landing page (`/`) is a server-rendered page with a hero section, a brief tagline, featured project cards (linking to the switch tool, weather dashboard, WebXR demo, and system metrics), and a skills/technology grid. All content is stored in the `site_config` table as JSONB and fetched via the GraphQL API at build time (ISR with 1-hour revalidation).

The résumé page (`/resume`) renders an interactive timeline of work experience, education, and key projects. It also provides a "Download PDF" button that triggers a server-side PDF generation endpoint on the Spring Boot API (using OpenPDF or iText). The PDF is generated from the same structured data, ensuring the web version and PDF are always in sync.

### Data Model

Profile data lives in `site_config` with keys like `profile.hero`, `profile.skills`, `profile.experience`, `profile.education`, `profile.projects`. Each value is a JSONB object with the structured content. This approach avoids hardcoding content in the frontend and allows editing via the admin panel.

---

## 9. Feature: Blog with AI Guest Writers

### Purpose

The blog serves two functions: thought leadership content for hiring managers to read, and a transparent showcase of AI collaboration through the "guest writer" model. Posts authored by AI agents carry full attribution: the platform (Claude Code, GitHub Copilot, etc.), the session context, and a link to the source encounter document.

### Implementation

Blog posts are stored in PostgreSQL with Markdown content. The frontend renders them using `react-markdown` with custom components for code blocks (syntax highlighting via `shiki` or `prism-react-renderer`), callouts, and embedded media.

The `author_type` field distinguishes human-written posts from AI-authored ones. AI-authored posts include an `author_meta` JSONB field with structured attribution data:

```json
{
  "platform": "claude-code",
  "model": "claude-opus-4-6",
  "session_date": "2026-03-12T14:30:00-05:00",
  "encounter_id": "uuid-here",
  "operator": "Kat",
  "transparency_note": "This post was authored by Claude Code based on an encounter document from a real development session. Kat reviewed, edited, and approved the final content."
}
```

AI guest writer posts are visually differentiated in the UI with a distinct byline component that explains the authorship model. This is a deliberate philosophical choice — AI collaboration is presented as a professional practice, not hidden.

### encounter-kit Integration

Encounter documents produced by `encounter-kit` can be imported into the blog system via the admin panel. The import process parses the markdown front matter, extracts tags and metadata, and creates a draft blog post linked to the stored encounter document. This provides the raw material for both human-written posts (Kat writes a post inspired by the encounter) and AI guest writer posts (the agent produces a post from the encounter data).

### Content Workflow

1. Development session produces an encounter document via encounter-kit
2. Document is committed to the encounter-kit repo
3. Admin panel has an "Import Encounter" form that accepts the markdown file
4. The encounter is parsed, stored, and optionally auto-generates a draft post
5. Kat reviews, edits, and publishes

---

## 10. Feature: Keyboard Switch Comparison Tool

### Purpose

This is the creative showpiece. `thekeyswitch.com` is a perfect domain for a mechanical keyboard switch comparison tool, and building it demonstrates data visualization, interactive UI, API design, and domain knowledge of a niche hobbyist community. This feature is the most likely to attract organic search traffic beyond hiring managers.

### Implementation

The tool lives at `/switches` and provides:

**Switch Database:** A browsable, filterable, searchable catalog of mechanical keyboard switches. Each switch has detailed specifications (actuation force, travel distance, spring type, housing material, etc.) and is categorized as linear, tactile, or clicky.

**Force Curve Visualization:** The signature feature. Each switch's force curve is plotted as an interactive D3.js SVG chart showing force (grams) vs. distance (mm). When comparing multiple switches, their curves overlay on the same chart with distinct colors. This is the kind of specialized data visualization that impresses technical interviewers.

**Comparison Mode:** Users select 2–4 switches to compare side-by-side. The comparison view shows a specs table, overlaid force curves, and (where available) embedded audio samples of the switch sound.

**Sound Samples:** Switches can have associated audio samples (hosted as static assets or external URLs). A small audio player component lets users listen to the switch actuation sound.

### Data Source

Switch data is initially seeded from open community sources. The admin panel allows adding and editing switches. Force curve data is stored as JSONB arrays of `{distance_mm, force_gf}` coordinate pairs.

### Technical Details

The force curve chart uses D3.js directly (not a wrapper library) to demonstrate low-level data visualization skills. The chart supports:

- Smooth interpolation between data points (D3 `curveMonotoneX`)
- Interactive tooltips showing exact values on hover
- Responsive resizing
- Animated transitions when switches are added/removed from comparison
- Axis labels, grid lines, and a legend

The comparison state is managed client-side with URL query parameters (`/switches?compare=uuid1,uuid2,uuid3`) so comparisons are shareable via link.

### Appropriateness rating: 9/10

This feature is genuinely useful, demonstrates multiple technical skills, fits the domain name perfectly, and is the kind of creative portfolio piece that makes a candidate memorable. The one risk is scope creep — the initial implementation should focus on the comparison UI with a small seed dataset (~20–30 popular switches), not attempt to be a comprehensive database.

---

## 11. Feature: Live Weather Dashboard

### Purpose

A live, animated weather dashboard that detects the visitor's location (via the browser Geolocation API with a fallback to IP-based geolocation) and displays current conditions plus trend data. This demonstrates API integration, real-time data visualization, and progressive enhancement.

### Implementation

**Data source:** Open-Meteo API (free, no API key required, generous rate limits). This is the best free weather API available — no signup, no key management, and high-quality data from national weather services worldwide.

**Frontend (`/weather`):**

The page requests the user's location via the Geolocation API. If denied, it falls back to a city search input. The dashboard shows:

- Current temperature, humidity, wind speed, and conditions with appropriate icons
- 24-hour temperature trend as an animated Recharts line chart
- 7-day forecast as a bar/line combo chart
- Sunrise/sunset times
- A small map showing the user's location (using an embedded Leaflet/OpenStreetMap tile, zero cost)

All weather data is fetched client-side directly from the Open-Meteo API (no backend proxy needed since it's a public API with CORS headers). This is intentional — it demonstrates understanding of when a backend proxy adds value (authentication, rate limiting, data transformation) versus when it's unnecessary overhead.

**Technical details:**

- Recharts for the trend charts with animated transitions on data load
- CSS animations for weather condition icons (rain drops, sun rays, cloud movement)
- `navigator.geolocation` with proper error handling and permission UX
- Auto-refresh every 15 minutes
- Responsive layout that works on mobile

### Appropriateness rating: 8/10

Weather dashboards are a common portfolio piece, which slightly diminishes the novelty. However, the execution matters more than the concept — polished animations, proper geolocation handling, and responsive design elevate it above typical implementations.

---

## 12. Feature: WebXR Showcase

### Purpose

An interactive 3D scene accessible at `/xr` that demonstrates WebXR/Three.js competence. This is the most technically ambitious feature and the one most likely to generate "wow" reactions in interviews.

### Implementation

**Library:** React Three Fiber (R3F) — the React renderer for Three.js. This integrates naturally with the Next.js component model and is the standard for Three.js in React applications.

**Scene concept: "The Mechanical Workshop"**

A stylized 3D workshop environment themed around mechanical keyboards. The scene contains:

- A workbench with a partially assembled mechanical keyboard
- Interactive switch models that the user can click to see specs (linking to the switch comparison tool)
- Ambient lighting and post-processing effects (bloom, ambient occlusion)
- Orbit controls for mouse/touch navigation
- VR mode support via WebXR Device API for users with headsets

This concept ties the WebXR showcase to the keyboard switch theme of the site, creating a cohesive experience rather than an isolated tech demo.

**Fallback:** For browsers without WebGL2 support, the page shows a static image of the scene with a message explaining the 3D experience requires a modern browser.

**Performance:** The scene must be lightweight enough to run on mobile devices. Use low-poly models, baked lighting where possible, and progressive loading (show a basic scene immediately, load detail assets asynchronously).

**Technical details:**

- React Three Fiber + Drei (helpers library) for scene composition
- `@react-three/xr` for WebXR session management
- GLTF models (created with Blender or sourced from free libraries like Sketchfab CC0)
- Suspense boundaries for async model loading
- Post-processing via `@react-three/postprocessing`

### Appropriateness rating: 7/10

WebXR is a niche skill that won't appear on most job descriptions. However, it's a powerful differentiator — very few portfolio sites include interactive 3D. The risk is development time; the initial implementation should be scoped to a simple scene (a single room, a few interactive objects) rather than an elaborate environment. The "workshop" theme keeps it connected to the site's identity.

---

## 13. Feature: Interactive System Metrics

### Purpose

A live dashboard at `/metrics` showing real-time VPS health data (CPU, memory, disk, network, container status). This feature turns the infrastructure itself into a portfolio piece — "I built observability into the portfolio" is a compelling interview talking point.

### Implementation

**Data pipeline:**

```
Host → Node Exporter → Prometheus ← Spring Boot API (PromQL queries) → GraphQL Subscription → WebSocket → Frontend
```

Node Exporter collects host-level metrics. cAdvisor collects container-level metrics. Prometheus scrapes both on a 15-second interval. The Spring Boot API queries Prometheus using PromQL via the Prometheus HTTP API and exposes the results through a GraphQL subscription (WebSocket). The frontend subscribes and renders animated charts.

**Frontend (`/metrics`):**

The dashboard shows:

- CPU usage gauge (animated radial chart)
- Memory usage bar with used/cached/free breakdown
- Disk usage with read/write IOPS
- Network throughput (RX/TX) as a real-time streaming line chart
- Container status table showing each Docker service's CPU, memory, and health
- Uptime counter
- Load average (1m, 5m, 15m)

All charts update in real-time via the WebSocket subscription. The streaming line chart uses a rolling window (last 5 minutes) and smoothly scrolls as new data arrives.

**Security consideration:** The Prometheus instance is never exposed to the public internet. It listens only on the Docker internal network. The Spring Boot API acts as a secure proxy, authenticating the GraphQL subscription and rate-limiting requests.

**Technical details:**

- Recharts for gauges and bar charts
- D3.js for the streaming line chart (custom implementation for smooth real-time scrolling)
- urql's subscription support with WebSocket transport
- Spring Boot WebSocket support via `spring-boot-starter-websocket` and Spring for GraphQL subscription handling
- Prometheus HTTP API client in Spring Boot using `RestTemplate` or `WebClient`

### Appropriateness rating: 9/10

This is the feature with the highest interview ROI. It demonstrates real observability skills: Prometheus, metrics pipelines, WebSocket real-time data, and infrastructure awareness. The implementation is also genuinely useful for monitoring the VPS.

---

## 14. Feature: Contact (Anti-Scrape)

### Purpose

Provide contact information that humans can easily use but automated scrapers find difficult to harvest.

### Implementation

The contact page (`/contact`) uses multiple anti-scrape techniques layered together:

**Email obfuscation:** The email address is never present in the HTML source. Instead, it's assembled client-side from split parts encoded in a data attribute and decoded via JavaScript. The rendered result is a clickable `mailto:` link.

```jsx
// Email is split and base64-encoded, assembled at render time
const parts = [atob('a2F0'), '@', atob('dGhla2V5c3dpdGNoLmNvbQ==')];
```

**Honeypot field:** A hidden form field styled with `display: none` that only bots will fill out. Submissions with data in this field are silently discarded.

**Turnstile CAPTCHA:** Cloudflare Turnstile (free) as a non-intrusive CAPTCHA on the contact form. It runs in the background and only presents a challenge when suspicious behavior is detected.

**Contact form:** A simple form that submits via the GraphQL API. The API sends an email notification (via a lightweight SMTP integration or a free transactional email service like Resend's free tier) and stores the message in PostgreSQL for the admin panel.

**Social links:** GitHub, LinkedIn, and any other relevant profiles are listed with standard links (these are already public and don't need obfuscation).

---

## 15. Monitoring & Observability

### Stack

| Component | Role | Resource Budget |
|-----------|------|-----------------|
| Prometheus | Time-series metrics storage and querying | ~200 MB RAM, minimal CPU |
| Node Exporter | Host-level metrics (CPU, memory, disk, network) | ~20 MB RAM |
| cAdvisor | Container-level metrics | ~100 MB RAM |
| Spring Boot Actuator | Application-level metrics (JVM, HTTP, GraphQL) | Included in API container |

Grafana is intentionally omitted. For a single-admin site, the custom `/metrics` dashboard on the frontend serves the visualization need. Grafana would add ~200 MB RAM for a dashboard only the admin uses. If detailed querying is needed, Prometheus's built-in web UI is accessible internally.

### Prometheus Configuration

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['api:8080']
```

### Docker Compose for Monitoring

```yaml
prometheus:
  image: prom/prometheus:v3.5.0
  restart: unless-stopped
  volumes:
    - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
    - '--storage.tsdb.retention.time=30d'
    - '--storage.tsdb.retention.size=5GB'
    - '--web.enable-lifecycle'
  networks:
    - internal

node-exporter:
  image: prom/node-exporter:latest
  restart: unless-stopped
  command:
    - '--path.rootfs=/host'
  volumes:
    - '/:/host:ro,rslave'
  pid: host
  networks:
    - internal

cadvisor:
  image: gcr.io/cadvisor/cadvisor:latest
  restart: unless-stopped
  volumes:
    - /:/rootfs:ro
    - /var/run:/var/run:ro
    - /sys:/sys:ro
    - /var/lib/docker/:/var/lib/docker:ro
  networks:
    - internal
```

---

## 16. CI/CD & Deployment

### Git Repository

Single monorepo with the following top-level directories: `frontend/`, `api/`, `db/`, `caddy/`, `crowdsec/`, `prometheus/`, `docker-compose.yml`, `.env.example`, and documentation.

### Deployment Strategy

For a single-VPS deployment, the CI/CD pipeline is deliberately simple:

1. Push to `main` branch on GitHub
2. GitHub Actions runs tests (frontend: `npm test`, API: `./gradlew test`)
3. If tests pass, SSH into the VPS and run the deploy script
4. Deploy script: `git pull && docker compose build && docker compose up -d`

This is not a zero-downtime deployment. For a personal portfolio site with negligible traffic, the 10–30 seconds of downtime during a deploy is acceptable. A blue-green or rolling deployment would require a load balancer and duplicate services, consuming resources that aren't justified.

### GitHub Actions Workflow

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test Frontend
        working-directory: frontend
        run: |
          npm ci
          npm test
      - name: Test API
        working-directory: api
        run: ./gradlew test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: 212.38.95.37
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/thekeyswitch
            git pull origin main
            docker compose build --parallel
            docker compose up -d
            docker compose ps
            docker system prune -f
```

### Database Migrations

Flyway, integrated into the Spring Boot application, runs migrations automatically on startup. Migration files live in `api/src/main/resources/db/migration/` with the naming convention `V1__initial_schema.sql`, `V2__seed_switches.sql`, etc.

---

## 17. Technology Assessment Matrix

| Technology | Role | Hiring Signal (1-10) | Appropriateness for This Project (1-10) | Risk | Mitigation |
|------------|------|---------------------|-----------------------------------------|------|------------|
| **Next.js 15 (App Router)** | Frontend framework | 10 | 10 | Breaking changes between versions | Pin version, test before upgrading |
| **React 19** | UI library | 10 | 10 | None significant | Stable, widely supported |
| **Tailwind CSS 4** | Utility styling | 9 | 8 | Fights component encapsulation | CSS Modules escape hatch |
| **Spring Boot 3.x** | Backend API | 9 | 7 | Heavy memory footprint on small VPS | Tune JVM heap, monitor usage, NestJS as fallback |
| **Java 21** | Backend language | 9 | 7 | Slower development velocity vs. JS/TS | Worth it for hiring signal |
| **Spring for GraphQL** | GraphQL server | 8 | 9 | Newer than REST Spring ecosystem | Official Spring project, well-documented |
| **PostgreSQL 16** | Database | 10 | 10 | None significant | Industry standard, excellent tooling |
| **Caddy 2** | Reverse proxy + TLS | 7 | 10 | Less common than Nginx on job listings | Demonstrates alternative expertise |
| **CrowdSec** | WAF / security | 6 | 8 | Not widely known yet | Emerging tool, good talking point |
| **Docker Compose** | Container orchestration | 8 | 10 | Not Kubernetes | Correct choice for single-node |
| **Prometheus** | Metrics | 9 | 9 | Memory usage | Conservative retention settings |
| **D3.js** | Data visualization | 8 | 9 | Steep learning curve | Scoped to force curves only |
| **Recharts** | Chart library | 7 | 9 | Less flexible than D3 | Good for standard charts |
| **React Three Fiber** | WebXR / 3D | 5 | 7 | Niche skill, heavy dev time | Keep scope small |
| **Flyway** | DB migrations | 7 | 9 | None significant | Standard tool |
| **GitHub Actions** | CI/CD | 9 | 10 | Free tier limits | Sufficient for this project |
| **Grafana** | Metrics visualization | 8 | 4 | Memory overhead for single admin | Omitted — custom dashboard instead |

---

## 18. Resource Budget

Estimated steady-state memory usage on the 8 GB VPS:

| Service | Expected RAM | CPU (steady state) |
|---------|-------------|-------------------|
| OS + Docker engine | ~500 MB | Minimal |
| Caddy (custom build) | ~50 MB | Minimal |
| CrowdSec | ~200 MB | Minimal |
| Next.js (standalone) | ~200 MB | Low |
| Spring Boot API | ~512 MB (capped) | Low-moderate |
| PostgreSQL | ~256 MB | Low |
| Prometheus | ~200 MB | Low |
| Node Exporter | ~20 MB | Negligible |
| cAdvisor | ~100 MB | Low |
| **Total estimated** | **~2.0 GB** | **< 1 core** |
| **Available headroom** | **~6.0 GB** | **~1 core** |

The budget leaves substantial headroom for traffic spikes, background tasks (builds, backups), and potential additional services. The Spring Boot API is the largest single consumer and is explicitly capped at 512 MB JVM heap.

---

## 19. Repository Structure

```
thekeyswitch/
├── docker-compose.yml
├── docker-compose.dev.yml          # Development overrides (ports, volumes, hot reload)
├── .env.example
├── .github/
│   └── workflows/
│       └── deploy.yml
├── README.md
├── ARCHITECTURE.md                  # This document
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── public/
│   │   ├── fonts/
│   │   ├── images/
│   │   └── audio/                   # Switch sound samples
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx             # Landing / hero
│       │   ├── about/
│       │   ├── resume/
│       │   ├── blog/
│       │   │   ├── page.tsx         # Blog listing
│       │   │   └── [slug]/
│       │   │       └── page.tsx     # Blog post
│       │   ├── switches/
│       │   │   └── page.tsx         # Switch comparison tool
│       │   ├── weather/
│       │   │   └── page.tsx         # Weather dashboard
│       │   ├── xr/
│       │   │   └── page.tsx         # WebXR showcase
│       │   ├── metrics/
│       │   │   └── page.tsx         # System metrics dashboard
│       │   ├── contact/
│       │   │   └── page.tsx         # Anti-scrape contact
│       │   └── admin/
│       │       ├── layout.tsx       # Auth-gated layout
│       │       ├── page.tsx         # Dashboard
│       │       ├── posts/
│       │       ├── switches/
│       │       └── encounters/
│       ├── components/
│       │   ├── ui/                  # Shared UI primitives
│       │   ├── charts/              # Recharts wrappers
│       │   ├── d3/                  # D3 force curve chart
│       │   ├── three/               # R3F scene components
│       │   └── blog/                # Blog rendering components
│       ├── lib/
│       │   ├── graphql/
│       │   │   ├── client.ts        # urql client setup
│       │   │   ├── queries.ts
│       │   │   ├── mutations.ts
│       │   │   └── subscriptions.ts
│       │   ├── utils/
│       │   └── hooks/
│       └── styles/
│           ├── globals.css
│           └── modules/             # CSS Modules
│
├── api/
│   ├── Dockerfile
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── src/
│       ├── main/
│       │   ├── java/com/thekeyswitch/api/
│       │   │   ├── TheKeySwitchApplication.java
│       │   │   ├── config/
│       │   │   │   ├── SecurityConfig.java
│       │   │   │   ├── CorsConfig.java
│       │   │   │   ├── GraphQlConfig.java
│       │   │   │   └── WebSocketConfig.java
│       │   │   ├── controller/
│       │   │   │   ├── PostController.java
│       │   │   │   ├── SwitchController.java
│       │   │   │   ├── EncounterController.java
│       │   │   │   ├── SiteConfigController.java
│       │   │   │   ├── AuthController.java
│       │   │   │   └── MetricsController.java
│       │   │   ├── model/
│       │   │   │   ├── Post.java
│       │   │   │   ├── Switch.java
│       │   │   │   ├── Encounter.java
│       │   │   │   ├── SiteConfig.java
│       │   │   │   └── AdminUser.java
│       │   │   ├── repository/
│       │   │   ├── service/
│       │   │   │   ├── PostService.java
│       │   │   │   ├── SwitchService.java
│       │   │   │   ├── EncounterService.java
│       │   │   │   ├── AuthService.java
│       │   │   │   ├── MetricsProxyService.java
│       │   │   │   └── PdfGenerationService.java
│       │   │   ├── security/
│       │   │   │   ├── JwtTokenProvider.java
│       │   │   │   └── JwtAuthenticationFilter.java
│       │   │   └── dto/
│       │   ├── resources/
│       │   │   ├── application.yml
│       │   │   ├── application-production.yml
│       │   │   ├── graphql/
│       │   │   │   └── schema.graphqls
│       │   │   └── db/
│       │   │       └── migration/
│       │   │           ├── V1__initial_schema.sql
│       │   │           ├── V2__seed_site_config.sql
│       │   │           └── V3__seed_switches.sql
│       │   └── test/
│
├── caddy/
│   ├── Dockerfile                   # xcaddy build with CrowdSec modules
│   └── Caddyfile
│
├── crowdsec/
│   └── acquis.yaml                  # Log acquisition config
│
├── prometheus/
│   └── prometheus.yml               # Scrape configuration
│
├── db/
│   └── init/                        # Docker entrypoint init scripts (if needed beyond Flyway)
│
└── scripts/
    ├── setup-vps.sh                 # Initial VPS provisioning script
    ├── deploy.sh                    # Deployment script called by CI
    └── seed-switches.sh             # Helper to seed switch data
```

---

## 20. Implementation Roadmap

### Phase 1: Foundation (Days 1–3)

**Goal:** VPS provisioned, Docker Compose running, Caddy serving a placeholder page, database initialized.

Tasks:
- Fresh Ubuntu 24.04 install on VPS
- Run `setup-vps.sh`: install Docker, Docker Compose, configure firewall (UFW: allow 80, 443, 22), create project directory, set up SSH keys
- Initialize git repository with the directory structure above
- Create the custom Caddy Docker image with CrowdSec modules
- Write `docker-compose.yml` with all 8 services
- Configure CrowdSec with Caddy log acquisition
- PostgreSQL with initial schema (Flyway V1 migration)
- Verify Caddy serves HTTPS with valid Let's Encrypt certificate
- Verify CrowdSec is reading logs and bouncer is connected

### Phase 2: API Core (Days 4–7)

**Goal:** Spring Boot API running with GraphQL endpoint, database operations working.

Tasks:
- Initialize Spring Boot project with Gradle
- Implement JPA entities for all tables
- Implement repositories
- Write the GraphQL schema file
- Implement controllers (query resolvers) for posts, switches, site config
- Implement mutations with JWT authentication
- Implement JWT auth flow (login, token refresh)
- Write Flyway seed migrations (site config, sample data)
- Prometheus Actuator metrics endpoint
- Integration tests

### Phase 3: Frontend Shell (Days 8–12)

**Goal:** Next.js app with routing, layout, GraphQL integration, and all pages rendering (content may be placeholder).

Tasks:
- Initialize Next.js project with App Router, TypeScript, Tailwind
- Set up urql client with server/client split
- Implement root layout with navigation, footer, dark mode
- Landing page with hero and feature cards
- About page pulling from site_config
- Résumé page with interactive timeline
- Blog listing and individual post pages
- Admin panel with auth-gated layout
- Post editor in admin (create, edit, publish)

### Phase 4: Interactive Features (Days 13–20)

**Goal:** All four creative features implemented and polished.

Tasks (can be parallelized):
- **Switches tool:** D3 force curve chart, comparison mode, filterable listing, seed ~25 switches
- **Weather dashboard:** Geolocation, Open-Meteo API integration, Recharts trend charts, responsive layout
- **System metrics:** Prometheus proxy in Spring Boot, GraphQL subscription, WebSocket, real-time charts
- **WebXR showcase:** Basic R3F scene, orbit controls, interactive elements, VR mode

### Phase 5: Polish & Content (Days 21–25)

**Goal:** Production-ready, with real content and testing.

Tasks:
- Contact page with anti-scrape email, honeypot, Turnstile
- PDF résumé generation endpoint
- SEO: meta tags, OG images, sitemap.xml, robots.txt
- Performance audit (Lighthouse, Core Web Vitals)
- Mobile responsive testing
- Write 2–3 initial blog posts (at least one AI guest writer post)
- Import first encounter documents
- Security audit: CSP headers, input validation, SQL injection testing
- Final deploy and DNS verification

---

## 21. Agent Build Instructions

This section is specifically for Claude Code or another AI agent tasked with building this project. Follow these instructions in order.

### Prerequisites

The agent should have SSH access to the VPS at 212.38.95.37 and a local development environment with Node.js 22, Java 21, and Docker.

### Step 1: VPS Provisioning

Create and execute `scripts/setup-vps.sh`:

```bash
#!/bin/bash
set -euo pipefail

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Install Docker Compose plugin
apt install -y docker-compose-plugin

# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Create project directory
mkdir -p /opt/thekeyswitch
cd /opt/thekeyswitch

# Create non-root deploy user
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh
# (Copy SSH public key here)

echo "VPS provisioned. Clone repository to /opt/thekeyswitch and run docker compose up -d"
```

### Step 2: Build Order

1. Initialize the git repository with the directory structure from Section 19
2. Create `.env.example` with all required environment variables
3. Build the custom Caddy Docker image (`caddy/Dockerfile`)
4. Write `docker-compose.yml` with all services
5. Write `docker-compose.dev.yml` with development overrides (exposed ports, volume mounts for hot reload)
6. Initialize the Spring Boot project (use Spring Initializr CLI or manual Gradle setup)
7. Implement the database schema as Flyway migrations
8. Implement JPA entities and repositories
9. Implement the GraphQL schema and controllers
10. Implement JWT authentication
11. Initialize the Next.js project
12. Implement GraphQL client setup (urql for client components, graphql-request for server components)
13. Build pages in the order: layout → landing → about → résumé → blog → switches → weather → metrics → xr → contact → admin
14. Write Prometheus configuration
15. Write CrowdSec acquisition configuration
16. Write GitHub Actions deployment workflow
17. Write README.md with setup instructions

### Step 3: Key Implementation Notes

**GraphQL client split:** Server components use `graphql-request` with `GRAPHQL_INTERNAL_URL` (Docker internal network). Client components use `urql` with `NEXT_PUBLIC_GRAPHQL_URL` (public URL through Caddy). Never mix these.

**Spring Boot memory:** Always set `-Xmx512m -Xms256m` in the Docker entrypoint. Monitor with `docker stats` and adjust if needed.

**CrowdSec bouncer key:** After first `docker compose up`, run `docker exec crowdsec cscli bouncers add caddy-bouncer` to generate the API key. Add it to `.env` and restart Caddy.

**Force curve data format:** Each switch's `force_curve` JSONB field should be an array of objects: `[{"distance_mm": 0.0, "force_gf": 0.0}, {"distance_mm": 0.5, "force_gf": 15.0}, ...]`. The D3 chart reads this directly.

**WebSocket for metrics:** Spring for GraphQL supports subscriptions over WebSocket natively. The frontend urql client connects to `wss://thekeyswitch.com/graphql` (Caddy proxies WebSocket upgrade). The Spring Boot API polls Prometheus every 5 seconds and pushes updates to subscribers.

**ISR configuration for blog:** Blog listing page revalidates every 60 seconds. Individual blog posts revalidate every 3600 seconds (1 hour). The admin panel triggers on-demand revalidation after publishing.

**encounter-kit import:** The admin panel's encounter import parses the markdown file, extracts YAML front matter (title, tags, platform, date), and stores both the raw markdown and structured metadata. The Spring Boot endpoint for this is a file upload mutation.

### Step 4: Verification Checklist

After deployment, verify:

- [ ] `https://thekeyswitch.com` loads with valid TLS certificate
- [ ] All pages render without errors (check browser console)
- [ ] GraphQL endpoint responds at `https://thekeyswitch.com/graphql`
- [ ] GraphiQL or playground is disabled in production
- [ ] Admin login works and JWT tokens are issued
- [ ] Blog posts can be created, edited, and published via admin
- [ ] Switch comparison tool renders force curves correctly
- [ ] Weather dashboard detects location and shows data
- [ ] System metrics update in real-time
- [ ] WebXR scene loads and is interactive
- [ ] Contact form submits successfully and honeypot works
- [ ] CrowdSec is processing logs (`docker exec crowdsec cscli metrics`)
- [ ] Prometheus is scraping all targets (`http://prometheus:9090/targets` internally)
- [ ] Lighthouse score > 90 for performance on static pages
- [ ] Mobile responsive on all pages

---

## Sources & References

### Official Documentation
- Next.js App Router: https://nextjs.org/docs/app
- Spring for GraphQL: https://docs.spring.io/spring-graphql/reference/
- Spring Boot Starter for GraphQL: https://docs.spring.io/spring-graphql/reference/boot-starter.html
- Spring Boot Getting Started with GraphQL: https://spring.io/guides/gs/graphql-server/
- PostgreSQL 16: https://www.postgresql.org/docs/16/
- Caddy Server: https://caddyserver.com/docs/
- CrowdSec: https://docs.crowdsec.net/
- Caddy CrowdSec Bouncer: https://github.com/hslatman/caddy-crowdsec-bouncer
- CrowdSec Caddy WAF Guide: https://www.crowdsec.net/blog/secure-caddy-crowdsec-remediation-waf-guide
- Docker Compose: https://docs.docker.com/compose/
- Prometheus: https://prometheus.io/docs/
- Node Exporter: https://github.com/prometheus/node_exporter
- Flyway: https://documentation.red-gate.com/fd
- Open-Meteo API: https://open-meteo.com/en/docs
- React Three Fiber: https://r3f.docs.pmnd.rs/getting-started/introduction
- D3.js: https://d3js.org/
- Recharts: https://recharts.org/
- urql GraphQL Client: https://commerce.nearform.com/open-source/urql/docs/
- Tailwind CSS: https://tailwindcss.com/docs

### Pre-built Docker Images
- Caddy with CrowdSec: https://hub.docker.com/r/serfriz/caddy-crowdsec
- CrowdSec Docker: https://hub.docker.com/r/crowdsecurity/crowdsec

### Architecture References
- Kubernetes Resource Docs (for the K8s vs Compose decision): https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
- K3s Requirements: https://docs.k3s.io/installation/requirements

### Job Market Data (informing technology choices)
- Backend language demand: https://www.itransition.com/developers/in-demand-programming-languages
- Programming language hiring trends: https://www.esilv.fr/en/top-7-programming-languages-that-get-you-hired-in-2026/
- Backend language overview: https://talent500.com/blog/best-backend-programming-languages-2026/
