/**
 * Country code → display name lookup.
 * Covers ISO 3166-1 alpha-2, common alpha-3 variants, and non-standard
 * region codes that appear in DSP / PRO royalty statements.
 * Returns the original string unchanged if no match is found.
 */
const CODES: Record<string, string> = {
  // Non-standard region codes common in royalty statements
  WW: "Worldwide",
  ROW: "Rest of World",
  EU: "European Union",
  LATAM: "Latin America",
  APAC: "Asia-Pacific",
  MENA: "Middle East & North Africa",

  // Alpha-2 — A
  AD: "Andorra",
  AE: "United Arab Emirates",
  AF: "Afghanistan",
  AG: "Antigua & Barbuda",
  AL: "Albania",
  AM: "Armenia",
  AO: "Angola",
  AR: "Argentina",
  AT: "Austria",
  AU: "Australia",
  AZ: "Azerbaijan",

  // Alpha-2 — B
  BA: "Bosnia & Herzegovina",
  BB: "Barbados",
  BD: "Bangladesh",
  BE: "Belgium",
  BF: "Burkina Faso",
  BG: "Bulgaria",
  BH: "Bahrain",
  BI: "Burundi",
  BJ: "Benin",
  BN: "Brunei",
  BO: "Bolivia",
  BR: "Brazil",
  BS: "Bahamas",
  BT: "Bhutan",
  BW: "Botswana",
  BY: "Belarus",
  BZ: "Belize",

  // Alpha-2 — C
  CA: "Canada",
  CD: "DR Congo",
  CF: "Central African Republic",
  CG: "Republic of Congo",
  CH: "Switzerland",
  CI: "Côte d'Ivoire",
  CL: "Chile",
  CM: "Cameroon",
  CN: "China",
  CO: "Colombia",
  CR: "Costa Rica",
  CV: "Cape Verde",
  CY: "Cyprus",
  CZ: "Czech Republic",

  // Alpha-2 — D
  DE: "Germany",
  DJ: "Djibouti",
  DK: "Denmark",
  DM: "Dominica",
  DO: "Dominican Republic",
  DZ: "Algeria",

  // Alpha-2 — E
  EC: "Ecuador",
  EE: "Estonia",
  EG: "Egypt",
  ER: "Eritrea",
  ES: "Spain",
  ET: "Ethiopia",

  // Alpha-2 — F
  FI: "Finland",
  FJ: "Fiji",
  FR: "France",

  // Alpha-2 — G
  GA: "Gabon",
  GB: "United Kingdom",
  GD: "Grenada",
  GE: "Georgia",
  GH: "Ghana",
  GM: "Gambia",
  GN: "Guinea",
  GQ: "Equatorial Guinea",
  GR: "Greece",
  GT: "Guatemala",
  GW: "Guinea-Bissau",
  GY: "Guyana",

  // Alpha-2 — H
  HN: "Honduras",
  HR: "Croatia",
  HT: "Haiti",
  HU: "Hungary",

  // Alpha-2 — I
  ID: "Indonesia",
  IE: "Ireland",
  IL: "Israel",
  IN: "India",
  IQ: "Iraq",
  IR: "Iran",
  IS: "Iceland",
  IT: "Italy",

  // Alpha-2 — J
  JM: "Jamaica",
  JO: "Jordan",
  JP: "Japan",

  // Alpha-2 — K
  KE: "Kenya",
  KG: "Kyrgyzstan",
  KH: "Cambodia",
  KI: "Kiribati",
  KM: "Comoros",
  KN: "Saint Kitts & Nevis",
  KP: "North Korea",
  KR: "South Korea",
  KW: "Kuwait",
  KZ: "Kazakhstan",

  // Alpha-2 — L
  LA: "Laos",
  LB: "Lebanon",
  LC: "Saint Lucia",
  LI: "Liechtenstein",
  LK: "Sri Lanka",
  LR: "Liberia",
  LS: "Lesotho",
  LT: "Lithuania",
  LU: "Luxembourg",
  LV: "Latvia",
  LY: "Libya",

  // Alpha-2 — M
  MA: "Morocco",
  MC: "Monaco",
  MD: "Moldova",
  ME: "Montenegro",
  MG: "Madagascar",
  MK: "North Macedonia",
  ML: "Mali",
  MM: "Myanmar",
  MN: "Mongolia",
  MR: "Mauritania",
  MT: "Malta",
  MU: "Mauritius",
  MV: "Maldives",
  MW: "Malawi",
  MX: "Mexico",
  MY: "Malaysia",
  MZ: "Mozambique",

  // Alpha-2 — N
  NA: "Namibia",
  NE: "Niger",
  NG: "Nigeria",
  NI: "Nicaragua",
  NL: "Netherlands",
  NO: "Norway",
  NP: "Nepal",
  NR: "Nauru",
  NZ: "New Zealand",

  // Alpha-2 — O
  OM: "Oman",

  // Alpha-2 — P
  PA: "Panama",
  PE: "Peru",
  PG: "Papua New Guinea",
  PH: "Philippines",
  PK: "Pakistan",
  PL: "Poland",
  PS: "Palestine",
  PT: "Portugal",
  PW: "Palau",
  PY: "Paraguay",

  // Alpha-2 — Q
  QA: "Qatar",

  // Alpha-2 — R
  RO: "Romania",
  RS: "Serbia",
  RU: "Russia",
  RW: "Rwanda",

  // Alpha-2 — S
  SA: "Saudi Arabia",
  SB: "Solomon Islands",
  SC: "Seychelles",
  SD: "Sudan",
  SE: "Sweden",
  SG: "Singapore",
  SI: "Slovenia",
  SK: "Slovakia",
  SL: "Sierra Leone",
  SM: "San Marino",
  SN: "Senegal",
  SO: "Somalia",
  SR: "Suriname",
  SS: "South Sudan",
  ST: "São Tomé & Príncipe",
  SV: "El Salvador",
  SY: "Syria",
  SZ: "Eswatini",

  // Alpha-2 — T
  TD: "Chad",
  TG: "Togo",
  TH: "Thailand",
  TJ: "Tajikistan",
  TL: "Timor-Leste",
  TM: "Turkmenistan",
  TN: "Tunisia",
  TO: "Tonga",
  TR: "Turkey",
  TT: "Trinidad & Tobago",
  TV: "Tuvalu",
  TW: "Taiwan",
  TZ: "Tanzania",

  // Alpha-2 — U
  UA: "Ukraine",
  UG: "Uganda",
  US: "United States",
  UY: "Uruguay",
  UZ: "Uzbekistan",

  // Alpha-2 — V
  VA: "Vatican City",
  VC: "Saint Vincent & the Grenadines",
  VE: "Venezuela",
  VN: "Vietnam",
  VU: "Vanuatu",

  // Alpha-2 — W–Z
  WS: "Samoa",
  YE: "Yemen",
  ZA: "South Africa",
  ZM: "Zambia",
  ZW: "Zimbabwe",

  // Common alpha-3 variants
  USA: "United States",
  GBR: "United Kingdom",
  DEU: "Germany",
  FRA: "France",
  CAN: "Canada",
  AUS: "Australia",
  JPN: "Japan",
  KOR: "South Korea",
  BRA: "Brazil",
  MEX: "Mexico",
  IND: "India",
  CHN: "China",
  RUS: "Russia",
  NLD: "Netherlands",
  SWE: "Sweden",
  NOR: "Norway",
  DNK: "Denmark",
  FIN: "Finland",
  ESP: "Spain",
  ITA: "Italy",
  POL: "Poland",
  CHE: "Switzerland",
  AUT: "Austria",
  BEL: "Belgium",
  PRT: "Portugal",
  IRE: "Ireland",
  IRL: "Ireland",
  NZL: "New Zealand",
  ZAF: "South Africa",
  ARG: "Argentina",
  COL: "Colombia",
  CHL: "Chile",
  IDN: "Indonesia",
  MYS: "Malaysia",
  PHL: "Philippines",
  THA: "Thailand",
  VNM: "Vietnam",
  SGP: "Singapore",
  TWN: "Taiwan",
  TUR: "Turkey",
  SAU: "Saudi Arabia",
  ARE: "United Arab Emirates",
  EGY: "Egypt",
  NGA: "Nigeria",
  KEN: "Kenya",
  GHA: "Ghana",
  SEN: "Senegal",
};

export function getCountryName(raw: string): string {
  if (!raw) return raw;
  const upper = raw.trim().toUpperCase();
  return CODES[upper] ?? raw;
}
