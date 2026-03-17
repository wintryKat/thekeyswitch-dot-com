# Docker Hub Integration: Architecture, Operator Handbook, and Agent Execution Guide

**Document version:** 1.0.0  
**Project:** thekeyswitch.com  
**Scope:** Build pipeline, image registry, and VPS deploy topology  
**Primary consumer:** Claude Cowork agents and operator Kat  
**Classification:** Implementation-ready specification

---

## 0. How to Read This Document

This document has three primary audiences:

1. **Operator (Kat):** Sections 1, 2, 3, 7, 8, and 9. These sections tell you what to create, where to click, what secrets to provision, and what decisions require human judgment. Operator-action items are prefixed with `[OPERATOR ACTION]`.

2. **LLM Execution Agents (Claude Cowork, Claude Code):** Sections 4, 5, 6, 7, and 8. These sections are written to be parsed and executed programmatically. Agent-action items are prefixed with `[AGENT ACTION]`. Explicit stop-and-escalate conditions are prefixed with `[ESCALATE]`.

3. **Both:** Section 9 (failure modes) and Section 10 (backout protocol) are critical for both audiences and must not be skipped.

An agent reading this document MUST execute sections in order. A section that results in an `[ESCALATE]` condition halts all downstream work and triggers the backout protocol in Section 10 before surfacing the blockage to the operator.

---

## 1. Why Docker Hub: Rationale for Spend

### 1.1 The Core Problem This Solves

The VPS has 2 CPU cores and 8 GB RAM. Spring Boot 3.x images routinely require 512 MB–1 GB RAM at runtime. PostgreSQL requires another 256–512 MB. Next.js, Caddy, Prometheus, Node Exporter, and cAdvisor consume the remaining headroom. Under this constraint, **building Docker images on the VPS during a deploy is dangerous**: the build process competes for the same RAM and CPU that live services need to stay healthy. A Spring Boot multi-layer build can spike to 1.5+ GB RAM. On a loaded VPS, that causes OOM kills against production services.

The fix is to **never build on the VPS**. Build happens locally or in CI. The VPS only pulls pre-built images from a registry and runs them.

Docker Hub is that registry.

### 1.2 Why the Paid Tier Specifically

The free Docker Hub tier imposes:
- **1 private repository** — the project requires at minimum 4 (api, web, caddy-custom, and potentially a tools image)
- **Pull rate limits for unauthenticated and free-tier authenticated pulls** — CI/CD pipelines that rebuild frequently will hit this ceiling, causing transient deploy failures that look like network or image corruption issues
- No Docker Scout (vulnerability scanning)

The paid Personal tier removes all of these constraints for a single user account. Given that the subscription already exists, the incremental cost of using it correctly is zero. Leaving it underutilized is the actual waste.

### 1.3 Enterprise Signal Value

The deploy pattern enabled by this integration — build in CI, push artifact to registry, deploy by pull — is the canonical enterprise container workflow. Interviewers from large engineering organizations will recognize it immediately. The alternative (SSH in and `docker compose up --build`) is a development convenience, not a production pattern. The registry-backed approach demonstrates:

- Separation of build and runtime environments
- Immutable, versioned artifacts (image SHA digests)
- Rollback capability (previous tag is always pullable)
- Security hygiene (Scout scanning before deploy)

---

## 2. Topology After Integration

```
┌──────────────────────────────────────────────────────────────────────┐
│  Developer Workstation (Windows 11)                                  │
│                                                                      │
│  git push → GitHub (wintryKat/thekeyswitch-dot-com)                  │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ triggers
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│  GitHub Actions (CI/CD)                                              │
│                                                                      │
│  1. Checkout code                                                    │
│  2. Build Spring Boot JAR (Maven/Gradle)                             │
│  3. Build Docker image: wintrykat/thekeyswitch-api                   │
│  4. Build Next.js Docker image: wintrykat/thekeyswitch-web           │
│  5. Build custom Caddy image: wintrykat/thekeyswitch-caddy           │
│  6. Run Docker Scout vulnerability scan                              │
│  7. Push all images to Docker Hub with :latest + :sha-<COMMIT_SHA>   │
│  8. SSH to VPS → docker compose pull && docker compose up -d         │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ push images
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Docker Hub (wintrykat account)                                      │
│                                                                      │
│  Private repos:                                                      │
│    wintrykat/thekeyswitch-api    (Spring Boot + Java 21)             │
│    wintrykat/thekeyswitch-web    (Next.js 15)                        │
│    wintrykat/thekeyswitch-caddy  (xcaddy + CrowdSec bouncer)         │
│    wintrykat/thekeyswitch-tools  (reserved for future tooling)       │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ docker compose pull
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│  VPS: 212.38.95.37 (Ubuntu 24.04, SSH alias: thekeyswitch)           │
│                                                                      │
│  docker compose pull  ← pulls images from Hub (no building)         │
│  docker compose up -d ← runs pulled images                          │
│                                                                      │
│  Services running:                                                   │
│    caddy (reverse proxy, TLS, WAF)                                   │
│    api (Spring Boot)                                                 │
│    web (Next.js)                                                     │
│    postgres                                                          │
│    prometheus / node-exporter / cadvisor                             │
└──────────────────────────────────────────────────────────────────────┘
```

