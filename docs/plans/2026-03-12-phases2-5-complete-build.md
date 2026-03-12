# Phases 2-5: Complete Build Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete every feature in ARCHITECTURE.md — a production-ready portfolio site with working API, interactive frontend, and all creative features.

**Architecture:** Fix critical API bugs (scalar names, JSONB types, missing controllers), add seed data, build all frontend pages with real GraphQL integration, implement D3 force curves, weather dashboard, WebXR scene, live metrics, and contact form.

**Tech Stack:** Spring Boot 3.4/Java 21, Next.js 15, Tailwind CSS 4, D3.js, Recharts, React Three Fiber, urql, graphql-request, Open-Meteo API

---

## Workstream A: API Critical Fixes + Completion

### A1: Fix startup-blocking bugs
- GraphQlConfig: scalar name "Json" → "JSON"
- SiteConfig.value: String → Map for JSON scalar
- Switch.forceCurve: String → Map for JSON scalar
- Encounter.abstractText: add getAbstract() alias
- CreateSwitchInput/UpdateSwitchInput: forceCurve String → Object

### A2: Missing controllers + services
- EncounterService + EncounterController
- ImportEncounterInput DTO
- MetricsProxyService + MetricsController (Prometheus query proxy)
- WebSocket subscription for systemMetrics

### A3: Seed data
- V2__seed_site_config.sql (profile, hero, skills, experience, education)
- V3__seed_switches.sql (~25 popular mechanical keyboard switches with force curves)
- V4__seed_admin_user.sql (bcrypt-hashed default admin)
- V5__seed_blog_posts.sql (3 initial blog posts)

## Workstream B: Frontend Complete Build

### B1: GraphQL integration
- Write all queries/mutations in lib/graphql/
- Set up urql provider for client components
- Wire graphql-request for server components

### B2: Real pages
- Landing page with dynamic site config
- About page with CMS data
- Resume page with interactive timeline
- Blog listing with real posts
- Blog post rendering with markdown
- Admin panel with auth + CRUD

### B3: Interactive features
- D3 switch force curve chart
- Switch comparison mode with URL state
- Weather dashboard with Open-Meteo
- System metrics with WebSocket
- WebXR scene with React Three Fiber

### B4: Polish
- Contact form with anti-scrape
- SEO (sitemap, robots, meta)
- Auth middleware for /admin
- Dark/light mode toggle
- Mobile responsive verification

---

## Execution Order (parallelized where possible)

Round 1 (parallel): A1 + B1 setup
Round 2 (parallel): A2 + A3 + B2 pages
Round 3 (parallel): B3 features (switches, weather, metrics, xr)
Round 4: B4 polish + final deploy
