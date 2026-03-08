# PRD — Roy

**Product Requirements Document**
Status: Living document — update as the product and vision evolve.
Last updated: March 2026

---

## Mission

Be the AI-powered royalty expert for every independent rights holder — from the solo artist who just got their first Spotify statement to the indie label reconciling royalties across a 50-artist roster. Roy reads any royalty statement, in any format, and tells you exactly what it means, what's missing, and what to do about it.

---

## The Problem

The music royalty system is structurally broken for independent rights holders:

- Royalties are fragmented across 15+ DSPs, PROs, distributors, and CMOs — each delivering incompatible CSV/PDF formats with no shared standard
- Payment delays average 6–9 months, with some royalty types taking up to 18 months
- 20–50% of royalties are misallocated — owed but never arriving, or arriving wrong
- $424M in unmatched US mechanical royalties held by the MLC (2025)
- Manual reconciliation via spreadsheets is still the industry standard
- PROs (ASCAP, BMI, SoundExchange) pay quarterly with no API access for most indie labels

**The root cause is format chaos.** Spotify sends a 50,000-row CSV. ASCAP sends a quarterly PDF. DistroKid has its own export schema. None speak the same language. The label or artist has to manually translate all of them — or pay someone else to.

The money exists. The infrastructure to find it doesn't.

*See `MARKET_OPPORTUNITY.md` for full research, sizing, and source citations.*

---

## Who Roy Is For

### Roy Artist (Free)
An independent artist who receives royalty statements from their distributor, PRO, or label and doesn't fully understand them. They're not managing a roster — they just want to know if they're being paid correctly and what anything means.

**Core need:** Plain-English translation of a royalty statement. No finance background required.

### Roy Label (Paid)
A manager, catalog manager, or small label/publisher handling royalty oversight for multiple artists. Could be an independent manager, a small management company, or a one-person publishing admin operation. Deals with statements from multiple DSPs and PROs across 10–30+ artist catalogs.

**Core need:** Consolidated view across all artists, reconciliation across statements, anomaly detection, multi-source ingestion.

### Secondary (Expansion) Users
- Music CPAs and attorneys who advise indie clients — referral channel and potential partner tier
- Music distributors — white-label analytics for their indie label clients (scale path)
- Catalog investors — royalty due diligence and health reports

### Anti-ICP (Don't Target First)
- Major labels (Universal, Sony, Warner) — enterprise systems, multi-year contracts, 2+ year sales cycles
- Micro DIY artists with fewer than 100K streams/year — no budget, free tools suffice
- International-only labels — US-specific compliance (MLC, CRB) not relevant to them

---

## The Core Product Interaction

**Drag. Drop. Understand.**

The primary interface is a statement upload — any file, any format. The user drops in a royalty statement (CSV, PDF, XLS, scanned document). Roy's AI parsing engine:

1. Identifies what it is (Spotify mechanical, ASCAP performance, DistroKid summary, etc.)
2. Extracts and normalizes the data into Roy's unified royalty schema
3. Surfaces a plain-English summary of what the statement says
4. Flags anomalies — missing works, unexpected rate drops, unmatched ISRCs
5. Compares against expected amounts based on registered works and known rates

This is not a feature on top of a database — **it is the product**. Every other capability (reconciliation, benchmarking, the AI assistant, catalog valuation) is built on top of this parsing foundation.

**Why AI-first parsing is the right architecture:**
- No API access required — if a user can download the file, Roy can read it
- Works with any format, including legacy PDFs and scanned statements
- Bypasses the need for custom parsers for each of 15+ DSP/PRO schemas
- Gets smarter over time as more statement formats and edge cases flow through it
- The proprietary normalized dataset that accumulates is Roy's long-term moat

---

## AI Architecture — Layers

### Layer 1: Parsing Engine (Phase 1 Infrastructure)
LLM-powered document understanding. Reads any royalty statement format and outputs structured, normalized data. This is the core infrastructure that everything else runs on. Not user-facing directly — it's what happens when a file is dropped.

### Layer 2: Insights Engine (Phase 1 User-Facing)
Turns parsed data into human-readable output. "You earned $847 from Spotify in Q3. Your mechanical rate was $0.0023/stream, slightly below average. Three tracks appear in your DistroKid report but have no MLC registration detected." This is the "aha moment."

### Layer 3: Reconciliation Engine (Phase 1–2)
Cross-references multiple statements against each other and against registered works. Surfaces discrepancies: "This ISRC appears in your Spotify statement but not your SoundExchange report." Classifies findings as "probable error" vs. "confirmed underpayment."

### Layer 4: Assistant (Phase 2)
Conversational interface on top of the user's accumulated data. Natural language Q&A:
- *"Why did my ASCAP payment drop 40% this quarter?"*
- *"Which of my tracks are missing MLC registrations?"*
- *"Draft a dispute letter for this SoundExchange underpayment."*

### Layer 5: Benchmarking & Anomaly Detection (Phase 3)
Network-effect layer. Aggregate anonymized data across all Roy labels to surface systemic patterns: "Your Q3 SoundExchange payment is 22% below labels of similar size and genre — this pattern may indicate a rate dispute worth investigating." This is the data moat that compounds as Roy scales.

---

## Pricing Tiers

