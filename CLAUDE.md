# CLAUDE.md — Roy App

Technical context for Claude Code. Keep this current as the project evolves.

---

## What This Project Is

Roy is a SaaS web app for music royalty transparency. Currently the codebase is a Next.js marketing site (port of the Mogul design) with Clerk auth scaffolded. The product vision is a full royalty reconciliation platform for independent artists, labels, and publishers.

See `PRD.md` for product vision. See `MARKET_OPPORTUNITY.md` for market research and ICP.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 + CSS custom properties |
| Auth | Clerk (`@clerk/nextjs` v7) |
| Runtime | React 19 |
| Linting | ESLint 9 |

Database: Supabase (Postgres). No backend API routes yet. No Stripe/billing yet.

---

## Directory Structure

```
roy_app/
  src/
    app/
      layout.tsx           # Root layout — ClerkProvider wraps everything here
      page.tsx             # Homepage (/)
      globals.css          # Global styles + CSS custom properties (design tokens)
      pricing/
        page.tsx           # Pricing page — 3-tier table (hardcoded, not yet wired to Clerk billing)
      (tool)/
        layout.tsx         # Tool shell layout (ToolNavbar, no marketing nav/footer)
        roy-tool/
          page.tsx         # Authenticated tool — statement upload, Artist/Label tabs
      royalty-finder/
        page.tsx           # Old royalty finder (kept for reference, superseded by /roy-tool)
      sign-in/             # Clerk sign-in route (scaffolded)
      sign-up/             # Clerk sign-up route (scaffolded)
      whos-it-for/         # Who It's For page (scaffolded, may be incomplete)
    components/
      Navbar.tsx           # Marketing site sticky navbar
      ToolNavbar.tsx       # App shell top navbar (Statements / Dashboard / Issues tabs + UserButton)
      Footer.tsx           # Footer with nav columns + social icons
      CookieBanner.tsx     # Cookie consent (localStorage-based)
      CounterSection.tsx   # Animated stat counters
  middleware.ts            # Clerk middleware (if present — check before assuming)
  MARKET_OPPORTUNITY.md    # Market research, ICP, competitive landscape
  PRD.md                   # Product requirements (living document)
```

---

## Design Tokens

All defined in `src/app/globals.css` as CSS custom properties. Use these — don't hardcode colors.

| Token | Value | Usage |
|-------|-------|-------|
| `--green` | `#00d47b` | Primary CTA, accents, brand color |
| `--green-dark` | `#00b869` | Hover states |
| `--bg` | `#05060a` | Page background |
| `--bg2` | `#0c0d13` | Card / section backgrounds |
| `--bg3` | `#111218` | Elevated surfaces |
| `--border` | `rgba(255,255,255,0.08)` | Dividers, card borders |
| `--text-muted` | `#8a8f9a` | Secondary / supporting text |

Font: Inter (loaded via `next/font/google`, set on `<html>` in layout).

---

## Auth & Billing — Clerk

`ClerkProvider` is in `src/app/layout.tsx`. `middleware.ts` is at project root. Clerk v7 installed.

**What's done:**
- `ClerkProvider` wrapping the app
- `middleware.ts` with `clerkMiddleware()`
- `sign-in/` and `sign-up/` route stubs
- Two plans created in Clerk dashboard (Roy Artist free, Roy Label $11/mo)
- `<PricingTable />` wired at `/subscribe`
- Pricing page CTAs point to `/subscribe`

**Env vars needed in `.env.local`:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

**Clerk feature identifiers (snake_case, set in dashboard):**
- Roy Artist: `statement_summaries`, `single_artist`, `three_sources`, `basic_analytics`
- Roy Label: `statement_summaries`, `unlimited_artists`, `unlimited_sources`, `reconciliation`, `discrepancy_detection`, `anomaly_alerts`, `advanced_analytics`

---

## Pricing Tiers

| Plan | Price | Billing |
|------|-------|---------|
| Roy Artist | Free | — |
| Roy Label | $11/mo | Monthly, cancel anytime |

Enterprise: soft CTA ("Let's talk") on `/pricing`, no self-serve.

---

## Database Schema — Supabase (Postgres)

Three tables in the `public` schema. All timestamps use `timestamptz`. All IDs are `uuid` with `gen_random_uuid()` default.

```
artists
  id          uuid        PK
  user_id     text        NOT NULL  — Clerk user ID; owner of this artist
  name        text        NOT NULL
  created_at  timestamptz NOT NULL  default: now()

statements
  id           uuid        PK
  user_id      text        — Clerk user ID
  status       text        default: 'pending' — pipeline states: pending → processing → complete → failed
  source_type  text        — file format hint (e.g. 'csv', 'pdf')
  file_name    text
  file_size    int8
  file_type    text        — MIME type
  uploaded_at  timestamptz default: now()

parsed_results
  id               uuid     PK
  statement_id     uuid     FK → statements.id       (cascade delete)
  artist_id        uuid     FK → artists.id           (cascade delete, nullable)
  user_id          text     — denormalised from statement for fast queries
  royalty_type     text     — 'mechanical' | 'performance' | 'sync' | 'digital_performance'
  source           text     — rights org name: 'Spotify' | 'ASCAP' | 'DistroKid' | etc.
  currency         text     default: 'USD'
  period_start     date
  period_end       date
  total_earnings   numeric
  track_count      int4
  summary          text     — plain-English AI-generated summary (Insights Layer output)
  flags            jsonb    default: '[]' — anomalies/discrepancies detected by parser
  normalized_data  jsonb    — structured royalty data extracted from the statement
  raw_claude_output jsonb   — raw LLM response, kept for debugging and prompt iteration
  parse_confidence float4   — 0.0–1.0; flag rows below threshold for manual QA
  created_at       timestamptz default: now()
```

**Key relationships:**
- `statements` is the root — no outbound FKs
- `parsed_results` references both `statements` and `artists`
- `artists` has no FK dependencies — created at onboarding, before any statements exist

**Conventions:**
- Always use `timestamptz`, never plain `timestamp`
- `flags` is a JSONB array — always starts as `[]`, never null; append anomalies as objects
- `normalized_data` is JSONB — document the expected shape before querying it in code
- `raw_claude_output` is append-only — never mutate it after write
- `status` on `statements` is the parsing pipeline state machine — update it as the job progresses

**Env vars needed (add to `.env.local`):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-side only, never expose to client
```

---

## Known Issues

- **`.next/routes-manifest.json` ENOENT error:** App needs to be built (`npm run build`) before `npm start`. Always use `npm run dev` in development. This error appears when trying to run the production server without a prior build.
- The `whos-it-for` page may be incomplete — verify before linking from nav.

---

## Conventions

- Pages use inline styles heavily (ported from Mogul's design). This is intentional for now — don't refactor to Tailwind classes unless asked.
- Components in `src/components/` are server-compatible unless they include `"use client"` at the top.
- CSS class names like `btn-primary`, `section-tag`, `container`, `page-hero` are defined in `globals.css`, not Tailwind.
- DB access uses the Supabase JS client (`@supabase/supabase-js`). No ORM. Query directly against the schema above.

---

## Dev Commands

```bash
npm run dev    # Development server (use this)
npm run build  # Production build
npm run start  # Production server (requires build first)
npm run lint   # ESLint
```
