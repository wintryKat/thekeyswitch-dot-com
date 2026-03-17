# Deployment Guide — thekeyswitch.com

Complete deployment pipeline from clean clone to live site. Written for both human developers and AI agents.

---

## Prerequisites

### Local Tools
- **Git** with SSH access to `git@github.com:wintryKat/thekeyswitch-dot-com.git`
- **Docker** and **Docker Compose** (for local builds/testing)
- **SSH** access to the VPS: `ssh thekeyswitch` (alias configured in `~/.ssh/config`)
- **GitHub CLI** (`gh`) authenticated with the repo (for setting secrets)

### SSH Config (local `~/.ssh/config`)
```
Host thekeyswitch
    HostName 212.38.95.37
    User root
    IdentityFile ~/.ssh/thekeyswitch
```

### VPS Requirements (already provisioned)
- Ubuntu 24.04 LTS
- Docker + Docker Compose plugin
- UFW firewall: ports 22, 80, 443
- Repo cloned at `/opt/thekeyswitch`
- `.env` file at `/opt/thekeyswitch/.env` (see below)

---

## Environment Variables

The `.env` file on the VPS (`/opt/thekeyswitch/.env`) must contain:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_USER` | PostgreSQL username | `thekeyswitch` |
| `DB_PASSWORD` | PostgreSQL password (strong, random) | `openssl rand -base64 32` |
| `JWT_SECRET` | JWT signing key (64+ chars, base64) | `openssl rand -base64 64` |
| `ADMIN_BOOTSTRAP_USERNAME` | Initial admin username | `admin` |
| `ADMIN_BOOTSTRAP_PASSWORD` | Initial admin password (remove after first login) | strong random password |
| `CROWDSEC_API_KEY` | CrowdSec bouncer API key | Generated after first `docker compose up` |
| `SPRING_PROFILES_ACTIVE` | Spring profile | `production` |
| `INTERNAL_ALLOWED_NETWORKS` | Actuator access CIDR list | `127.0.0.1/32,::1/128,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16` |

Use `.env.example` in the repo root as a template. **Never commit the `.env` file.**

### CrowdSec API Key (first-time setup only)
```bash
# Start CrowdSec first
docker compose up -d crowdsec
# Register the Caddy bouncer
docker exec thekeyswitch-crowdsec-1 cscli bouncers add caddy-bouncer
# Copy the generated key into .env as CROWDSEC_API_KEY
```

---

## GitHub Repository Secrets

Set these in GitHub: **Settings > Secrets and variables > Actions > Repository secrets**

| Secret | Value |
|--------|-------|
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Private key (ed25519) whose public key is in `/root/.ssh/authorized_keys` on the VPS |

To generate a new deploy key:
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy@thekeyswitch.com" -f deploy_key -N ""
# Add public key to VPS
cat deploy_key.pub | ssh thekeyswitch "cat >> /root/.ssh/authorized_keys"
# Set private key as GitHub secret
gh secret set VPS_SSH_KEY < deploy_key
# Set username
echo "root" | gh secret set VPS_USER
# Delete local key files
rm deploy_key deploy_key.pub
```

---

## Local Build Verification

### Full stack (Docker)
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
# Site available at http://localhost (Caddy) or http://localhost:3000 (Next.js direct)
```

### API tests only
```bash
cd api && ./gradlew test
```

### Frontend tests only
```bash
cd frontend && npm ci && npm test
```

---

## Deployment

### Automated (GitHub Actions)

**Trigger:** Push to `main` branch, or manual dispatch via Actions tab.

**Pipeline** (`.github/workflows/deploy.yml`):
1. **Test job**: Runs API tests (Gradle) and frontend tests (Vitest) in parallel
2. **Deploy job** (only on `main`): SSHs into VPS and runs:
   - `git pull --ff-only origin main`
   - `docker compose build --parallel`
   - Flyway migration repair (if needed)
   - `docker compose up -d`
   - `docker system prune -f`

**Concurrency:** Only one deploy runs at a time (`deploy-production` group).

### Manual (SSH fallback)
```bash
# From local machine
./scripts/deploy.sh

# Or manually
ssh thekeyswitch "cd /opt/thekeyswitch && \
  git pull --ff-only origin main && \
  docker compose build --parallel && \
  docker compose up -d && \
  docker compose ps"
```

---

## Verifying a Deployment

```bash
# Check all containers are running
ssh thekeyswitch "cd /opt/thekeyswitch && docker compose ps"

# Verify HTTPS and HTTP 200
curl -sI https://thekeyswitch.com | head -5
# Expected: HTTP/2 200

# Verify www redirect
curl -sI https://www.thekeyswitch.com | head -3
# Expected: HTTP/2 301, Location: https://thekeyswitch.com/

# Verify GraphQL API
curl -s https://thekeyswitch.com/graphql -H 'Content-Type: application/json' \
  -d '{"query":"{ __typename }"}' | head -1
# Expected: {"data":{"__typename":"Query"}}

# Check container health
ssh thekeyswitch "docker inspect --format='{{.State.Health.Status}}' thekeyswitch-api-1"
# Expected: healthy
```

---

## Rolling Back

```bash
ssh thekeyswitch "cd /opt/thekeyswitch && \
  git log --oneline -5 && \
  git checkout <previous-commit-hash> && \
  docker compose build --parallel && \
  docker compose up -d"
```

To return to latest `main` afterward:
```bash
ssh thekeyswitch "cd /opt/thekeyswitch && git checkout main && git pull"
```

**Note:** Database migrations (Flyway) are forward-only. If a migration needs reverting, write a new migration that undoes the changes.

---

## VPS Configuration Reference

### File Locations
| Path | Purpose |
|------|---------|
| `/opt/thekeyswitch/` | Project root (git clone) |
| `/opt/thekeyswitch/.env` | Environment variables |
| `/opt/thekeyswitch/caddy/Caddyfile` | Caddy reverse proxy config |
| Docker volume `caddy_data` | TLS certificates (Caddy auto-managed) |
| Docker volume `postgres_data` | PostgreSQL data |
| Docker volume `caddy_logs` | Caddy access logs (consumed by CrowdSec) |

### SSL/TLS
- **Provider:** Caddy automatic HTTPS (Let's Encrypt / ZeroSSL)
- **Renewal:** Automatic — Caddy renews certificates before expiry
- **Email:** `kat@thekeyswitch.com` (for Let's Encrypt notifications)
- **No cron jobs or certbot needed**

### Domains Served
All redirect to `https://thekeyswitch.com`:
- `www.thekeyswitch.com` (CNAME)
- `kat.so`, `kma.codes`, `katx.io`, `kataurelia.com`, `katherineaurelia.com` (A records)
- `wintrykat.org`, `wintrykat.com` — **DNS not yet pointed at VPS** (update A records to `212.38.95.37`)

### Services (Docker Compose)
| Container | Port | Purpose |
|-----------|------|---------|
| caddy | 80, 443 (public) | Reverse proxy, TLS termination, WAF |
| frontend | 3000 (internal) | Next.js application |
| api | 8080 (internal) | Spring Boot GraphQL API |
| db | 5432 (internal) | PostgreSQL database |
| crowdsec | — | Web Application Firewall |
| prometheus | 9090 (internal) | Metrics collection |
| node-exporter | 9100 (internal) | Host metrics |
| cadvisor | 8080 (internal) | Container metrics |

### Monitoring
No external monitoring configured. Prometheus collects metrics internally, viewable at `/metrics` on the site (proxied through the API's GraphQL layer).
