# Azure Cloud Services Integration Plan

**Date:** 2026-03-17
**Author:** Kat + Claude
**Status:** In progress
**Scope:** Extend thekeyswitch.com with Azure services to fill genuine gaps, improve infrastructure maturity, and provide cloud experience for interviews.

---

## Motivation

The site runs entirely on a single self-hosted VPS. This is the right architecture for the deployment's scale, and the decision to avoid Kubernetes is well-reasoned. However, several known limitations documented in SPECIFICATIONS.md Section 15 can be directly addressed by Azure cloud services. Each integration below solves a real problem first and provides an interview talking point second.

### Compromises being undone

These are listed in `docs/architecture/SPECIFICATIONS.md` Section 15 under "Compromises & Known Limitations":

| Limitation | Azure Service | Result |
|---|---|---|
| Contact form doesn't send email | Azure Functions + Azure Communication Services | Email actually sends |
| No file upload for switch images/sounds | Azure Blob Storage + CDN | Admin can upload and serve assets from edge |
| Secrets in .env files on VPS | Azure Key Vault | Centralized, auditable, rotatable secrets |
| No application-level distributed tracing | Application Insights | Request traces, error telemetry, dependency maps |

### What this is NOT

This plan does not replace the VPS with Azure hosting. The core application continues to run on the Hostinger VPS with Docker Compose. Azure services are integrated where they genuinely add value — creating a hybrid architecture that reflects how most real production systems operate.

---

## Phase 1 — Quick wins (free tier, days)

### 1A. Azure Function: Contact Form Email Delivery

**Problem:** The contact form at `/contact` validates input and returns success but doesn't actually send an email. This is listed as a known limitation.

**Solution:** An Azure Function App (Node.js runtime, Consumption plan) triggered by HTTP POST. The Spring Boot API (or the Next.js API route) calls the Function URL with the form payload. The Function sends the email via Azure Communication Services Email.

**Why a Function instead of SMTP in Spring Boot:** Decouples email delivery from the request lifecycle. The user gets an immediate response. The email sends asynchronously. If the Function fails, Azure retries it automatically. The Spring Boot API doesn't need SMTP dependencies or credentials. And serverless is a strong interview keyword.

**Architecture:**

```
Browser → Next.js /api/contact → Azure Function (HTTP trigger)
                                    → Azure Communication Services → Email to kat@thekeyswitch.com
                                    → Return 200 to caller
```

**Implementation:**

1. Create a Function App in Azure Portal (Node.js 20, Consumption plan, East US)
2. Create an Azure Communication Services resource with an email domain
3. Write the Function: validate payload, call ACS email SDK, return status
4. Update the Next.js `/api/contact/route.ts` to POST to the Function URL after validation
5. Store the Function URL and any ACS connection string as environment variables (later moved to Key Vault in Phase 2)

**Cost:** Function App Consumption plan — 1 million executions/month free. ACS Email — 100 emails/day free. For a portfolio contact form, this is effectively zero cost.

**New environment variables:**

| Variable | Purpose |
|---|---|
| `AZURE_CONTACT_FUNCTION_URL` | HTTP trigger URL for the contact form Function |

**Files changed:**
- `frontend/src/app/api/contact/route.ts` — add Function call after validation
- New: `azure/functions/contact-email/` — Function App code

**Tests:**
- Unit test the Function locally with Azure Functions Core Tools
- Integration test: submit the contact form and verify email arrives

---

### 1B. Azure Blob Storage + CDN: Switch Asset Hosting

**Problem:** Switch `imageUrl` and `soundSampleUrl` fields accept URLs but there's no upload mechanism. The admin panel can't manage switch media.

**Solution:** An Azure Storage Account with a Blob container (`switch-assets`) fronted by Azure CDN. The Spring Boot API exposes a mutation that generates a SAS (Shared Access Signature) URL for direct browser-to-blob upload. After upload, the CDN URL is stored in the switch record.

**Why direct-to-blob upload:** The browser uploads directly to Azure without proxying through the Spring Boot API. This keeps the API's memory footprint small on the 512MB-capped VPS. SAS tokens are time-limited (15 minutes) and scoped to a specific blob path, so they can't be reused or abused.