**Key invariant:** The VPS has zero build tooling. No JDK, no Node, no Maven, no build cache. It runs containers. Nothing else.

---

## 3. Operator Setup Requirements

This section is exclusively for Kat. These steps require human authentication and cannot be delegated to an agent.

### 3.1 Docker Hub Account Configuration

**[OPERATOR ACTION 3.1.1]** Log into hub.docker.com as `wintrykat`.

**[OPERATOR ACTION 3.1.2]** Create the following private repositories manually via the Docker Hub UI. Do not allow agents to infer repo names. Use these exact names:

| Repository | Purpose |
|---|---|
| `wintrykat/thekeyswitch-api` | Spring Boot application image |
| `wintrykat/thekeyswitch-web` | Next.js frontend image |
| `wintrykat/thekeyswitch-caddy` | Custom Caddy build with CrowdSec |
| `wintrykat/thekeyswitch-tools` | Reserved; create now to avoid future naming conflicts |

Set all repositories to **Private**.

**[OPERATOR ACTION 3.1.3]** Generate a Docker Hub Access Token for CI use:
- Navigate to: Account Settings → Security → New Access Token
- Name: `thekeyswitch-github-actions`
- Permissions: **Read & Write** (not Admin; the token must not be able to delete repos or manage account settings)
- Copy the token value immediately — it is shown only once

**[OPERATOR ACTION 3.1.4]** Generate a second Docker Hub Access Token for VPS pull-only use:
- Name: `thekeyswitch-vps-pull`
- Permissions: **Read-only**
- Copy the token value immediately

The reason for two tokens is the principle of least privilege. If the VPS is compromised, the attacker gets read-only registry access — they can pull existing images but cannot push malicious ones. If the CI token is leaked, it can be revoked without affecting the VPS, and vice versa.

**[OPERATOR ACTION 3.1.5]** Enable Docker Scout on the `thekeyswitch-api` and `thekeyswitch-web` repositories. This is done via the Docker Hub repository settings tab. Scout is included in paid plans at no additional cost.

### 3.2 GitHub Secrets Configuration

**[OPERATOR ACTION 3.2.1]** Navigate to the GitHub repository: `wintryKat/thekeyswitch-dot-com` → Settings → Secrets and variables → Actions.

**[OPERATOR ACTION 3.2.2]** Create the following repository secrets. Use these exact secret names, as the workflow files will reference them by name:

| Secret Name | Value Source | Notes |
|---|---|---|
| `DOCKERHUB_USERNAME` | Literal string: `wintrykat` | Username, not email |
| `DOCKERHUB_TOKEN` | Token from 3.1.3 | The CI read/write token |
| `VPS_HOST` | `212.38.95.37` | VPS IP address |
| `VPS_USER` | `root` or your sudo-capable username on the VPS | Confirm the actual user |
| `VPS_SSH_KEY` | Contents of the private key that matches the VPS deploy key | See 3.3 |
| `VPS_DEPLOY_PATH` | Absolute path to docker-compose.yml on VPS | e.g. `/opt/thekeyswitch` |

**[OPERATOR ACTION 3.2.3]** Confirm the value of `VPS_USER`. Run the following on your Windows machine to verify which user you SSH as:

```powershell
ssh thekeyswitch "whoami"
```

Record the output and use it as `VPS_USER`. Do not guess.

### 3.3 VPS Pre-Configuration for Pull

**[OPERATOR ACTION 3.3.1]** SSH to the VPS and log Docker in with the read-only pull token:

```bash
ssh thekeyswitch
echo "PASTE_VPS_PULL_TOKEN_HERE" | docker login --username wintrykat --password-stdin
```

This writes credentials to `/root/.docker/config.json` (or `~/.docker/config.json`). Docker Compose will use these credentials automatically when pulling private images. This login persists across reboots. It does not need to be re-run unless the token is revoked.

