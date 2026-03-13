# Logo + Home Page Redesign

**Date:** 2026-03-13
**Status:** Approved

---

## Logo

**Concept:** Abstract mark combining a mechanical key switch cross-section with witchy symbolism. The switch stem silhouette doubles as a pointed hat or crescent shape. Built from simple geometric forms — readable at 16px (favicon), scalable to hero placement.

**Palette:**
- Primary: deep plum/amethyst (~#7c3aed to ~#6b21a8 range, richer than current generic violet)
- Warm accent: soft gold/amber (~#d4a574 or ~#c9975c) for highlights, used sparingly
- Dark/light theme structure preserved, accent CSS variables updated

**Deliverables:**
- SVG mark (primary logo file)
- PNG fallback at reasonable resolution
- Favicon set: favicon.ico, PNG at 16, 32, 180, 192, 512px
- Installed in markup with proper `<link>` tags
- Old favicon.svg removed, all references updated

---

## Home Page

**Hero (full viewport):**
- New logo mark, prominently placed top-center
- "Kat Aurelia" animates in once on load (subtle fragment assembly or fade-up, ~1s)
- Static tagline: "Senior Software Engineer"
- Skills ticker cycling below: Angular, Node.js, TypeScript, AWS, Flutter, Python — smooth crossfade
- LinkedIn link (linkedin.com/in/kaurelia) + jobs@thekeyswitch.com
- "THEKEYSWITCH" repeated as faint watermark/texture behind the hero
- Subtle scroll-down indicator at bottom of viewport

**Below the fold:**
- Existing feature cards (switches, weather, XR, metrics, blog) — kept as-is

**Technical requirements:**
- All animations respect `prefers-reduced-motion` (static fallback)
- Full meta tags: Open Graph, Twitter Card, logo as preview image
- WCAG 2.1 AA contrast throughout
- Responsive: mobile, tablet, desktop
- No new dependencies — Tailwind CSS + vanilla CSS animations/transitions

**Palette update:**
- Update CSS variables in globals.css to new plum/amber palette
- Update Nav logo text color to match
- Existing pages keep their individual styles — only shared chrome (nav, footer, CSS vars) gets the palette shift
