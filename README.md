# Roy — Music Royalties App

Next.js 15 + Tailwind CSS rebuild of the Mogul marketing site.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v3**
- **ESLint**

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for production

```bash
npm run build
npm run start
```

## Project Structure

```
src/
  app/
    globals.css          # Global styles + CSS variables
    layout.tsx           # Root layout (Inter font, metadata)
    page.tsx             # Home page (/)
    royalty-finder/
      page.tsx           # Royalty Finder page (/royalty-finder)
  components/
    Navbar.tsx           # Sticky navbar with active link detection
    Footer.tsx           # Footer with nav columns + social icons
    CookieBanner.tsx     # Cookie consent (localStorage-based)
    RoyaltyFinderTabs.tsx # Artist / Writer tab switcher + search
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/royalty-finder` | Royalty Finder with live search widget |
| `/pricing` | Pricing (legacy HTML, to be ported) |
| `/whos-it-for` | Who It's For (legacy HTML, to be ported) |

## GitHub

To connect this repo to your GitHub account:

```bash
# Create a new repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/roy-app.git
git push -u origin main
```

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--green` | `#00d47b` | Primary CTA, accents |
| `--green-dark` | `#00b869` | Hover state |
| `--bg` | `#05060a` | Page background |
| `--bg2` | `#0c0d13` | Card / section backgrounds |
| `--bg3` | `#111218` | Elevated surfaces |
| `--border` | `rgba(255,255,255,0.08)` | Dividers, card borders |
| `--text-muted` | `#8a8f9a` | Secondary text |