| Plan | Target User | Price | Core Value |
|------|-------------|-------|------------|
| **Roy Artist** | Solo independent artist | $0 | 1 artist, up to 3 report sources/month, plain-English summary |
| **Roy Label** | Managers, catalog managers, small labels | $11/mo | Unlimited artists, unlimited sources, full reconciliation, anomaly alerts |

**Paywall trigger for Roy Artist:** Hits when a second artist is detected across uploaded statements, OR when a 4th unique report source is added. The upgrade moment: *"You've connected 3 sources. Upgrade to Roy Label to add more sources or manage additional artists."*

**Enterprise lead capture:** Not a public tier. A soft CTA at the bottom of the pricing page — *"Managing a label or full roster? Let's talk."* — routes to a contact form. Builds pipeline without complicating the pricing decision for primary users.

*Prices are directional — validate via customer interviews and willingness-to-pay testing before locking in. See `MARKET_OPPORTUNITY.md` §11.*

*Note: Current marketing site shows Mogul's pricing (Collect $5/mo, Register $12.50/mo, Concierge $75/mo). These tiers and names need to be replaced before billing is wired up.*

---

## Product Phases

### Phase 0 — Marketing Site + Auth (Current)
What exists today. Goal: establish presence and validate demand before building product.

- Public pages: Home, Pricing, Royalty Finder, Who It's For
- Clerk auth scaffolded (sign-in / sign-up routes exist)
- **Next steps:** Wire up Clerk billing, finalize auth flows, add email capture/waitlist

---

### Phase 1 — AI Statement Reader (Core Wedge)
*The drag-and-drop parsing engine. This is Roy's reason to exist.*

- Statement upload interface (CSV, PDF, XLS — any format)
- AI parsing engine: identify, extract, normalize any royalty statement
- Plain-English summary of every uploaded statement (Insights Layer)
- Unified royalty ledger — all statements normalized into one schema
- Basic discrepancy detection: works appearing in one statement but not another
- **The "aha moment":** Within 15 minutes of first upload, Roy shows the user something about their royalties they didn't know

**Available at:** Roy Artist (1 artist, up to 3 sources/month), Roy Label (unlimited)

**Success signal:** A user discovers a real discrepancy or missing payment in their first session.

---

### Phase 2 — Reconciliation + AI Assistant
*Cross-statement reconciliation and conversational interface.*

- Cross-reference multiple statements against each other and against registered works
- Classify findings: "probable error" vs. "confirmed underpayment"
- PRO collections monitoring: ASCAP, BMI, SoundExchange, MLC payment tracking
- Alert on missing or late PRO payments
- AI Assistant: natural language Q&A on the user's royalty data
- Dispute letter generation

---

### Phase 3 — Network Effects + Benchmarking
*Where the data moat starts compounding.*

- Aggregate anonymized data across all Roy labels
- Benchmarking: "Your Spotify mechanical rate is 12% below labels of similar size and genre"
- Systemic anomaly detection: surface underpayment patterns that affect multiple labels
- Royalty health score — a single number summarizing collection efficiency
- Royalty calendar: expected payment schedule with alerts for late or missing payments

---

### Phase 4 — Sync Revenue Tracking
Track sync licensing income across placements (TV, film, ads, games). Feeds into the unified ledger.

---

### Phase 5 — Catalog Valuation
Royalty health reports for catalog sale / acquisition due diligence. Phase 1–3 data makes this a natural upsell — the reconciliation history and benchmarking data are the core inputs.

---

### Phase 6 — Distributor White-Label
Embed Roy's parsing and analytics layer as a white-label product for distributors (DistroKid, CD Baby, TuneCore, FUGA). Scale path to 10K+ indie labels via channel rather than direct sales.

---

## MVP Scope (Phase 0 → Phase 1)

**Immediate next steps (Phase 0 completion):**
- [ ] Update pricing page to reflect Roy Artist / Roy Label tiers (replace Mogul tiers)
- [ ] Wire up Clerk billing to Roy Artist (free) and Roy Label (~$49/mo)
- [ ] Polish sign-in / sign-up flows
- [ ] Post-login landing page (dashboard placeholder or waitlist confirmation)
- [ ] Email capture for waitlist

**Phase 1 build — in scope:**
- [ ] Statement upload interface (drag and drop)
- [ ] AI parsing engine (LLM-powered, format-agnostic)
- [ ] Plain-English statement summary (Insights Layer)
- [ ] Unified royalty ledger (normalized data store)
- [ ] Basic discrepancy detection

**Phase 1 build — out of scope:**
- DSP API integrations (file upload replaces this)
- Conversational assistant interface (Phase 2)
- Multi-label benchmarking (Phase 3)
- Anything requiring a proprietary data network (needs scale first)

---

## Open Questions

- What should the free tier's "aha moment" be for a solo artist who uploads their first Spotify statement?
- Should Phase 1 launch with a private beta / concierge approach (manually QA every parsing result) before opening self-serve?
- What LLM provider and architecture for the parsing engine? (Claude API is the natural fit given music-specific prompting needs)
- How does Roy handle statement data privacy and security? (SOC 2 will be required for B2B label sales)
- At what point does the free tier convert to a paid Manager plan? What's the upgrade trigger?

---

## Related Documents

- `MARKET_OPPORTUNITY.md` — Market sizing, ICP detail, competitive landscape, validation framework
- `CLAUDE.md` — Technical context, stack, conventions for development
