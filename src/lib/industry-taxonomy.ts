export type RoyaltyType =
  | "mechanical"
  | "performance"
  | "sync"
  | "digital_performance"
  | "digital_distribution"
  | "neighboring_rights"
  | "unknown";

interface TaxonomyEntry {
  category: string;
  royalty_type: RoyaltyType;
  rights: string;
  pays_to: string;
  note: string;
  sources: string[];
}

const TAXONOMY: TaxonomyEntry[] = [
  {
    category: "Distributor",
    royalty_type: "digital_distribution",
    rights: "sound recording (master)",
    pays_to: "master rights holders — artists and indie labels",
    note: "Distributor statements bundle interactive streams, downloads, and neighboring rights collected on the master. Do NOT classify as mechanical. DistroKid statements include a 'Songwriter Royalties Withheld' column — this is composition mechanical withheld at source, not the primary royalty type of the statement.",
    sources: [
      "DistroKid", "CD Baby", "TuneCore", "AWAL", "FUGA", "Amuse",
      "SoundCloud for Artists", "Repost by SoundCloud", "ONErpm",
      "Stem", "Revelator", "SubmitHub",
    ],
  },
  {
    category: "DSP (direct deal)",
    royalty_type: "digital_distribution",
    rights: "sound recording (master)",
    pays_to: "master rights holders — usually major labels or large independents with direct licensing deals",
    note: "Direct DSP statements are rare for independent artists, who typically receive distributor statements instead. Classify direct DSP statements the same as distributor statements — they cover sound recording royalties only.",
    sources: [
      "Spotify", "Apple Music", "YouTube Music", "Amazon Music",
      "TIDAL", "Deezer", "Pandora",
    ],
  },
  {
    category: "PRO (Performing Rights Organization)",
    royalty_type: "performance",
    rights: "composition (publishing)",
    pays_to: "songwriters and publishers",
    note: "PROs collect and distribute public performance and broadcast royalties for compositions. They do NOT pay sound recording rights. SoundExchange is not a PRO — do not list it here. IMPORTANT: PRO statements do NOT include stream counts — never compute or flag missing per-stream rates for PRO statements. ASCAP international earnings use 'Licensor' for the foreign CMO that collected, 'Statement Recipient Name' for the ASCAP member (use as artist), 'Work Title' for track, and '$ Amount' for earnings (leading space — trim before parsing). '$ Amount' column header has a leading space.",
    sources: [
      // US
      "ASCAP", "ASCAP US", "ASCAP International", "BMI", "SESAC", "GMR",
      // UK / Ireland
      "PRS", "PRS for Music", "IMRO",
      // Canada / Australia / NZ
      "SOCAN", "APRA AMCOS",
      // Europe
      "GEMA", "SACEM", "SGAE", "SIAE", "STIM", "BUMA", "STEMRA",
      "BUMA/STEMRA", "KODA", "TONO", "Teosto", "SABAM",
      // Asia / LatAm
      "JASRAC", "MCSC", "SPA",
    ],
  },
  {
    category: "Digital Performance CMO",
    royalty_type: "digital_performance",
    rights: "sound recording (master) — non-interactive digital only",
    pays_to: "featured artists (45%), master rights holders (50%), non-featured session musicians (5%)",
    note: "SoundExchange is NOT a PRO. It administers Section 112/114 digital performance rights for non-interactive services: internet radio, satellite radio (SiriusXM), and cable TV music channels. It does not cover interactive streaming or downloads.",
    sources: ["SoundExchange"],
  },
  {
    category: "MRO (Mechanical Rights Organization)",
    royalty_type: "mechanical",
    rights: "composition (publishing)",
    pays_to: "songwriters and publishers",
    note: "MROs collect and distribute mechanical royalties for compositions — covering interactive streaming (Section 115 compulsory license in the US), permanent downloads, and physical reproduction.",
    sources: [
      "MLC", "The MLC", "HFA", "Harry Fox Agency",
      "Songtrust", "Music Reports", "MusixMatch Publishing",
    ],
  },
  {
    category: "Sync licensing",
    royalty_type: "sync",
    rights: "composition and/or sound recording (varies by deal)",
    pays_to: "rights holders — terms vary",
    note: "Sync fees for use of music in film, TV, advertising, video games, or other media. May cover composition only, master only, or both.",
    sources: [
      "Musicbed", "Artlist", "Epidemic Sound", "Pond5",
      "Musicgateway", "Songtradr", "Marmoset",
    ],
  },
];

/**
 * Returns a compact, structured block describing the music industry taxonomy.
 * Inject into Gemini system prompts to ensure correct source classification.
 */
export function taxonomyPromptBlock(): string {
  const lines: string[] = [
    "MUSIC INDUSTRY TAXONOMY — use this to classify royalty sources correctly:",
    "",
  ];

  for (const entry of TAXONOMY) {
    lines.push(`[${entry.category.toUpperCase()}]`);
    lines.push(`royalty_type: "${entry.royalty_type}"`);
    lines.push(`Rights paid: ${entry.rights}`);
    lines.push(`Pays to: ${entry.pays_to}`);
    lines.push(`Known sources: ${entry.sources.join(", ")}`);
    lines.push(`Important: ${entry.note}`);
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

/** Human-readable labels for royalty types shown in the UI. */
export const ROYALTY_TYPE_LABELS: Record<string, string> = {
  mechanical: "Mechanical",
  performance: "Performance",
  sync: "Sync",
  digital_performance: "Digital Performance",
  digital_distribution: "Digital Distribution",
  neighboring_rights: "Neighboring Rights",
  unknown: "Unknown",
};

export function royaltyTypeLabel(type: string | null | undefined): string {
  if (!type) return "—";
  return ROYALTY_TYPE_LABELS[type] ?? type;
}