**[OPERATOR ACTION 3.3.2]** Verify the login worked:

```bash
docker pull wintrykat/thekeyswitch-api:latest
```

This will fail with "manifest unknown" until the first image is pushed, but it must NOT fail with "unauthorized" or "access denied". An auth failure here means the token was entered incorrectly or assigned the wrong permissions. Correct before proceeding.

**[OPERATOR ACTION 3.3.3]** Confirm the docker-compose.yml deployment directory path and record it as the value for `VPS_DEPLOY_PATH`. The agent needs this to know where to run `docker compose pull` during deploy.

### 3.4 Confirmation Checkpoint

Before signaling to any agent that setup is complete, Kat must be able to answer yes to all of the following:

- [ ] Four private Docker Hub repos exist under `wintrykat/`
- [ ] Two Docker Hub access tokens have been created and saved securely (e.g., in a password manager)
- [ ] Six GitHub Actions secrets have been set
- [ ] Docker login on the VPS succeeds without an auth error
- [ ] `VPS_DEPLOY_PATH` is known and set as a secret

If any item is unchecked, do not proceed to agent execution.

---

## 4. Repository Artifact Changes Required

This section describes every file the agent must create or modify in `wintryKat/thekeyswitch-dot-com`.

### 4.1 Dockerfile: Spring Boot API

**[AGENT ACTION 4.1.1]** Create `/backend/Dockerfile` (adjust path if the Spring Boot module lives elsewhere in the repo). Use a multi-stage build. Stage 1 extracts the layered JAR. Stage 2 is the runtime image.

```dockerfile
# Stage 1: Extract layers from fat JAR
FROM eclipse-temurin:21-jre-alpine AS builder
WORKDIR /app
COPY build/libs/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# Stage 2: Runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring

COPY --from=builder /app/dependencies/ ./
COPY --from=builder /app/spring-boot-loader/ ./
COPY --from=builder /app/snapshot-dependencies/ ./
COPY --from=builder /app/application/ ./

USER spring:spring

EXPOSE 8080

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
```

**Design notes for agent:** The layered extraction approach is not aesthetic — it ensures that Docker layer caching reuses the dependency layer (the largest layer) across builds where only application code changes. Without this, every build uploads the full 150–200 MB Spring Boot fat JAR to Docker Hub. With it, only the changed application layer (typically 1–5 MB) is uploaded. This matters for CI speed and Hub bandwidth.

The non-root user is a security requirement. CrowdSec on Caddy and Docker Scout will flag root-running containers.

### 4.2 Dockerfile: Next.js Frontend

**[AGENT ACTION 4.2.1]** Create `/frontend/Dockerfile`. Use the official Next.js standalone output pattern.

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

**[AGENT ACTION 4.2.2]** Verify that `/frontend/next.config.js` (or `.ts`) contains `output: 'standalone'`. If it does not, add it. Without standalone mode, `server.js` does not exist and the Dockerfile above will produce a broken image that starts and immediately exits.

```javascript
// next.config.js — agent must confirm this key exists
const nextConfig = {
  output: 'standalone',
  // ... other config
}
```

### 4.3 Dockerfile: Custom Caddy

**[AGENT ACTION 4.3.1]** Create `/caddy/Dockerfile`. This builds the xcaddy image with CrowdSec bouncer.

```dockerfile
FROM caddy:builder AS builder
RUN xcaddy build \
    --with github.com/hslatman/caddy-crowdsec-bouncer/http

FROM caddy:latest
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
```

**[AGENT ACTION 4.3.2]** Verify the CrowdSec bouncer module path has not changed from the value above. At document-writing time this is the correct import path, but Go module paths for community plugins can change. If the build fails with a module not found error, the agent must check `https://pkg.go.dev/github.com/hslatman/caddy-crowdsec-bouncer` and use the correct module path.

### 4.4 Docker Compose Changes

**[AGENT ACTION 4.4.1]** Update `docker-compose.yml`. Replace all `build:` directives with `image:` references. The agent must NOT delete any other configuration — volumes, networks, environment variables, health checks, and port mappings must be preserved exactly.

Before (example pattern):
```yaml
services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
```

After:
```yaml
services:
  api:
    image: wintrykat/thekeyswitch-api:latest
```

Apply this pattern to `api`, `web`, and `caddy` services. Any service using a standard public image (postgres, prometheus, node-exporter, cadvisor) must remain as-is — do not add image tags to them that don't already exist.

