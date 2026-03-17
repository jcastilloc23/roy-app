/**
 * period-utils.ts — Period string normalization for royalty statement charts.
 *
 * Royalty statements use wildly different period formats depending on the source:
 *   - DSP/distributor: "2025-01" (YYYY-MM) or "2025-01-31" (YYYY-MM-DD)
 *   - ASCAP US: "2Q2025" (NQyyyy)
 *   - ASCAP International / other PROs: "03-31-2025" (MM-DD-YYYY, quarter end date)
 *
 * All outputs are one of two canonical formats:
 *   "YYYY-MM"  — monthly  (e.g. "2025-01") — sort/slice both work correctly
 *   "YYYY-Qn"  — quarterly (e.g. "2025-Q2") — sort/slice both work correctly
 */

/**
 * Normalize a raw period string to a canonical "YYYY-MM" or "YYYY-Qn" key.
 *
 * @param raw     Raw period string from the statement column
 * @param orgType Schema orgType — pass "pro" for PRO/CMO statements so that
 *                date strings are converted to quarters instead of months
 */
export function normalizePeriod(raw: string, orgType?: string): string {
  const s = raw.trim();

  // "NQyyyy" → "YYYY-Qn"  (ASCAP US Performance Quarter: "2Q2025" → "2025-Q2")
  const nq = s.match(/^(\d)Q(\d{4})$/i);
  if (nq) return `${nq[2]}-Q${nq[1]}`;

  // "MM-DD-YYYY" → "YYYY-Qn"  (ASCAP International Performance End Date: "03-31-2025" → "2025-Q1")
  const mdy = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (mdy) {
    const q = Math.ceil(parseInt(mdy[1]) / 3);
    return `${mdy[3]}-Q${q}`;
    // Note: MM-DD-YYYY only appears in PRO statements, so no DSP fallback needed
  }

  // Full date "YYYY-MM-DD" — keep monthly for DSPs, convert to quarter for PROs
  const dt = s.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (dt) {
    if (orgType === "pro" || orgType === "cmo") {
      const q = Math.ceil(parseInt(dt[2]) / 3);
      return `${dt[1]}-Q${q}`;
    }
    return `${dt[1]}-${dt[2]}`; // truncate to YYYY-MM for DSPs
  }

  // "YYYY-MM" — pass through unchanged
  return s;
}

/** Returns true if a period string is in YYYY-Qn canonical format */
export function isQuarterPeriod(p: string): boolean {
  return /^\d{4}-Q\d$/.test(p);
}
