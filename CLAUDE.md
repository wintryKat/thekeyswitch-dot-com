# thekeyswitch.com — Agent Conventions

## Project Overview

Portfolio site at thekeyswitch.com. Monorepo with Spring Boot GraphQL API, Next.js 15 frontend, PostgreSQL, Docker Compose on a Hostinger VPS.

## Architecture

See `ARCHITECTURE.md` for the full specification.

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS 4, graphql-request
- **API:** Spring Boot 3.x, Java 21, Spring for GraphQL, Spring Data JPA, Flyway
- **Database:** PostgreSQL 16
- **Infrastructure:** Docker Compose, Caddy (reverse proxy + TLS), CrowdSec (WAF), Prometheus + exporters

## Repo Structure

```
frontend/    — Next.js application
api/         — Spring Boot GraphQL API
caddy/       — Custom Caddy Docker image with CrowdSec bouncer
crowdsec/    — CrowdSec log acquisition config
prometheus/  — Prometheus scrape config
db/          — Database init scripts (beyond Flyway)
scripts/     — VPS setup and deployment scripts
```

## Key Conventions

- **Secrets:** NEVER commit secrets. All secrets go in `.env` (gitignored). Use `.env.example` as template.
- **Branching:** `feat/<name>` branches, merge to `main` for deploy.
- **API data flow:** Frontend → Caddy → Next.js or Spring Boot API → PostgreSQL. Frontend never talks to DB directly.
- **GraphQL client split:** Server components use `graphql-request` with `GRAPHQL_INTERNAL_URL`. Client components use `fetch`/`graphql-request` against `NEXT_PUBLIC_GRAPHQL_URL`.
- **Spring Boot memory:** Always `-Xmx512m -Xms256m`.
- **Database migrations:** Flyway in `api/src/main/resources/db/migration/`. Naming: `V1__description.sql`.

## Commands

### Local Development
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Deploy to VPS
```bash
ssh thekeyswitch "cd /opt/thekeyswitch && git pull origin main && docker compose build --parallel && docker compose up -d"
```

### API Tests
```bash
cd api && ./gradlew test
```

### Frontend Tests
```bash
cd frontend && npm test
```