**[AGENT ACTION 4.4.2]** Add a `.env.example` file at the repo root (if not already present) documenting all environment variables consumed by Docker Compose. The actual `.env` file must never be committed.

### 4.5 .dockerignore Files

**[AGENT ACTION 4.5.1]** Create `/backend/.dockerignore`:

```
.git
.gitignore
*.md
.gradle
build/
!build/libs/*.jar
src/test/
```

**[AGENT ACTION 4.5.2]** Create `/frontend/.dockerignore`:

```
.git
.gitignore
node_modules
.next
*.md
.env*
!.env.example
```

---

## 5. GitHub Actions Workflow

### 5.1 Workflow File

**[AGENT ACTION 5.1.1]** Create `.github/workflows/deploy.yml`:

```yaml
name: Build, Push, and Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: docker.io
  API_IMAGE: wintrykat/thekeyswitch-api
  WEB_IMAGE: wintrykat/thekeyswitch-web
  CADDY_IMAGE: wintrykat/thekeyswitch-caddy

jobs:
  build-and-push:
    name: Build and Push Images
    runs-on: ubuntu-latest
    outputs:
      api_digest: ${{ steps.push-api.outputs.digest }}
      web_digest: ${{ steps.push-web.outputs.digest }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Extract metadata (API)
        id: meta-api
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.API_IMAGE }}
          tags: |
            type=raw,value=latest
            type=sha,prefix=sha-

      - name: Extract metadata (Web)
        id: meta-web
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.WEB_IMAGE }}
          tags: |
            type=raw,value=latest
            type=sha,prefix=sha-

      - name: Extract metadata (Caddy)
        id: meta-caddy
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.CADDY_IMAGE }}
          tags: |
            type=raw,value=latest
            type=sha,prefix=sha-

      - name: Set up JDK 21 (for Spring Boot build)
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: 'gradle'

      - name: Build Spring Boot JAR
        working-directory: ./backend
        run: ./gradlew bootJar --no-daemon
        # If using Maven, replace with: mvn -B package -DskipTests

      - name: Build and push API image
        id: push-api
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ steps.meta-api.outputs.tags }}
          labels: ${{ steps.meta-api.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push Web image
        id: push-web
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ${{ steps.meta-web.outputs.tags }}
          labels: ${{ steps.meta-web.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push Caddy image
        uses: docker/build-push-action@v5
        with:
          context: ./caddy
          push: true
          tags: ${{ steps.meta-caddy.outputs.tags }}
          labels: ${{ steps.meta-caddy.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Docker Scout vulnerability scan (API)
        uses: docker/scout-action@v1
        with:
          command: cves
          image: ${{ env.API_IMAGE }}:latest
          only-severities: critical,high
          exit-code: false
          # exit-code: true would fail the build on critical CVEs
          # Set to true once baseline is clean

      - name: Docker Scout vulnerability scan (Web)
        uses: docker/scout-action@v1
        with:
          command: cves
          image: ${{ env.WEB_IMAGE }}:latest
          only-severities: critical,high
          exit-code: false

  deploy:
    name: Deploy to VPS
    runs-on: ubuntu-latest
    needs: build-and-push

    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ${{ secrets.VPS_DEPLOY_PATH }}
            docker compose pull
            docker compose up -d --remove-orphans
            docker image prune -f
```

### 5.2 Workflow Design Rationale (for Agent Understanding)

The `build-and-push` and `deploy` jobs are intentionally separated with a `needs:` dependency. This ensures that if any image push fails, the deploy step never runs. The VPS is never instructed to pull images that may not exist yet.

`docker image prune -f` at the end of the deploy removes dangling images (previous `:latest` that has been superseded). On a 100 GB SSD VPS, accumulated dangling images are a real disk-space concern over time. This command is safe — it only removes images with no running container referencing them.

`exit-code: false` on Scout means Scout scan results are recorded but do not fail the build. This is intentional for the initial rollout period. Once a clean baseline is established, the operator should change this to `exit-code: true` for the `critical` severity tier.

GitHub Actions cache (`type=gha`) stores Docker build layers in the GitHub Actions cache, dramatically accelerating subsequent builds for the same branch. The Spring Boot dependency layer and the Next.js `node_modules` layer benefit most.

---

## 6. Image Tagging and Versioning Strategy

### 6.1 Tag Semantics

Every push to `main` produces two tags per image:

| Tag | Example | Meaning |
|---|---|---|
| `latest` | `wintrykat/thekeyswitch-api:latest` | Always points to current main |
| `sha-<hash>` | `wintrykat/thekeyswitch-api:sha-a1b2c3d` | Immutable reference to a specific commit |