**Architecture:**

```
Admin Panel                          Azure
    |                                  |
    |-- GraphQL: requestUploadUrl() -->|
    |<-- { sasUrl, cdnUrl } ----------|
    |                                  |
    |-- PUT blob directly to sasUrl -->| Blob Storage
    |                                  |     |
    |-- GraphQL: updateSwitch(         |     v
    |     imageUrl: cdnUrl) ---------->| CDN endpoint
```

**Implementation:**

1. Create a Storage Account (Standard LRS, East US)
2. Create a Blob container `switch-assets` with public read access (blobs only)
3. Create a CDN profile and endpoint pointed at the Storage Account
4. Add `azure-storage-blob` dependency to the Spring Boot API
5. Write a new `AssetService` that generates SAS URLs
6. Add a `requestUploadUrl(filename: String!, contentType: String!): UploadUrlPayload!` GraphQL mutation
7. Build a simple upload component in the admin panel
8. Update the Caddyfile CSP `img-src` and `connect-src` to allow the CDN domain

**Cost:** Blob Storage — 5GB free for 12 months. CDN — 10GB outbound/month free. Switch assets are tiny (a few KB per image, a few hundred KB per sound sample). Effectively free.

**New environment variables:**

| Variable | Purpose |
|---|---|
| `AZURE_STORAGE_CONNECTION_STRING` | Storage Account connection string |
| `AZURE_STORAGE_CONTAINER` | Blob container name (`switch-assets`) |
| `AZURE_CDN_ENDPOINT` | CDN endpoint hostname |

**Files changed:**
- `api/build.gradle.kts` — add `azure-storage-blob` dependency
- New: `api/src/main/java/com/thekeyswitch/api/service/AssetService.java`
- New: `api/src/main/java/com/thekeyswitch/api/controller/AssetController.java` (GraphQL mutation)
- `api/src/main/resources/graphql/schema.graphqls` — add `requestUploadUrl` mutation and `UploadUrlPayload` type
- `caddy/Caddyfile` — update CSP for CDN domain
- Frontend admin panel — upload component (stretch goal for Phase 1, can defer)

---

## Phase 2 — Infrastructure maturity (free tier, ~1 week)

### 2A. Azure Key Vault: Centralized Secrets Management

**Problem:** Secrets live in `.env` on the VPS and in GitHub Actions secrets. This works but doesn't provide rotation, auditing, or centralized management. It's also the first thing an interviewer will ask about when you say "self-hosted."

**Solution:** An Azure Key Vault stores all application secrets. A startup script on the VPS pulls secrets from Key Vault into the container environment before `docker compose up`. The Spring Boot API can also read secrets directly via the Azure SDK at startup.

**Why a startup script (not direct SDK integration for everything):** Docker Compose environment variables need to be set before containers start. The Spring Boot API can use the Azure SDK directly, but the PostgreSQL container, Caddy, and CrowdSec all read plain environment variables. A thin `scripts/pull-secrets.sh` script that calls `az keyvault secret show` and writes to `.env.runtime` (gitignored) is the simplest approach that works for all containers.

**Secrets to migrate:**

| Secret | Current location | Key Vault secret name |
|---|---|---|
| `DB_PASSWORD` | `.env` on VPS | `db-password` |
| `JWT_SECRET` | `.env` on VPS | `jwt-secret` |
| `CROWDSEC_API_KEY` | `.env` on VPS | `crowdsec-api-key` |
| `AZURE_STORAGE_CONNECTION_STRING` | `.env` on VPS | `azure-storage-connection-string` |
| `AZURE_CONTACT_FUNCTION_URL` | `.env` on VPS | `azure-contact-function-url` |

**Implementation:**

1. Create a Key Vault (Standard tier, East US)
2. Install Azure CLI on the VPS (`curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash`)
3. Create a service principal for the VPS with `Key Vault Secrets User` role
4. Write `scripts/pull-secrets.sh` — authenticates with SP credentials, pulls secrets, writes `.env.runtime`
5. Update `docker-compose.yml` to use `env_file: .env.runtime`
6. Update the deploy script and GitHub Actions to run `pull-secrets.sh` before `docker compose up`
7. Migrate existing `.env` values into Key Vault
8. Optionally: add `azure-spring-cloud-starter-keyvault` to Spring Boot for direct SDK access

