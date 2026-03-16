# Roy — Design System & UX Skill Doc

> **One-liner**: Drag. Drop. Understand.
> **Stack**: SaaS web app for music royalty transparency and reconciliation.
> **Audience**: Independent artists and small labels who are non-technical but financially literate. They’re frustrated, not stupid.

-----

## 1. Product Personality & Tone

Roy sits at the intersection of **fintech clarity** and **music culture**. It should feel like the smartest person in the room who also has good taste — not a generic B2B tool.

|Axis       |Roy is…                            |Roy is NOT…                          |
|-----------|-----------------------------------|-------------------------------------|
|Voice      |Direct, confident, warm            |Corporate, jargon-heavy              |
|Visual     |Refined, modern, a little editorial|Playful/cartoonish OR cold/enterprise|
|Interaction|Fast, frictionless, forgiving      |Slow, modal-heavy, intimidating      |
|Feedback   |Honest and specific                |Vague or overly positive             |

**The emotional arc of a session**: Confusion → Drop → Relief → Clarity → Action.
Every screen should move the user one step forward on that arc.

-----

## 2. Aesthetic Direction

### Core Visual Identity

- **Theme**: Dark-first. Royalty statements are associated with frustration and opacity — Roy’s dark UI signals “we’ve got this under control.” Light mode available but dark is primary.
- **Color palette**:
  
  ```
  --roy-bg:         #0D0D0F       /* near-black, not pure black */
  --roy-surface:    #16161A       /* cards, panels */
  --roy-surface-2:  #1E1E24       /* elevated surfaces */
  --roy-border:     #2A2A35       /* subtle borders */
  --roy-accent:     #C8FF00       /* electric chartreuse — the signal color */
  --roy-accent-dim: #8FAF00       /* muted accent for secondary use */
  --roy-text:       #F0F0F0       /* primary text */
  --roy-text-muted: #7A7A8C       /* secondary, labels, metadata */
  --roy-success:    #22C55E
  --roy-warning:    #F59E0B
  --roy-error:      #EF4444
  --roy-highlight:  #C8FF0015     /* accent at ~8% opacity for backgrounds */
  ```
- **Typography**:
  - Display / headings: `DM Serif Display` or `Playfair Display` — gives Roy editorial gravitas; music has history
  - Body / UI: `DM Mono` or `IBM Plex Mono` for data/numbers, `DM Sans` for prose UI text
  - Monospace is intentional: royalty data IS tabular and precise, mono reinforces that
  - Never use Inter, Roboto, or Arial
- **Motion**:
  - Upload interaction: smooth drag-over glow pulse on the drop zone (accent color bloom)
  - Data reveal: staggered fade-in for rows/cards as AI analysis loads (never a blank loading spinner alone — show skeleton structure)
  - Micro-interactions: button press = subtle scale-down (0.97), hover = accent underline or background tint
  - Page transitions: fade through black (fast, ~150ms) — feels deliberate
- **Spatial composition**:
  - Generous negative space on landing / hero
  - Dense but organized on data/analysis screens (think: Bloomberg terminal meets Notion)
  - Left-aligned text throughout — never centered body copy
  - Grid: 12-column, with gutters at 24px. Cards at 8px border-radius max — keep it tight, not bubbly

-----

## 3. Core UX Principles for Roy

### 3.1 The Drop Zone is Sacred

The upload experience is Roy’s #1 moment of truth. It must:

- Be the **first thing visible** on the dashboard — full-width or prominent above the fold
- Support drag-and-drop AND click-to-upload, always both
- Show clear accepted formats: CSV, PDF, XLSX — displayed as small badges
- Animate on hover/drag-over: accent glow, border lights up, subtle label change (“Drop it”)
- Give **immediate feedback** on drop: file name, size, and a “Reading…” state with a progress indicator
- Never make the user wait in silence — show AI status messages as it processes (“Parsing Spotify statement…”, “Identifying royalty types…”, “Cross-referencing periods…”)

### 3.2 Clarity Over Completeness

Roy’s users don’t need to see everything — they need to see what matters.

- Lead with **anomalies, gaps, and actions** — not raw numbers
- Every data view should answer: *“What do I need to know, and what do I do about it?”*
- Use progressive disclosure: summary card → expand for detail → drill into raw data
- Never show a table without a summary headline above it (“You earned $1,240.18 from Spotify in Q3 — but 3 streams are unmatched”)

### 3.3 Plain Language, Always

- Translate royalty jargon immediately. If a term appears, it should have an inline tooltip or plain-language equivalent.
- Error states and empty states should tell the user exactly what happened and what to do next — never “Something went wrong.”
- Amounts: always show currency symbol, use locale-aware formatting (`$1,240.18` not `1240.18`)

### 3.4 Trust is the Product

Artists are already burned by opacity. Roy earns trust through:

- Showing its work: when Roy flags something, explain WHY (“This payment is 23% below your expected rate for this territory”)
- Confidence indicators: where AI confidence is lower, show it honestly (“We’re ~80% confident this maps to your mechanical royalties”)
- No dark patterns: never bury bad news, never make it hard to export your own data
- Data provenance: always show which original statement a finding came from

### 3.5 Mobile-Aware, Desktop-First

- Core workflows (upload, review, reconcile) are desktop-optimized — users are at their desk doing financial review
- Mobile should support: viewing summary results, reading notifications, sharing a report
- Responsive breakpoints: 1280px (wide), 1024px (standard), 768px (tablet), 375px (mobile)

-----

## 4. Component Patterns

### Upload / Drop Zone

