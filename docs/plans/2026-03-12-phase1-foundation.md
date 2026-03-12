# Phase 1: Foundation — Infrastructure & Project Scaffolding

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Get Docker Compose running on VPS with Caddy serving HTTPS, PostgreSQL initialized, CrowdSec active, Prometheus scraping, and placeholder frontend/API containers.

**Architecture:** Monorepo with docker-compose.yml orchestrating 8 services. Caddy edge layer with CrowdSec WAF, Spring Boot API behind it, Next.js frontend, PostgreSQL database, Prometheus + exporters for observability. All secrets via .env (gitignored).

**Tech Stack:** Docker Compose, Caddy 2 (custom build w/ CrowdSec), PostgreSQL 16, Prometheus, Node Exporter, cAdvisor, Spring Boot 3.x (Java 21), Next.js 15

---

### Task 1: Repository Structure & Git Configuration

**Files:**
- Create: `.gitignore`
- Create: `.env.example`
- Create: `CLAUDE.md`

**Step 1: Create .gitignore**

Standard ignores for Java/Gradle, Node.js, Docker, secrets, IDE files.

**Step 2: Create .env.example**

Template with all required env vars (no real values).

**Step 3: Create CLAUDE.md**

Project conventions for agent context.

**Step 4: Commit**

```bash
git add .gitignore .env.example CLAUDE.md
git commit -m "chore: add gitignore, env template, and agent conventions"
```

---

### Task 2: Docker Infrastructure Files

**Files:**
- Create: `docker-compose.yml`
- Create: `docker-compose.dev.yml`
- Create: `caddy/Dockerfile`
- Create: `caddy/Caddyfile`
- Create: `crowdsec/acquis.yaml`
- Create: `prometheus/prometheus.yml`

**Step 1: Create docker-compose.yml with all 8 services**

Per ARCHITECTURE.md Section 3 service map. Services: caddy, frontend, api, db, crowdsec, prometheus, node-exporter, cadvisor.

**Step 2: Create docker-compose.dev.yml**

Development overrides: exposed ports, volume mounts for hot reload, relaxed resource limits.

**Step 3: Create Caddy Dockerfile (xcaddy + CrowdSec bouncer)**

Per ARCHITECTURE.md Section 4.

**Step 4: Create Caddyfile**

Per ARCHITECTURE.md Section 3 with security headers, CrowdSec integration, reverse proxy routes.

**Step 5: Create CrowdSec acquis.yaml**

Log acquisition config for Caddy JSON access logs.

**Step 6: Create Prometheus config**

Scrape configs for prometheus, node-exporter, cadvisor, spring-boot actuator.

**Step 7: Commit**

```bash
git add docker-compose.yml docker-compose.dev.yml caddy/ crowdsec/ prometheus/
git commit -m "feat: add Docker Compose infrastructure with Caddy, CrowdSec, Prometheus"
```

---

### Task 3: Spring Boot API Scaffold

**Files:**
- Create: `api/Dockerfile`
- Create: `api/build.gradle.kts`
- Create: `api/settings.gradle.kts`
- Create: `api/src/main/java/com/thekeyswitch/api/TheKeySwitchApplication.java`
- Create: `api/src/main/resources/application.yml`
- Create: `api/src/main/resources/application-production.yml`
- Create: `api/src/main/resources/graphql/schema.graphqls`
- Create: `api/src/main/resources/db/migration/V1__initial_schema.sql`
- Create: `api/gradlew` (via gradle wrapper)

**Step 1: Initialize Gradle project with Spring Boot dependencies**

build.gradle.kts with all deps from ARCHITECTURE.md Section 6.

**Step 2: Create main application class**

Minimal Spring Boot entry point.

**Step 3: Create application.yml configs**

Default + production profiles. Database, JPA, GraphQL, actuator settings.

**Step 4: Create GraphQL schema**

Full schema from ARCHITECTURE.md Section 6.

**Step 5: Create V1 Flyway migration**

Full database schema from ARCHITECTURE.md Section 5.

**Step 6: Create Dockerfile**

Multi-stage build per ARCHITECTURE.md Section 6.

**Step 7: Commit**

```bash
git add api/
git commit -m "feat: scaffold Spring Boot API with GraphQL schema and Flyway migrations"
```

---

### Task 4: Next.js Frontend Scaffold

**Files:**
- Create: `frontend/Dockerfile`
- Create: `frontend/package.json`
- Create: `frontend/next.config.js`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tailwind.config.js` (or CSS config for Tailwind 4)
- Create: `frontend/src/app/layout.tsx`
- Create: `frontend/src/app/page.tsx`
- Create: `frontend/src/app/globals.css`
- Create: `frontend/public/` placeholder

**Step 1: Initialize Next.js 15 project with TypeScript, Tailwind CSS 4, App Router**

package.json with all deps.

**Step 2: Create root layout and landing page placeholder**

Minimal layout.tsx and page.tsx.

**Step 3: Create Dockerfile**

Standalone output mode per ARCHITECTURE.md Section 7.

**Step 4: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold Next.js 15 frontend with Tailwind CSS"
```

---

### Task 5: CI/CD & Scripts

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `scripts/setup-vps.sh`
- Create: `scripts/deploy.sh`

**Step 1: Create GitHub Actions workflow**

Per ARCHITECTURE.md Section 16.

**Step 2: Create VPS setup script**

Per ARCHITECTURE.md Section 21 (already run, but kept for documentation).

**Step 3: Create deploy script**

Called by CI — git pull, build, up.

**Step 4: Commit**

```bash
git add .github/ scripts/
git commit -m "feat: add CI/CD workflow and deployment scripts"
```

---

### Task 6: Initial Deploy & Verify

**Step 1: Push to GitHub**

```bash
git push -u origin main
```

**Step 2: Deploy to VPS**

```bash
ssh thekeyswitch "cd /opt/thekeyswitch && git pull origin main && docker compose build --parallel && docker compose up -d"
```

**Step 3: Verify services are running**

```bash
ssh thekeyswitch "docker compose ps"
```

**Step 4: Verify HTTPS**

Check that https://thekeyswitch.com responds (even if just placeholder).

---

## Success Criteria

- [ ] All 8 Docker services start without errors
- [ ] Caddy serves HTTPS with valid Let's Encrypt cert at thekeyswitch.com
- [ ] CrowdSec bouncer is connected and processing logs
- [ ] PostgreSQL is healthy with schema applied via Flyway
- [ ] Spring Boot API responds at /actuator/health
- [ ] Next.js frontend renders placeholder page
- [ ] Prometheus is scraping all targets
- [ ] No secrets committed to the public repo