The VPS `docker-compose.yml` uses `:latest`. This is deliberate — it makes the pull command simple and predictable. The SHA tags exist for rollback and audit purposes.

### 6.2 Rollback Procedure

**[OPERATOR ACTION 6.2.1]** To roll back to a previous build:

1. Identify the SHA tag you want from Docker Hub repository tag history
2. SSH to VPS
3. Edit `docker-compose.yml` to pin the specific service to the SHA tag, e.g., `image: wintrykat/thekeyswitch-api:sha-a1b2c3d`
4. Run `docker compose pull && docker compose up -d`
5. After confirming stability, revert the docker-compose.yml change and redeploy `:latest` from a fixed commit

**[AGENT ACTION 6.2.2]** An agent executing a rollback must treat it as a manually instructed operation only. An agent must never autonomously decide to roll back. The agent may suggest a rollback by naming the specific SHA tag, but execution requires explicit operator instruction.

---

## 7. Challenges and Risks

### 7.1 Spring Boot Build Failure in CI

**Risk:** The Spring Boot JAR build step (`./gradlew bootJar`) fails in GitHub Actions.

**Common causes:**
- `gradlew` is not executable. The file exists but has mode `644` instead of `755` in the repo.
- The build script assumes Maven but the project uses Gradle, or vice versa.
- Tests are run during the JAR build and fail. The workflow uses `-DskipTests` for Maven; ensure the Gradle equivalent (`-x test`) is added if test failures are blocking.
- Java version mismatch. The workflow pins Java 21 via `setup-java`. If `build.gradle` specifies a different `sourceCompatibility`, the build will error.

**Resolution path for agent:** Check the `backend/` directory for the presence of `gradlew` vs `mvn`. Adjust the workflow `run` command accordingly. If `gradlew` exists but builds fail, check `backend/build.gradle` for `sourceCompatibility` and `targetCompatibility` values and ensure they match Java 21.

**[ESCALATE] condition:** If `gradlew` and `pom.xml` both exist (Gradle wrapper + Maven coexistence), or neither exists, the agent cannot determine the build tool and must stop and ask the operator.

### 7.2 Next.js Standalone Mode Not Configured

**Risk:** The Next.js Dockerfile references `.next/standalone/server.js`, which only exists when `output: 'standalone'` is set in `next.config.js`. Without it, the container starts and immediately exits with a module not found error. This is silent — the container appears to start, then health checks fail, and Caddy returns 502 for all frontend routes.

**Resolution path for agent:** Before writing the Dockerfile, read `frontend/next.config.js` (or `.mjs`/`.ts`). If `output: 'standalone'` is missing, add it. This is a safe, non-breaking config addition. If `output` is set to a different value (e.g., `'export'` for static export), that is a conflict requiring operator decision — static export is incompatible with the standalone Docker pattern.

**[ESCALATE] condition:** `output: 'export'` is present. This means the project was configured for static file hosting, not server-side rendering. Switching to standalone changes the deployment model. The agent must not make this change without operator approval.

### 7.3 Docker Hub Authentication Failure on VPS

**Risk:** The VPS cannot pull private images because the Docker login from Section 3.3 was not performed, the token was entered incorrectly, or the token was subsequently revoked.

**Symptom:** `docker compose pull` on the VPS returns `Error response from daemon: pull access denied` or `unauthorized: authentication required`.

**Resolution path for agent:** The agent cannot fix this without operator action. The agent should:
1. Record the exact error message
2. Confirm whether `/root/.docker/config.json` (or `~/.docker/config.json`) contains an entry for `docker.io`
3. Surface the finding to the operator with the instruction to re-run the `docker login` command from Section 3.3.1

**[ESCALATE] condition:** Always. Docker Hub credential issues cannot be resolved by an agent.

### 7.4 VPS Disk Space Exhaustion

**Risk:** Over time, pulled images and dangling layers accumulate on the VPS 100 GB SSD. Each new deploy pulls a fresh `:latest`. Without pruning, disk usage grows unboundedly.

**Mitigation in place:** The `docker image prune -f` command in the deploy workflow removes dangling images after each deploy.

**Residual risk:** If multiple services are updated simultaneously, there may briefly be multiple generations of images on disk. The Spring Boot image is typically 250–400 MB. Next.js standalone is typically 150–300 MB. Two generations of each is approximately 1–1.5 GB. On 100 GB SSD with a healthy OS and logs, this is not dangerous.

**Monitoring:** The Prometheus + Node Exporter stack already planned for the VPS will track disk usage. An alert threshold of 80% disk utilization is recommended.