**Cost:** Key Vault Standard — 10,000 operations/month free. This project uses maybe 50 operations per deploy. Effectively free.

**Operator actions required:**
- Install Azure CLI on VPS
- Create service principal and assign Key Vault role
- Initial secret population in Key Vault

**New files:**
- `scripts/pull-secrets.sh` — Key Vault secret retrieval script

---

### 2B. Application Insights: Distributed Tracing

**Problem:** Prometheus handles infrastructure metrics but there's no application-level observability — no request traces, no error telemetry, no dependency maps. If a request is slow, there's no way to see where the time was spent across the Next.js → Spring Boot → PostgreSQL chain.

**Solution:** Application Insights SDK integrated into the Spring Boot API. This provides:
- Automatic request tracing (every GraphQL query/mutation)
- Dependency tracking (PostgreSQL queries, outbound HTTP calls to Prometheus)
- Exception telemetry with stack traces
- A live metrics stream in the Azure Portal
- Distributed tracing correlation IDs across services

**Why alongside Prometheus, not replacing it:** Prometheus excels at infrastructure metrics — CPU, memory, disk, container health. Application Insights excels at application traces — request latency percentiles, error rates, dependency maps, user flows. They serve different purposes. Keeping both demonstrates understanding of the observability landscape, not vendor lock-in.

**Implementation:**

1. Create an Application Insights resource (workspace-based, East US)
2. Add `applicationinsights-agent` to the Spring Boot Docker image (Java auto-instrumentation agent — no code changes needed for basic tracing)
3. Set the connection string as an environment variable
4. Optionally: add custom telemetry for specific operations (switch comparison queries, metrics proxy calls)

**Architecture:**

```
Application Insights (Azure)          Prometheus (VPS)
         |                                   |
    App traces                          Infra metrics
    Error telemetry                     CPU, memory, disk
    Dependency maps                     Container health
    Request latency                     Network I/O
         |                                   |
    Azure Portal                        /metrics page
```

**Cost:** Application Insights — 5GB/month ingestion free. A low-traffic portfolio site will use a fraction of that.

**New environment variables:**

| Variable | Purpose |
|---|---|
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | App Insights connection string |

**Files changed:**
- `api/Dockerfile` — download and attach the App Insights Java agent
- `docker-compose.yml` (or `.env`) — add connection string

---

## Phase 3 — Stretch goals (optional, has cost implications)

### 3A. Azure OpenAI Service: AI Guest Writer Pipeline

**Problem:** The blog's AI guest writer concept exists in the data model (`author_type: AI_AGENT`, `author_meta` JSONB) but there's no automated pipeline to generate posts from encounter documents.

**Solution:** An Azure OpenAI Service deployment (GPT-4o or equivalent) integrated into the admin panel's encounter import flow. When an encounter document is imported, the admin can click "Generate Draft Post" which sends the encounter content to Azure OpenAI and receives a structured blog post draft.

**Cost:** Azure OpenAI is pay-per-token. GPT-4o is approximately $5/million input tokens, $15/million output tokens. A single blog post generation from a 5,000-word encounter document costs roughly $0.05–0.15. At the scale of this project (a few posts per month), the cost is under $1/month.

**Implementation scope:** Admin panel UI button, a Spring Boot service that calls the Azure OpenAI REST API, and a prompt template that produces structured markdown with proper attribution metadata.

**Deferred until:** Blog has enough real content to justify the pipeline. The data model is already in place.

### 3B. Azure Front Door: Global Edge + WAF

**Problem:** CrowdSec provides WAF functionality but all traffic hits the VPS directly. There's no CDN for the HTML/JS/CSS assets, no geographic routing, and no DDoS protection beyond what CrowdSec and the hosting provider offer.

**Solution:** Azure Front Door Standard sits in front of the VPS IP, providing global edge caching, managed WAF rule sets (OWASP top 10), and DDoS protection.

**Cost:** Front Door Standard starts at ~$35/month. This is the only item in the plan with meaningful ongoing cost. Only recommended if the interview pipeline specifically requires Azure networking/CDN experience.

