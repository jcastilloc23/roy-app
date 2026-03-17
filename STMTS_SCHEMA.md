# STMTS_SCHEMA.md — Royalty Statement Format Registry

Living reference for known royalty statement formats. Each entry documents identification fingerprints, column mappings, and quirks.

**Two uses:**
1. Injected into Gemini prompts to ground identification and schema detection
2. Compiled into `src/lib/stmts-schema.ts` for zero-Gemini schema resolution on known formats

---

## How to Add a New Format

1. Add an entry below following the template
2. Add a matching entry to `src/lib/stmts-schema.ts` → `KNOWN_SCHEMAS`
3. If the source isn't already in the upload route's accepted list, add it

---

## Format Entries

---

### DistroKid

| Field | Value |
|-------|-------|
| **Canonical name** | DistroKid |
| **Aliases** | — |
| **Org type** | Distributor |
| **What they pay** | Mechanical royalties (streaming + download) |
| **Who they pay** | Sound recording rights holders (artists/labels) |
| **File extension** | `.tsv` |
| **File naming pattern** | Typically includes "distrokid" or artist name — not reliable for identification |
| **Header row** | `0` (0-indexed) |

**Column fingerprint** (ALL must be present to match):
```
["Earnings (USD)", "Country of Sale", "Songwriter Royalties Withheld (USD)"]
```

**Column mappings:**
| Canonical field | Exact column name |
|----------------|-------------------|
| `earnings` | `Earnings (USD)` |
| `streams` | `Quantity` |
| `store` | `Store` |
| `territory` | `Country of Sale` |
| `track` | `Title` |
| `period` | `Sale Month` |
| `artist` | `Artist` |

**Quirks:**
- `Store` column = the DSP (Spotify, Apple Music, etc.)
- `Quantity` = streams or download units depending on the store
- `Recoup (USD)` column tracks advance recoupment — deducted from earnings
- `Songwriter Royalties Withheld (USD)` reflects mechanical withholding for unregistered songs
- File is TSV (tab-separated), not CSV — use `\t` delimiter explicitly

---

### SoundCloud for Artists

| Field | Value |
|-------|-------|
| **Canonical name** | SoundCloud for Artists |
| **Aliases** | Repost by SoundCloud, Repost Network, SoundCloud Repost |
| **Org type** | Distributor |
| **What they pay** | Mechanical royalties (monetization + distribution) |
| **Who they pay** | Sound recording rights holders (artists/labels) |
| **File extension** | `.csv` |
| **File naming pattern** | `lifetime_statement_{uuid}_{YYYY-MM}_{hash}.csv` — **NO "SoundCloud" appears anywhere in filename or file content** |
| **Header row** | `2` (0-indexed) — rows 0–1 are preamble metadata |

**Preamble structure:**
```
Row 0: "Account ID","",...  ← label row
Row 1: "{uuid}","",...      ← UUID value row
Row 2: "Track","Artist(s)","Partner",...  ← ACTUAL HEADERS (header_row = 2)
```

**Column fingerprint** (ALL must be present to match):
```
["Revenue (USD)", "Revenue Share (%)", "Split Pay Share (%)"]
```

**Column mappings:**
| Canonical field | Exact column name |
|----------------|-------------------|
| `earnings` | `Revenue (USD)` |
| `streams` | `Units` |
| `store` | `Partner` |
| `territory` | `Country` |
| `track` | `Track` |
| `period` | `Reporting Period` |
| `artist` | `Artist(s)` |

**Quirks:**
- File has 2 preamble rows before actual column headers — `header_row = 2`
- `Partner` column = the DSP (Spotify, Apple Music, SoundCloud, etc.)
- `Revenue Share (%)` = the label/artist contractual split percentage
- `Split Pay Share (%)` = split payment percentage if using SoundCloud's split pay feature
- **Identification must rely entirely on column fingerprint** — the filename and file body contain no "SoundCloud" string
- When injecting into Gemini: tell it explicitly that SC4A files have no source name in filename or content

---

### ASCAP International

| Field | Value |
|-------|-------|
| **Canonical name** | ASCAP International |
| **Aliases** | ASCAP International Earnings |
| **Org type** | PRO (Performing Rights Organization) |
| **What they pay** | Public performance royalties for compositions |
| **Who they pay** | Songwriters and publishers (ASCAP members) |
| **File extension** | `.csv` (also delivered as companion `.pdf`) |
| **File naming pattern** | `{memberNumber}.csv` / `I_{stmtId}_{memberNumber}.pdf` — not reliable for identification |
| **Header row** | `0` (0-indexed) |

**Column fingerprint** (ALL must be present to match):
```
["Work Title", "Licensor", "$ Amount", "Revenue Class Description"]
```

**Column mappings:**
| Canonical field | Exact column name | Notes |
|----------------|-------------------|-------|
| `earnings` | `$ Amount` | Leading space in header; value is zero-padded — `parseFloat(val.trim())` |
| `streams` | `null` | PROs never report stream counts — do not compute or flag missing per-stream rates |
| `store` | `Licensor` | Foreign CMO/PRO that collected internationally (KODA, GEMA, FILSCAP, SAZAS, SGAE…) |
| `territory` | `Territory` | 2-letter ISO country code |
| `track` | `Work Title` | Song/composition title |
| `period` | `Performance Start Date` | Quarterly windows — pair with `Performance End Date` |
| `artist` | `Statement Recipient Name` | ASCAP member account receiving payment |