**[ESCALATE] condition:** If `df -h` on the VPS shows more than 85% disk utilization before beginning a deploy, the agent must stop and alert the operator before pulling new images. Pulling a 400 MB image onto a nearly-full disk can crash running containers.

### 7.5 CrowdSec Bouncer Module Path Change

**Risk:** The `caddy-crowdsec-bouncer` Go module is a third-party community plugin. Its import path or latest-compatible tag could change between the time this document was written and the time the Caddy Dockerfile is built.

**Symptom:** The Caddy image build fails with a Go module resolution error.

**Resolution path for agent:**
1. Check `https://pkg.go.dev/github.com/hslatman/caddy-crowdsec-bouncer` for the current module path
2. Update the `xcaddy build --with` argument in the Caddy Dockerfile
3. If the module has been replaced by a fork or successor, surface to operator before updating

**[ESCALATE] condition:** If the module no longer exists at all (repo deleted or archived), the entire Caddy plugin strategy requires re-evaluation. Agent must not substitute an alternative WAF module without operator approval.

### 7.6 GitHub Actions Runner Architecture Mismatch

**Risk:** GitHub Actions hosted runners are `linux/amd64`. The VPS is assumed to be `amd64` (standard Hostinger VPS architecture). If for any reason the VPS is `arm64` (unlikely for this provider but possible), images built for `amd64` will fail to run with an "exec format error".

**[AGENT ACTION]** Verify VPS architecture by running the following during any VPS-touching operation:
```bash
uname -m
```
Expected output: `x86_64` (meaning `amd64`). If the output is `aarch64`, multi-arch builds are required. Add `platforms: linux/amd64,linux/arm64` to the `docker/build-push-action` steps and use `docker buildx` with QEMU emulation. This significantly increases build time (3–10x for QEMU cross-compilation of Java).

### 7.7 Secret Rotation Risk

**Risk:** Docker Hub access tokens are long-lived credentials. If either the CI token (`DOCKERHUB_TOKEN`) or the VPS pull token is compromised:

- CI token compromise: An attacker can push malicious images to the `wintrykat/` repos. CI token is stored only in GitHub Actions secrets.
- VPS token compromise: An attacker can pull private images. They cannot push. VPS token is stored in `/root/.docker/config.json` on the VPS.

**Mitigation:**
- Tokens are separated by permission level (read/write vs read-only)
- Tokens are named specifically (easy to identify and revoke)
- Rotate both tokens every 90 days at minimum. This is an operator maintenance task.

**[OPERATOR ACTION]** Add a recurring calendar reminder for token rotation every 90 days. When rotating: revoke old token in Docker Hub, generate new token with same name, update GitHub Secret and re-run `docker login` on VPS.

### 7.8 Cost Exposure on Unexpected Plan Change

**Risk:** Docker Hub subscription tiers and pricing change. If the account is downgraded (e.g., payment failure), the account falls back to the free tier: 1 private repo max. The other three repos are not deleted, but they become inaccessible for pushes. Deploys that try to push to an inaccessible repo will fail in CI. Pulls from the VPS may continue until cached credentials expire.

**Resolution:** Keep payment method current. Monitor Docker Hub billing emails. If a billing failure occurs, fix the payment method before the next deploy, not during it.

**Additional cost scenarios:**
- Docker Scout SBOM (Software Bill of Materials) features above basic CVE scanning may require plan upgrade. Current paid personal plan includes basic Scout. Monitor usage to ensure stay within included limits.
- If the project requires storing very large images (>5 GB), Hub storage can be an issue. Spring Boot and Next.js images are well under this threshold under normal circumstances.

---

## 8. Implementation Sequence for Agents

This section is a strictly ordered checklist. An agent must not proceed to step N+1 until step N has a confirmed success state.

### Phase 0: Pre-flight Verification

- [ ] **0.1** Confirm operator has completed all `[OPERATOR ACTION]` items in Section 3
- [ ] **0.2** Confirm GitHub secrets exist by attempting to read their names (not values) via GitHub CLI or by operator confirmation. Do NOT attempt to read secret values.
- [ ] **0.3** SSH to VPS as a connectivity check: `ssh thekeyswitch echo "connection ok"`
- [ ] **0.4** Check VPS disk: `ssh thekeyswitch df -h /` — if >85% used, escalate immediately
- [ ] **0.5** Confirm VPS architecture: `ssh thekeyswitch uname -m` — expected `x86_64`
- [ ] **0.6** Check current `docker-compose.yml` for `build:` directives and document which services have them — this is the baseline before changes