**Deferred until:** Explicit decision to invest in this capability.

---

## Cost Summary

| Service | Tier | Monthly cost |
|---|---|---|
| Azure Functions (Consumption) | Free tier | $0 |
| Azure Communication Services (Email) | Free tier | $0 (up to 100 emails/day) |
| Azure Blob Storage | Free tier (12 months) | $0 (up to 5GB) |
| Azure CDN | Free tier | $0 (up to 10GB outbound) |
| Azure Key Vault | Standard | $0 (up to 10K operations) |
| Application Insights | Free tier | $0 (up to 5GB/month) |
| Azure OpenAI (Phase 3) | Pay-per-use | ~$1/month at portfolio scale |
| Azure Front Door (Phase 3) | Standard | ~$35/month |

**Phases 1 and 2 total: $0/month on free tier.**

---

## Operator Actions Required

These must be completed before agent implementation begins.

### Azure account setup

1. **Confirm Azure subscription is active** — verify at https://portal.azure.com
2. **Install Azure CLI locally** — `winget install Microsoft.AzureCLI` (Windows) or `curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash` (WSL/Linux)
3. **Login** — `az login`
4. **Create a resource group** — `az group create --name thekeyswitch --location eastus`

### Phase 1 resources (agent can create these via CLI if `az` is available)

5. **Function App** — agent will create via `az functionapp create`
6. **Communication Services** — agent will create via `az communication create`
7. **Storage Account** — agent will create via `az storage account create`
8. **CDN Profile + Endpoint** — agent will create via `az cdn profile create`

### Phase 2 resources

9. **Key Vault** — agent will create via `az keyvault create`
10. **Application Insights** — agent will create via `az monitor app-insights component create`
11. **Install Azure CLI on VPS** — `ssh thekeyswitch "curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"`
12. **Create service principal for VPS** — agent will create and configure

---

## Implementation Sequence

### Phase 1 order:
1. Create resource group and Storage Account
2. Create Blob container and CDN
3. Implement `AssetService` and GraphQL mutation in Spring Boot
4. Create Function App and Communication Services resource
5. Write the contact email Function
6. Update Next.js contact route to call the Function
7. Update Caddyfile CSP for new domains
8. Test end-to-end

### Phase 2 order:
1. Create Key Vault
2. Populate Key Vault with existing secrets
3. Write `pull-secrets.sh`
4. Create Application Insights resource
5. Add App Insights agent to API Dockerfile
6. Update deploy pipeline
7. Verify traces appear in Azure Portal

---

## Interview narratives

Each integration provides a specific talking point:

**"How do you handle email delivery?"**
"The contact form validates on the frontend, then calls an Azure Function that sends via Azure Communication Services. The Function runs on a Consumption plan — I only pay when someone actually submits the form. The decoupled architecture means the API responds immediately and email delivery happens asynchronously with automatic retries."

**"How do you handle file uploads?"**
"The admin panel requests a SAS token from the API, then uploads directly to Azure Blob Storage — the file never passes through my server. The assets are served through Azure CDN. This keeps the API's memory footprint small, which matters on a VPS with a 512MB heap cap."

**"How do you manage secrets?"**
"All secrets are in Azure Key Vault. A startup script authenticates with a service principal and pulls secrets into the container environment before Docker Compose starts. The .env file on the VPS only contains the service principal credentials needed to authenticate with Key Vault — everything else comes from the vault. Rotation is a Key Vault update plus a container restart."

**"What's your observability story?"**
"Two layers. Prometheus with node-exporter and cAdvisor handles infrastructure metrics — CPU, memory, disk, container health. Application Insights handles application traces — request latency, error rates, and dependency tracking across the Next.js frontend and Spring Boot API. The /metrics page on the site shows the Prometheus data live. App Insights gives me the request-level view in the Azure Portal."

**"Why not just run everything on Azure?"**
"The VPS costs $10/month and runs 8 containers comfortably. Moving to Azure App Service or AKS would cost 5–10x more for the same workload with no reliability benefit for a single-origin deployment. I use Azure where cloud services genuinely add value — serverless for infrequent operations, managed storage for assets, centralized secrets, and distributed tracing. That's the same hybrid approach most enterprise systems use."
