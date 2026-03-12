-- Seed data: 3 blog posts

-- 1. Human-authored architecture post (published)
INSERT INTO posts (slug, title, content, excerpt, author_type, author_name, author_meta, status, tags, reading_time_minutes, published_at, created_at, updated_at) VALUES
('building-thekeyswitch-architecture-decisions',
 'Building thekeyswitch.com: Architecture Decisions',
 E'# Building thekeyswitch.com: Architecture Decisions

Every project starts with a blank page and a mountain of choices. When I set out to build thekeyswitch.com, I wanted more than a static portfolio site. I wanted a living, breathing platform that demonstrates real engineering decisions --- the kind you make when building production systems at scale.

Here is the story of how this stack came together.

## Why Not Just Use a Template?

There are hundreds of portfolio templates. Vercel can deploy a Next.js site in seconds. So why build all this infrastructure?

Because the infrastructure *is* the portfolio. Anyone can deploy a template. The value is in demonstrating that you can design, build, and operate a complete system --- from database schema to reverse proxy configuration, from CI/CD pipelines to real-time observability.

## The API Layer: Spring Boot + GraphQL

I chose **Spring Boot** for the API for several reasons:

- **Type safety end-to-end**: Java''s type system catches entire categories of bugs at compile time. Combined with GraphQL''s schema, you get type safety from database to frontend.
- **Mature ecosystem**: Spring Security, Spring Data JPA, Flyway migrations --- these are battle-tested tools used by thousands of production systems.
- **Performance**: The JVM is remarkably fast for long-running server processes, especially with modern garbage collectors.

```java
@Controller
public class SwitchController {
    @QueryMapping
    public SwitchConnection switches(@Argument String type,
                                     @Argument String manufacturer,
                                     @Argument Integer page,
                                     @Argument Integer pageSize) {
        return switchService.getSwitches(type, manufacturer, page, pageSize);
    }
}
```

GraphQL was a natural fit because the frontend has varied data needs --- the switch comparison tool needs force curve arrays, the blog needs full markdown content, and the dashboard needs lightweight summaries. A single flexible API beats maintaining multiple REST endpoints.

## The Frontend: Next.js + Tailwind CSS

**Next.js** provides the best developer experience for React applications:

- **Server-side rendering** for SEO and initial load performance
- **App Router** with React Server Components for efficient data fetching
- **Built-in optimizations** for images, fonts, and bundle splitting

I paired it with **Tailwind CSS** because utility-first CSS scales beautifully. No more fighting specificity wars or maintaining a growing stylesheet. The design system is consistent because the constraints are built into the class names.

For data visualization, **D3.js** powers the interactive force curve charts. These aren''t static images --- you can hover over data points, compare multiple switches side by side, and see the exact force at any point in the keystroke travel.

## The Database: PostgreSQL

PostgreSQL was an easy choice:

- **JSONB columns** for flexible data like force curves and site configuration
- **Array columns** for tags without needing junction tables
- **Full-text search** capabilities for future blog search features
- **Rock-solid reliability** --- PostgreSQL doesn''t lose your data

The schema uses **Flyway** for version-controlled migrations. Every schema change is tracked, reproducible, and reversible. No more "just run this SQL on production" prayers.

```sql
CREATE TABLE switches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    force_curve JSONB,
    tags TEXT[] NOT NULL DEFAULT ''{}''
);
```

## Infrastructure: Docker Compose + Caddy

The entire stack runs as Docker containers orchestrated by **Docker Compose**. This gives us:

- **Reproducible deployments**: `docker compose up` gets you the exact same environment everywhere
- **Isolation**: Each service runs in its own container with defined resource limits
- **Easy scaling**: Need to add Redis caching? Add a service definition and you are done

**Caddy** serves as the reverse proxy and handles TLS certificates automatically via Let''s Encrypt. No more wrestling with nginx configurations or certbot cron jobs. Caddy''s configuration is about 20 lines compared to the equivalent nginx setup.

## Security: Defense in Depth

Security is not optional, even for a portfolio site:

- **CrowdSec** provides crowdsourced threat intelligence and automated IP blocking
- **JWT authentication** protects admin endpoints
- **CORS configuration** restricts API access to known origins
- **bcrypt password hashing** with appropriate work factors
- **Prepared statements** everywhere --- SQL injection is not a concern

## Observability: Prometheus + Custom Dashboard

You can''t fix what you can''t measure. The system exposes metrics to **Prometheus**, and a custom dashboard visualizes:

- CPU, memory, and disk usage
- Container-level resource consumption
- Network throughput
- System uptime and load averages

This isn''t just a demo feature. When the site is running on a VPS, these metrics help me understand resource usage patterns and capacity planning.

## What I Would Change

No architecture is perfect. If I were starting over:

1. **Add Redis caching** for frequently-accessed data like switch listings
2. **Implement WebSocket subscriptions** for real-time metric updates instead of polling
3. **Add integration tests** with Testcontainers for the full API layer
4. **Consider server-sent events** as a simpler alternative to WebSockets for one-way data flow

## Conclusion

Building thekeyswitch.com has been an exercise in making deliberate choices and understanding their trade-offs. Every component earns its place in the stack by solving a real problem.

The source code tells one story, but the architecture decisions tell another --- one about prioritizing maintainability, security, and developer experience. That is the story I wanted this project to tell.',
 'A deep dive into the technology choices behind thekeyswitch.com --- from Spring Boot and GraphQL to Docker Compose and Prometheus observability.',
 'human',
 'Kat',
 NULL,
 'published',
 ARRAY['architecture', 'spring-boot', 'graphql', 'docker', 'devops', 'nextjs'],
 7,
 '2026-02-15T10:00:00Z',
 '2026-02-14T18:30:00Z',
 '2026-02-15T10:00:00Z');