### Phase 1: Dockerfiles

- [ ] **1.1** Read `backend/build.gradle` or `backend/pom.xml` to determine build tool
- [ ] **1.2** Read `frontend/next.config.js` to confirm `output: 'standalone'`
- [ ] **1.3** Create `backend/Dockerfile` per Section 4.1
- [ ] **1.4** Create `frontend/Dockerfile` per Section 4.2
- [ ] **1.5** Create `caddy/Dockerfile` per Section 4.3
- [ ] **1.6** Create `.dockerignore` files per Section 4.5
- [ ] **1.7** Commit all Dockerfiles to a new branch (do NOT commit directly to main yet)

### Phase 2: Docker Compose Update

- [ ] **2.1** On the branch, update `docker-compose.yml` per Section 4.4
- [ ] **2.2** Verify no other service configurations were accidentally modified (diff against main)
- [ ] **2.3** Commit the docker-compose change

### Phase 3: GitHub Actions Workflow

- [ ] **3.1** Create `.github/workflows/deploy.yml` per Section 5.1
- [ ] **3.2** Adjust the JAR build command (`gradlew bootJar` or `mvn package`) based on Phase 1.1 finding
- [ ] **3.3** Commit the workflow file

### Phase 4: Dry Run

- [ ] **4.1** Open a Pull Request from the working branch to main
- [ ] **4.2** GitHub Actions will run the workflow on the PR if configured to do so, OR
- [ ] **4.2-alt** Operator may choose to merge to main and observe the first live run
- [ ] **4.3** Monitor the workflow run. Check each step for errors.
- [ ] **4.4** Confirm images appear in Docker Hub under `wintrykat/` after a successful build

### Phase 5: VPS Validation

- [ ] **5.1** After images are pushed, SSH to VPS manually: `ssh thekeyswitch`
- [ ] **5.2** Navigate to deploy path: `cd $VPS_DEPLOY_PATH`
- [ ] **5.3** Run manually: `docker compose pull`
- [ ] **5.4** Confirm pull completes without auth errors
- [ ] **5.5** Run: `docker compose up -d`
- [ ] **5.6** Run: `docker compose ps` — all services must show `Up` or `running`
- [ ] **5.7** Run: `docker compose logs --tail 50 api` — confirm Spring Boot started without OOM or port binding errors
- [ ] **5.8** Curl the local Caddy endpoint to confirm routing: `curl -I http://localhost`

### Phase 6: Cleanup and Documentation

- [ ] **6.1** Confirm `docker image prune -f` removes expected dangling images on VPS
- [ ] **6.2** Update `ARCHITECTURE.md` to reflect the registry-backed deploy pattern
- [ ] **6.3** Record the image repository names and tagging strategy in project documentation

---

## 9. Failure Mode Reference

| Failure Mode | Observable Symptom | Root Cause | Resolution Owner |
|---|---|---|---|
| Spring Boot image fails to build | CI step red, `gradlew` or `mvn` error in logs | Build tool mismatch, missing executable bit, test failure | Agent (if deterministic) or Operator |
| Next.js container exits immediately | Container shows `Exited (1)` seconds after start | Missing `output: 'standalone'` in next.config | Agent |
| Docker Hub push fails 401 | CI step red, "unauthorized" in logs | `DOCKERHUB_TOKEN` secret missing or wrong | Operator |
| VPS pull fails 401 | Deploy step SSH output shows "unauthorized" | VPS docker login not completed or token revoked | Operator |
| VPS pull fails "manifest unknown" | `docker compose pull` says manifest not found | Image was never pushed (build phase failed silently) | Agent investigates CI logs |
| Service starts then immediately exits | `docker compose ps` shows `Restarting` | Application crash on startup, usually bad env var | Operator + Agent: check `docker compose logs <service>` |
| Caddy build fails with Go module error | CI step red, Go resolution error | CrowdSec module path changed | Agent (check pkg.go.dev), Operator if major change |
| Disk space error during pull | `docker compose pull` fails with "no space left on device" | VPS disk full | Operator: `docker system prune -a` after confirming no needed images |
| Wrong architecture | Container fails with "exec format error" | `arm64` VPS + `amd64` image | Agent adds multi-arch build; significant CI time increase |
| GitHub Actions SSH step fails | Deploy job red, SSH connection timeout or auth error | `VPS_SSH_KEY`, `VPS_HOST`, or `VPS_USER` secret wrong | Operator verifies and corrects secrets |

---

## 10. Agent Backout Protocol