```
┌─────────────────────────────────────────────┐
│  ↑  Drag your royalty statement here        │  ← accent border, dashed
│     or click to upload                      │
│                                             │
│     CSV  •  PDF  •  XLSX                   │  ← format badges
└─────────────────────────────────────────────┘
```

- Default state: dashed accent-colored border, muted interior
- Hover/drag state: accent glow, border solid, background `--roy-highlight`
- Processing state: solid border, animated progress bar, status text updates

### Statement Card (post-upload summary)

```
┌──────────────────────────────────────┐
│ Spotify Q3 2024          ↗ Details  │
│ $1,240.18  •  847 streams           │
│ ────────────────────────────────    │
│ ⚠ 3 unmatched tracks               │  ← warning in amber
│ ✓ Period complete                   │
└──────────────────────────────────────┘
```

### Insight / Alert Component

- 3 levels: Info (blue), Warning (amber), Action Required (accent/chartreuse)
- Always include: what happened, why it matters, what to do
- Dismissible only for Info; Warning and Action Required persist until resolved

### Navigation

- Left sidebar (desktop): logo, main nav items (Dashboard, Statements, Reconciliation, Reports, Settings)
- Max 6 nav items — no nested nav unless absolutely necessary
- Active state: accent left-border + slight background tint
- Collapse to icon-only at 1024px

### Data Tables

- Monospace font for all numeric columns
- Zebra striping using `--roy-surface` / `--roy-surface-2`
- Sticky header on scroll
- Row hover: `--roy-highlight` background
- Always include: export button (CSV), column sort, search/filter
- Empty state: not just “No data” — explain what should be here and how to add it

### Buttons

```
Primary:   bg=accent, text=black, font-weight=600
Secondary: bg=surface-2, text=primary, border=border
Ghost:     bg=transparent, text=muted, hover=surface
Danger:    bg=error at 15% opacity, text=error, border=error
```

- All buttons: 8px border-radius, 40px height (standard), 32px (compact)
- Loading state: spinner replaces label, button disabled, width locked to prevent layout shift

-----

## 5. UX Heuristics Checklist (run this on every new screen)

Based on Nielsen’s 10 Usability Heuristics, applied to Roy:

- [ ] **Status visibility**: Does the user know what Roy is doing right now? (upload progress, AI analysis state, loading)
- [ ] **Real-world language**: Are royalty terms translated to plain English? No DSP jargon without explanation.
- [ ] **User control**: Can the user undo, go back, or cancel any action without losing progress?
- [ ] **Consistency**: Do buttons, labels, and patterns match what’s used elsewhere in Roy?
- [ ] **Error prevention**: Are destructive actions (delete, overwrite) confirmed? Are invalid uploads caught early with helpful messages?
- [ ] **Recognition over recall**: Does the UI surface the relevant context so the user doesn’t have to remember info from a previous screen?
- [ ] **Efficiency**: Can a returning user complete their core task (upload → review → export) in under 3 minutes?
- [ ] **Minimalism**: Is every element on this screen earning its place? Remove anything decorative that doesn’t aid comprehension.
- [ ] **Error recovery**: If something goes wrong, does Roy explain what happened and offer a clear next step?
- [ ] **Trust signals**: Is it clear where this data came from and how confident Roy is in its analysis?

-----

## 6. Key User Flows

### Flow 1: First Upload (new user)

1. Landing on dashboard → prominent drop zone + “Start with your first statement”
1. Upload → immediate acknowledgment + processing status
1. Analysis complete → Statement Card appears with summary + top 3 insights
1. CTA: “Review full breakdown” → detailed view
1. Secondary CTA: “Upload another statement” (for reconciliation)

### Flow 2: Reconciliation (returning user)

1. Dashboard → existing statements visible as cards
1. “Reconcile” action → select 2+ statements to compare
1. Roy shows: matches, gaps, discrepancies with explanations
1. User can mark items as resolved, flag for follow-up, or export report

### Flow 3: Export / Share

- Always available from any data view via top-right toolbar
- Formats: PDF summary report, CSV raw data
- Shareable link option (view-only, with expiry)

-----

## 7. Writing Style Guide

- **Headings**: Title case, declarative (“Your Q3 Earnings” not “Q3 Earnings Overview”)
- **CTA copy**: Action verbs, specific (“Upload Statement”, “Review Breakdown”, “Export Report” — not “Submit”, “Continue”, “Go”)
- **Empty states**: Warm and instructional (“No statements yet — drop your first one above to get started”)
- **Error messages**: Specific and actionable (“We couldn’t read this PDF — try exporting it as a CSV from your DSP dashboard instead”)
- **AI analysis copy**: Confident but not overclaiming (“Roy found 3 items that may need your attention” not “Roy detected 3 errors”)
- **Numbers**: Always formatted, always with context (”$1,240.18 from Spotify — up 12% from Q2”)

-----

## 8. What to Avoid

- ❌ Purple gradients, generic SaaS blues, white-on-white cards
- ❌ Modals for everything — use inline states, drawers, or expandable sections
- ❌ Long onboarding flows — get the user to the drop zone in one click
- ❌ Vague feedback (“Processing…”, “Error occurred”, “Something went wrong”)
- ❌ Hiding data — if Roy has it, the user should be able to access it
- ❌ Rounded everything — Roy is precise, keep border-radius tight (4–8px)
- ❌ Centered layouts for data-heavy screens — always left-align
- ❌ Generic placeholder copy (“Lorem ipsum”, “User Name”, “Click here”)

-----

*This document is a living reference. Update it as Roy’s design evolves. When in doubt, ask: does this make the artist feel like they finally understand what’s going on?*