-- 2. AI guest writer post about force curves (published)
INSERT INTO posts (slug, title, content, excerpt, author_type, author_name, author_meta, status, tags, reading_time_minutes, published_at, created_at, updated_at) VALUES
('art-of-force-curves-understanding-switch-feel',
 'The Art of Force Curves: Understanding Mechanical Keyboard Switch Feel',
 E'# The Art of Force Curves: Understanding Mechanical Keyboard Switch Feel

If you have ever wondered why one keyboard switch feels "buttery smooth" while another has a satisfying "thock," the answer lives in a humble line graph called a **force curve**. Understanding force curves is the key to choosing the right switch for your typing style.

## What Is a Force Curve?

A force curve plots the relationship between two variables as you press a key:

- **X-axis**: Distance traveled (in millimeters), from resting position to fully bottomed out
- **Y-axis**: Force required (in grams-force) to push the stem to that depth

Every switch tells a different story through its curve. The shape reveals everything about how the switch will feel under your finger.

## Reading the Three Switch Types

### Linear Switches

Linear force curves are the simplest --- a nearly straight diagonal line from zero to bottom-out. The force increases steadily with no surprises.

```
Force (gf)
  60 |                    *
  45 |              *
  30 |        *
  15 |  *
   0 +--*--+--+--+--+--
     0  1  2  3  4  mm
```

The slope of the line determines how "light" or "heavy" the switch feels. Cherry MX Reds climb gently (45gf actuation), while Cherry MX Blacks have a steeper grade (60gf actuation). Linear switches are favored by gamers for their predictable, consistent response.

### Tactile Switches

Tactile curves feature a distinctive **bump** --- a peak followed by a dip in force. This bump provides physical feedback telling your finger "the keystroke registered" without needing to bottom out.

```
Force (gf)
  65 |        *
  55 |     *     *
  40 |  *           *
  30 |                 *
  15 |*                   *
   0 +--+--+--+--+--+--+--
     0  0.5 1  1.5 2  3  4 mm
```

The **height** of the bump determines how pronounced the feedback is. Cherry MX Browns have a subtle bump, while Holy Pandas and Zealios V2 switches deliver dramatic, rounded tactile events that are hard to miss.

The **shape** matters too. A sharp, narrow peak (like Boba U4T) feels crisp and snappy. A broader, rounder bump (like Zealios V2) feels smoother and more refined.

### Clicky Switches

Clicky switches combine a tactile bump with an audible click mechanism. Their force curves resemble tactile switches but with a steeper drop after the peak, corresponding to the click mechanism releasing.

The force curves of Kailh Box Jade and Box Navy switches show dramatic peaks followed by sharp drops --- this is the "thick click" that enthusiasts love. The clickbar mechanism creates a more satisfying sound than the traditional click jacket used in Cherry MX Blues.

## Key Metrics to Compare

When comparing switches, focus on these force curve characteristics:

1. **Actuation force**: The force at the actuation point. Lower values (35-45gf) are "light," higher values (55-70gf) are "heavy."

2. **Bottom-out force**: The maximum force at full compression. The gap between actuation and bottom-out affects how easy it is to accidentally bottom out.

3. **Tactile ratio**: For tactile switches, this is the peak force divided by the post-bump minimum. A higher ratio means more pronounced feedback.

4. **Pre-travel**: Distance before actuation. Shorter pre-travel (like Kailh Speed switches at 1.1mm) means faster response.

5. **Total travel**: The complete distance from rest to bottom-out. Standard is 4.0mm, but some switches use 3.4-3.6mm for quicker rebounds.

## How Force Curves Are Measured

Professional switch testers use a force gauge mounted on a linear actuator. The device presses the switch at a constant speed while sampling force readings hundreds of times per second. The resulting data points are plotted to create the curve.

On thekeyswitch.com, our interactive D3.js charts let you overlay multiple switch curves for direct comparison. You can hover over any point to see the exact force at that travel distance --- useful for understanding exactly where a tactile bump peaks or where a linear switch reaches its actuation point.

## Choosing Your Switch

There is no objectively "best" force curve. The right choice depends on your use case:

- **Gaming**: Light linears (Cherry MX Red, Gateron Yellow) for rapid key presses
- **Typing**: Medium tactiles (Holy Panda, Zealios V2) for satisfying feedback without fatigue
- **Programming**: Personal preference rules, but many developers enjoy tactile switches for the confirmation of each keypress
- **Office use**: Silent linears (Cherry MX Silent Red) or silent tactiles (Boba U4) to keep the peace

The beauty of the mechanical keyboard hobby is that force curves give us an objective framework for discussing something deeply subjective --- how a keypress *feels*.',
 'A comprehensive guide to reading and understanding mechanical keyboard switch force curves, from linear slopes to tactile bumps.',
 'ai_agent',
 'Claude',
 '{"model": "claude-sonnet-4-20250514", "provider": "Anthropic", "role": "Guest Writer", "note": "AI-generated content, reviewed and edited by Kat"}'::jsonb,
 'published',
 ARRAY['switches', 'force-curves', 'mechanical-keyboards', 'guide', 'ai-written'],
 5,
 '2026-02-22T14:00:00Z',
 '2026-02-21T20:00:00Z',
 '2026-02-22T14:00:00Z');