This section defines the exact procedure an agent must follow when it encounters an unresolvable state. **This protocol exists to prevent an agent from taking destructive action under uncertainty.**

### 10.1 Conditions That Trigger Backout

An agent must trigger backout and stop all further actions when:

1. Any `[ESCALATE]` condition defined in this document is encountered
2. The agent cannot determine a fact that is required to proceed safely (e.g., cannot identify the build tool, cannot read a required file)
3. A change the agent has made causes a currently-running service to stop responding, and the agent cannot identify the cause within 3 diagnostic steps
4. The agent is asked to make a change that contradicts a decision documented in this file without explicit operator override
5. The agent receives an error it has not seen before and cannot find a matching failure mode in Section 9

### 10.2 Backout Steps

When backout is triggered:

**Step 1: Stop.**  
Do not make any further changes to the repository, the VPS, or any configuration. The current state, even if broken, is better than an unknown state.

**Step 2: Document what was done.**  
Produce a summary containing:
- The last N actions taken (commits, SSH commands, file edits)
- The exact error or ambiguity that triggered backout
- The state of any in-progress git branch (not yet merged to main)
- Whether any VPS services are currently degraded

**Step 3: Revert in-progress branch changes if they have not been merged.**  
If the agent was working on a feature branch and the branch has not been merged to main, the branch can be deleted or reset. This is safe because main is unchanged. If main was modified, list exactly which files were changed and provide a diff.

**Step 4: Restore VPS state if it was modified.**  
If `docker-compose.yml` on the VPS was modified and services are degraded, restore the previous `docker-compose.yml` from git and run `docker compose up -d`. The previous images are still present on the VPS (they were not pruned until after a successful new deploy).

**Step 5: Surface to operator.**  
Present the summary from Step 2 and a clear statement of what the agent needs to proceed:
- A decision (if the issue is ambiguity)
- An operator action (if the issue is credentials or infrastructure)
- A specification clarification (if the issue is a contradiction in documentation)

### 10.3 What the Agent Must Never Do During Backout

- Never run `docker system prune -a` — this removes images that may be needed to restore the VPS
- Never force-push to `main`
- Never revoke or rotate credentials (the agent does not have this access)
- Never attempt an alternative approach that was not specified in this document without surfacing it as a proposal first

### 10.4 Agent Self-Assessment: Topology Uncertainty

An agent operating in this environment may encounter situations where the repository structure does not match what this document describes. This is expected — the document was written against a planned architecture, and the repository is actively evolving.

**Protocol for structural uncertainty:**

1. Describe what the document says should exist
2. Describe what actually exists (file listing with paths)
3. Identify the specific delta
4. If the delta is additive (more files than expected), the agent may proceed cautiously and document assumptions
5. If the delta is subtractive (expected files are missing), the agent must stop and ask whether the missing component is not yet implemented or has been relocated

Example script for agent self-orientation on the VPS:
```bash
# Agent runs this first to understand what is deployed
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
docker compose config --services
ls -la $VPS_DEPLOY_PATH
```

If the output of this does not match the expected services (api, web, caddy, postgres, prometheus, node-exporter, cadvisor), the agent must reconcile the difference before making any deploy changes.

---

## 11. Summary Checklist for Full Adoption

### Operator must complete:
- [ ] 4 private Docker Hub repos created
- [ ] 2 Docker Hub access tokens created and stored
- [ ] 6 GitHub Actions secrets set
- [ ] Docker login performed on VPS with read-only token
- [ ] VPS deploy path confirmed and recorded
- [ ] Calendar reminder set for 90-day token rotation

### Agent must complete:
- [ ] `backend/Dockerfile` created (multi-stage, layered JAR, non-root user)
- [ ] `frontend/Dockerfile` created (standalone mode, non-root user)
- [ ] `caddy/Dockerfile` created (xcaddy + CrowdSec)
- [ ] `.dockerignore` files created for backend and frontend
- [ ] `docker-compose.yml` updated: all `build:` replaced with `image:`
- [ ] `.github/workflows/deploy.yml` created
- [ ] `ARCHITECTURE.md` updated to document registry-backed pattern
- [ ] All changes merged and first successful end-to-end deploy confirmed

### Confirmed working when:
- A push to `main` automatically builds all images, pushes to Docker Hub, and deploys to VPS without SSH intervention from the operator
- Rolling back to a previous build requires only editing `docker-compose.yml` to pin an SHA tag and running `docker compose up -d`
- The VPS has zero build tooling installed
- Docker Scout reports appear in CI run logs