**Quirks:**
- `Party Name` = composer/songwriter — do **NOT** use for the `artist` field in summaries
- `Statement Recipient Name` = the ASCAP member being paid (use this as `artist`)
- `Revenue Class Description` = royalty context: "Other royalties", "Television", "Download - musical works"
- `Licensor` = foreign PRO/CMO collecting internationally on ASCAP's behalf — treat as `store`
- `$ Amount` column header has a **leading space** — the header is `" $ Amount"` not `"$ Amount"` in raw CSV; fingerprint uses the trimmed name for matching convenience, but parsers must account for the leading space
- Values in `$ Amount` are zero-padded strings — always `.trim()` before `parseFloat()`
- Quarterly cadence — performance windows are 3-month spans
- Both CSV and PDF are delivered together; identification must rely on column fingerprint, not filename

---

### ASCAP US

| Field | Value |
|-------|-------|
| **Canonical name** | ASCAP US |
| **Aliases** | ASCAP US Domestic Earnings |
| **Org type** | PRO (Performing Rights Organization) |
| **What they pay** | Public performance royalties for compositions — US domestic |
| **Who they pay** | Songwriters and publishers (ASCAP members) |
| **File extension** | `.csv` (also delivered as companion `.pdf`) |
| **File naming pattern** | `{memberNumber}.csv` / `I_{stmtId}_{memberNumber}.pdf` — not reliable for identification |
| **Header row** | `0` (0-indexed) |

**Column fingerprint** (ALL must be present to match):
```
["Work Title", "Number of Plays", "Dollars", "Performance Quarter"]
```

**Column mappings:**
| Canonical field | Exact column name | Notes |
|----------------|-------------------|-------|
| `earnings` | `Dollars` | Zero-padded string — `parseFloat(val.trim())` |
| `streams` | `Number of Plays` | Actual play count — usable for per-platform stream charts |
| `store` | `Music User` | DSP/platform name (e.g. "APPLE SUBSCRIPTION", "SPOTIR", "Amazon Music Unlimited") |
| `territory` | `Territory` | `"US"` for all rows in the domestic statement |
| `track` | `Work Title` | Song/composition title |
| `period` | `Performance Quarter` | Quarter format: `"2Q2025"` |
| `artist` | `Statement Recipient Name` | ASCAP member account receiving payment |

**Quirks:**
- `Party Name` = composer/songwriter — do **NOT** use for the `artist` field
- `Music User` values are uppercase platform names — normalize to display names when rendering (e.g. "SPOTIR" → Spotify, "APPLE SUBSCRIPTION" → Apple Music)
- `Dollars` is zero-padded (e.g. `" 00000000000000000.00019"`) — always `.trim()` before `parseFloat()`
- `Performance Quarter` format is `"NQyyyy"` (e.g. `"2Q2025"`) — parse as Q2 2025
- Unlike the International format, US rows have actual `Number of Plays` — per-platform stream charts are buildable
- `Licensor` column exists but contains `"S10"` (ASCAP's internal US code) — not a foreign CMO; do not use as store
- `EE Share` = the member's ownership percentage share (e.g. `"16.670"`) — useful for co-write scenarios
- `Performance Source/Broadcast Medium` = broadcast medium code (e.g. `"GN-IS"` for General Internet Interactive Self-Representing)

---

## Fingerprint Reference (for Gemini injection)

Use this compact block in identification prompts when a file's source is ambiguous:

```
Known fingerprints — identify by column headers if filename gives no clue:
- DistroKid (.tsv): headers include "Earnings (USD)", "Country of Sale", "Songwriter Royalties Withheld (USD)"
- SoundCloud for Artists (.csv): headers include "Revenue (USD)", "Revenue Share (%)", "Split Pay Share (%)" — rows 0-1 are preamble (Account ID + UUID), headers on row 2
- ASCAP International (.csv): headers include "Work Title", "Licensor", "$ Amount", "Revenue Class Description" — royalty_type is "performance"; no stream counts; artist = "Statement Recipient Name"; "$ Amount" has a leading space — trim before parsing
- ASCAP US (.csv): headers include "Work Title", "Number of Plays", "Dollars", "Performance Quarter" — royalty_type is "performance"; "Number of Plays" IS stream count; store = "Music User"; period = "Performance Quarter" (format "2Q2025"); artist = "Statement Recipient Name"; "Dollars" is zero-padded — trim before parsing
```

---

## Future Formats (placeholders — not yet documented)

| Source | Type | Notes |
|--------|------|-------|
| CD Baby | Distributor | CSV/Excel — needs fingerprint |
| TuneCore | Distributor | CSV — needs fingerprint |
| AWAL | Distributor | CSV — needs fingerprint |
| FUGA | Distributor | CSV/Excel — needs fingerprint |
| Spotify for Artists | DSP | CSV — direct from DSP, not distributor |
| Apple Music | DSP | Excel — needs fingerprint |
| BMI | PRO | PDF + CSV variants — needs fingerprint |
| SoundExchange | CMO | CSV — needs fingerprint |
| MLC | CMO | Excel — needs fingerprint |
