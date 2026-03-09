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

## Fingerprint Reference (for Gemini injection)

Use this compact block in identification prompts when a file's source is ambiguous:

```
Known fingerprints — identify by column headers if filename gives no clue:
- DistroKid (.tsv): headers include "Earnings (USD)", "Country of Sale", "Songwriter Royalties Withheld (USD)"
- SoundCloud for Artists (.csv): headers include "Revenue (USD)", "Revenue Share (%)", "Split Pay Share (%)" — rows 0-1 are preamble (Account ID + UUID), headers on row 2
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
| ASCAP | PRO | PDF + CSV variants — needs fingerprint |
| BMI | PRO | PDF + CSV variants — needs fingerprint |
| SoundExchange | CMO | CSV — needs fingerprint |
| MLC | CMO | Excel — needs fingerprint |