-- 3. Draft post about self-hosting (draft)
INSERT INTO posts (slug, title, content, excerpt, author_type, author_name, author_meta, status, tags, reading_time_minutes, published_at, created_at, updated_at) VALUES
('self-hosting-vs-cloud-why-i-chose-vps',
 'Self-Hosting vs Cloud: Why I Chose a VPS',
 E'# Self-Hosting vs Cloud: Why I Chose a VPS

When I started planning the infrastructure for thekeyswitch.com, I had three main options: a managed platform like Vercel or Railway, a cloud provider like AWS or GCP, or a plain old VPS. I chose the VPS, and here is why.

## The Case Against Managed Platforms

Managed platforms are excellent for shipping quickly. Vercel deploys Next.js apps effortlessly, and Railway makes backend services almost trivial to run. But they abstract away the very thing I wanted to demonstrate: **infrastructure knowledge**.

If the point of this project is to show that I can build and operate production systems, hiding behind a platform that handles everything defeats the purpose. I want to show that I understand reverse proxies, TLS termination, container orchestration, and monitoring --- not just that I can click "Deploy."

There is also the cost factor. For a portfolio site with moderate traffic, managed platforms can get expensive fast. A capable VPS costs a fraction of what equivalent managed services would charge, especially once you add databases, background workers, and monitoring.

## The Case Against Raw Cloud Providers

AWS, GCP, and Azure offer incredible power, but they come with incredible complexity. For a single-developer portfolio project, Kubernetes is overkill. ECS task definitions, IAM roles, VPC configurations, and CloudFormation templates add layers of abstraction that solve problems I do not have.

I considered using a simpler AWS setup --- just EC2 with RDS --- but the networking configuration alone would take more time than the application development. And the monthly cost for an RDS instance plus EC2 exceeds what a capable VPS provides.

## Why a VPS Works

A VPS gives me a Linux machine with root access. From there, I can:

- Run **Docker Compose** to orchestrate all services with a single command
- Configure **Caddy** as a reverse proxy with automatic HTTPS
- Set up **Prometheus** for metrics collection and monitoring
- Deploy **CrowdSec** for security threat detection
- Manage everything through **SSH** and **GitHub Actions** for CI/CD

The entire deployment is a `git push` that triggers a GitHub Actions workflow. The workflow SSHes into the VPS, pulls the latest code, rebuilds containers, and runs database migrations. Zero downtime deployments are achievable with Docker Compose rolling updates.

## Trade-offs I Accept

Self-hosting is not without downsides:

- **I am the on-call engineer.** If the server goes down at 3 AM, nobody else will fix it.
- **Backups are my responsibility.** I run automated PostgreSQL backups to off-site storage, but I had to set that up myself.
- **Scaling is manual.** If the site gets a traffic spike, I need to vertically scale the VPS or add load balancing.
- **Security patching** requires attention. Unattended upgrades handle most OS updates, but application-level security is on me.

For a portfolio project, these trade-offs are acceptable. The site does not need five nines of availability. What it needs is to demonstrate competence.

## The Stack in Practice

The production deployment looks like this:

```
VPS (Ubuntu 24.04)
+-- Docker Compose
    +-- caddy (reverse proxy + TLS)
    +-- api (Spring Boot + GraphQL)
    +-- web (Next.js frontend)
    +-- postgres (database)
    +-- prometheus (metrics)
    +-- crowdsec (security)
```

Total monthly cost: roughly $12 for a VPS with 2 vCPUs, 4GB RAM, and 80GB SSD. That runs the entire stack with room to spare.

## Conclusion

Choosing a VPS was a deliberate decision to optimize for learning and demonstration over convenience. Every problem I solve --- from configuring Caddy to setting up Prometheus alerts --- adds to my understanding of production infrastructure. And that understanding is exactly what this portfolio exists to showcase.',
 'Exploring the trade-offs between managed platforms, cloud providers, and self-hosted VPS infrastructure for a portfolio project.',
 'human',
 'Kat',
 NULL,
 'draft',
 ARRAY['infrastructure', 'devops', 'self-hosting', 'vps', 'docker'],
 4,
 NULL,
 '2026-03-01T09:00:00Z',
 '2026-03-05T16:30:00Z');
