/**
 * stmts-schema.ts — Typed registry of known royalty statement formats.
 *
 * Source of truth for humans: STMTS_SCHEMA.md (project root)
 * Source of truth for code: this file
 *
 * Keep both in sync when adding a new format.
 */

export interface ColumnMap {
  earnings: string | null;
  streams: string | null;
  store: string | null;
  territory: string | null;
  track: string | null;
  period: string | null;
  artist: string | null;
}

export interface StmtSchema {
  /** Canonical display name (e.g. "DistroKid", "SoundCloud for Artists") */
  name: string;
  orgType: "distributor" | "dsp" | "pro" | "cmo";
  /** 0-indexed row where column headers live */
  headerRow: number;
  /** ALL of these column names must be present in the headers to match */
  fingerprint: string[];
  columns: Partial<ColumnMap>;
}

export const KNOWN_SCHEMAS: StmtSchema[] = [
  {
    name: "DistroKid",
    orgType: "distributor",
    headerRow: 0,
    fingerprint: ["Earnings (USD)", "Country of Sale", "Songwriter Royalties Withheld (USD)"],
    columns: {
      earnings: "Earnings (USD)",
      streams: "Quantity",
      store: "Store",
      territory: "Country of Sale",
      track: "Title",
      period: "Sale Month",
      artist: "Artist",
    },
  },
  {
    name: "SoundCloud for Artists",
    orgType: "distributor",
    headerRow: 2,
    fingerprint: ["Revenue (USD)", "Revenue Share (%)", "Split Pay Share (%)"],
    columns: {
      earnings: "Revenue (USD)",
      streams: "Units",
      store: "Partner",
      territory: "Country",
      track: "Track",
      period: "Reporting Period",
      artist: "Artist(s)",
    },
  },
  {
    name: "ASCAP International",
    orgType: "pro",
    headerRow: 0,
    fingerprint: ["Work Title", "Licensor", "$ Amount", "Revenue Class Description"],
    columns: {
      earnings: "$ Amount",       // leading space + zero-padded — parse with parseFloat(val.trim())
      streams: null,              // PROs do not report stream counts
      store: "Licensor",          // foreign CMO/PRO that collected internationally (KODA, GEMA, SGAE…)
      territory: "Territory",     // 2-letter ISO country code
      track: "Work Title",
      period: "Performance End Date",   // MM-DD-YYYY quarter end date — 03-31=Q1, 06-30=Q2, 09-30=Q3, 12-31=Q4
      artist: "Statement Recipient Name", // ASCAP member receiving payment — NOT "Party Name" (composer)
    },
  },
  {
    name: "ASCAP US",
    orgType: "pro",
    headerRow: 0,
    fingerprint: ["Work Title", "Number of Plays", "Dollars", "Performance Quarter"],
    columns: {
      earnings: "Dollars",              // zero-padded string — parseFloat(val.trim())
      streams: "Number of Plays",       // actual play count — usable for per-platform charts
      store: "Music User",              // DSP/platform name (e.g. "APPLE SUBSCRIPTION", "SPOTIR", "Amazon Music Unlimited")
      territory: "Territory",           // "US" for all rows in domestic statement
      track: "Work Title",
      period: "Performance Quarter",    // quarter format: "2Q2025"
      artist: "Statement Recipient Name", // ASCAP member receiving payment — NOT "Party Name" (composer)
    },
  },
];

/**
 * Returns the first matching schema if ALL fingerprint columns are found in
 * the provided headers array. Returns null if no schema matches.
 *
 * Pass raw headers exactly as parsed from the file — comparison is case-sensitive
 * and character-for-character to match exact column names from the statement.
 */
export function matchSchema(headers: string[]): StmtSchema | null {
  const headerSet = new Set(headers);
  for (const schema of KNOWN_SCHEMAS) {
    if (schema.fingerprint.every(col => headerSet.has(col))) {
      return schema;
    }
  }
  return null;
}
