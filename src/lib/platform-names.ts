/**
 * platform-names.ts — Canonical display name map for DSP/platform names.
 *
 * Raw platform names from royalty statements are often non-standard uppercase
 * strings (e.g. ASCAP US uses "SPOTIR" for Spotify). This map normalizes them
 * to canonical display names used throughout the UI and chart logic.
 *
 * Add new entries here as new statement formats are ingested — never inline
 * platform name mappings elsewhere.
 */

export const PLATFORM_DISPLAY_NAMES: Record<string, string> = {
  // ASCAP US "Music User" values
  "SPOTIR":                          "Spotify",
  "APPLE SUBSCRIPTION":              "Apple Music",
  "YOUTUBE PREMIUM - MUSIC CONTENT": "YouTube Music",
  "YOUTUBE MUSIC":                   "YouTube Music",
  "Amazon Music Unlimited":          "Amazon Music",
  "AMAZON MUSIC UNLIMITED":          "Amazon Music",
  "AMAZON PRIME MUSIC":              "Amazon Music",
  "TIDAL":                           "TIDAL",
  "PANDORA":                         "Pandora",
  "DEEZER":                          "Deezer",
  "IHEART":                          "iHeartRadio",
  "IHEARTRADIO":                     "iHeartRadio",
  "SOUNDCLOUD":                      "SoundCloud",
  "BOOMPLAY":                        "Boomplay",
  "TIKTOK":                          "TikTok",
  // Add more as new statement formats are ingested
};

/**
 * Returns the canonical display name for a raw DSP/platform string.
 * Falls back to the trimmed raw value if no mapping exists.
 */
export function normalizePlatform(raw: string | null | undefined): string {
  if (!raw) return "Unknown";
  const trimmed = raw.trim();
  return PLATFORM_DISPLAY_NAMES[trimmed] ?? trimmed;
}
