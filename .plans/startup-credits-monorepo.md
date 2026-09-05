---
task: startup-credits-monorepo
plan_path: .plans/startup-credits-monorepo.md
base_sha: f097d04
---

# A pnpm monorepo exists whose `apps/credits-wiki` Astro app renders a sortable, searchable list of startup credit programs, with one detail page per program, styled to match https://models.dev/.

## Context
The user wants a pnpm monorepo that holds apps. The first app is a wiki of startup credit programs (cloud credits, SaaS discounts, API credits) presented primarily as a list, in the exact visual style of models.dev: Rubik + IBM Plex Mono, a fixed 56px header with brand / slash / tagline, uppercase small-caps section headings, a dense bordered table with sticky headers, subtle dotted-underline links, a `#fd9527` brand accent, and automatic dark mode via `prefers-color-scheme`. The models.dev stylesheet was downloaded and saved verbatim at `.plans/models-dev-reference.css`; the app's global stylesheet is derived from it.

Recommended approach: a workspace data package (`packages/credits-data`) holding a typed JSON list of programs, consumed by a static Astro 7 site (`apps/credits-wiki`). No UI framework, no Tailwind; plain `.astro` components plus one small vanilla-TS client script for sorting and the search modal, mirroring what models.dev does.

## Conventions in force
Copied for this repository (it is new; these are the conventions being established).
- Package manager: pnpm 11 (`pnpm --version` -> 11.22.0). Node 22 (`node --version` -> v22.21.0).
- Install: `pnpm install`
- Build (all): `pnpm -r build`
- Build (app): `pnpm --filter @wholeearth/credits-wiki build`
- Typecheck (data pkg): `pnpm --filter @wholeearth/credits-data typecheck`
- Typecheck (app): `pnpm --filter @wholeearth/credits-wiki check`
- Package names are scoped `@wholeearth/<dir-name>`. Apps live in `apps/*`, shared packages in `packages/*`.
- TypeScript strict. ESM only (`"type": "module"` everywhere).
- Styling: one global stylesheet `apps/credits-wiki/src/styles/global.css`. CSS custom properties and class names must match models.dev names where the same UI element exists (`header`, `.brand`, `.slash`, `.top-nav`, `.page-scroll`, `.overview`, `.stats-strip`, `.table-section`, `.section-heading`, `.table-wrap`, `.primary-link`, `.subtle`, `.mono`, `.detail-header`, `.breadcrumbs`, `.fact-grid`, `.json-section`, `.search-modal`, `.search-field`, `.search-results`, `.search-result*`, `dialog`). Do not invent a second design system.
- Forbidden here: Tailwind, any CSS framework, React/Vue/Svelte, any client-side routing, `any` in TypeScript, committing `node_modules` or `dist`.
- Commits: do not commit; leave changes unstaged. The planner commits at the end.

## Evidence
### Verified
- `curl https://models.dev/chunk-tnw8gndw.css` -> saved verbatim to `.plans/models-dev-reference.css` (19,710 bytes). Key tokens: `--font-mono: "IBM Plex Mono", monospace`; body `font-family: Rubik, sans-serif; line-height: 1.6`; `--color-brand: #fd9527`; light `--color-background: #fff; --color-border: #ddd; --color-surface: #f5f5f5; --color-text: #333; --color-text-secondary: #666; --color-text-tertiary: #999`; dark (`prefers-color-scheme: dark`) `--color-background: #1e1e1e; --color-border: #333; --color-surface: #111; --color-text: #fff; --color-text-secondary: #aaa; --color-text-tertiary: #666`; `--header-height: 56px`.
- models.dev `<head>` loads fonts via `https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Rubik:wght@300..900&display=swap` with `<link rel="preconnect" href="https://fonts.googleapis.com" />`.
- models.dev `<body>` structure (verbatim skeleton):
  ```html
  <header>
    <div class="left"><a class="brand" href="/"><h1>Models.dev</h1></a><span class="slash"></span><p>An open-source database of AI models</p></div>
    <div class="right">
      <nav class="top-nav" aria-label="Primary"><a class="active" href="/models">Models</a><a href="/providers">Providers</a></nav>
      <a class="github" ...><svg .../></a>
      <div class="search-container"><button type="button" id="search-trigger" class="search-trigger" aria-label="Search" aria-haspopup="dialog" aria-controls="search-modal"><span class="search-trigger-label"><svg .../><span>Search</span></span><span class="search-shortcut">Ctrl F</span></button></div>
      <button id="help">How to use</button>
      <button type="button" id="mobile-menu-trigger" class="mobile-menu-trigger" aria-label="Open menu">...</button>
    </div>
  </header>
  <main class="page-scroll">
    <section class="table-section"><div class="table-wrap"><table data-enhanced-table="true"><thead><tr><th class="sortable" data-type="text" scope="col">Model <span class="sort-indicator"></span></th>...</tr></thead><tbody><tr data-search="..."><td data-sort="GPT-6 Astra"><a class="primary-link" href="/models/openai/gpt-6-astra">GPT-6 Astra</a><span class="subtle mono">openai/gpt-6-astra</span></td>...</tr></tbody></table></div></section>
  </main>
  ```
  Body text in `tbody td` is `--color-text-tertiary` except the first three columns which are `--color-text`.
- `npm view astro version` -> `7.3.1`. `npm view astro@7.3.1 engines` -> node `>=22.12.0`, pnpm `>=7.1.0`. `npm view @astrojs/check version` -> `0.9.10`, peer `typescript ^5.0.0 || ^6.0.0`. `npm view typescript@5 version` -> `5.9.3`.
- Working directory `/Users/kyeshmz/Documents/wholeearth/oss` was empty; `git init` has been run; there are no commits.

### Unverified
- That `pnpm install` resolves `astro@^7.3.1` cleanly with pnpm 11's default `node-linker`. Check with `pnpm install` in Phase 1; if Astro complains about hoisting, add `public-hoist-pattern[]=*astro*` to `.npmrc`.

## Operational definitions
- **Credit program**: one row in `packages/credits-data/src/credits.json`; one provider can have at most one entry per `slug`.
- **Slug**: lowercase kebab-case, unique, used as the URL segment `/credits/<slug>`.
- **Value (USD)**: the maximum headline value of the program in whole US dollars as an integer, or `null` when the program is a percentage discount or free-tier with no published dollar figure. Used only for sorting and the stats strip.
- **Matches models.dev style**: the app's `global.css` keeps the reference file's `:root` tokens, font stack, header, `.top-nav`, `.page-scroll`, `.overview`, `.stats-strip`, `.table-section`, table, `.detail-header`, `.fact-grid`, `dialog`, search-modal and media-query rules with the same values; only model-specific selectors (`.modalities`, `.modality-icon`, `.provider-logo`, `.lab-logo`, `.copy-*`, `.fact-modalities`, `.fact-logo`) are dropped.

## Assumptions
- Framework is Astro 7 (static output) — chosen because the wiki is content-first, needs zero client JS by default, and matches models.dev's static-site nature.
- App name is `credits-wiki` and package name `@wholeearth/credits-wiki`; data package is `@wholeearth/credits-data` — chosen because the repo lives under a `wholeearth` directory.
- Seed data is a curated list of well-known programs with values as publicly advertised on or before 2026-09-05. Each entry carries `updated` and `sourceUrl` so readers can verify; the help dialog says values change and must be verified on the provider's page.
- Dark mode follows the OS (`prefers-color-scheme`) exactly like models.dev; no toggle.
- Site title is "Startup Credits", tagline "An open-source wiki of startup credit programs".

---

## Phase 1 — Workspace scaffold and data package
At the end of this phase `pnpm install` succeeds from the repo root, and `@wholeearth/credits-data` typechecks and exports a typed, validated list of credit programs.

### [NEW] `package.json`
- Creates: root workspace manifest. `"name": "wholeearth-oss"`, `"private": true`, `"type": "module"`, `"packageManager": "pnpm@11.22.0"`, `"engines": { "node": ">=22.12.0" }`, scripts: `"build": "pnpm -r build"`, `"dev": "pnpm --filter @wholeearth/credits-wiki dev"`, `"check": "pnpm -r --if-present check && pnpm -r --if-present typecheck"`. devDependencies: `"typescript": "^5.9.3"`.
- Wired in by: `pnpm-workspace.yaml` in this phase.

### [NEW] `pnpm-workspace.yaml`
- Creates: `packages:` list with `apps/*` and `packages/*`.
- Anchor strings: must appear `- "apps/*"` and `- "packages/*"`.

### [NEW] `.npmrc`
- Creates: `auto-install-peers=true` and `strict-peer-dependencies=false`.

### [NEW] `.gitignore`
- Creates: ignores `node_modules/`, `dist/`, `.astro/`, `.DS_Store`, `*.log`, `.env`, `.env.*`. Must NOT ignore `.plans/`.

### [NEW] `tsconfig.base.json`
- Creates: shared compiler options: `"strict": true`, `"module": "ESNext"`, `"moduleResolution": "Bundler"`, `"target": "ES2022"`, `"resolveJsonModule": true`, `"esModuleInterop": true`, `"skipLibCheck": true`, `"isolatedModules": true`, `"noUncheckedIndexedAccess": true`.

### [NEW] `packages/credits-data/package.json`
- Creates: `"name": "@wholeearth/credits-data"`, `"version": "0.1.0"`, `"private": true`, `"type": "module"`, `"exports": { ".": "./src/index.ts" }` (source export; Astro/Vite consumes TS directly, no build step), scripts: `"typecheck": "tsc --noEmit"`, `"build": "tsc --noEmit"`. devDependencies: `"typescript": "^5.9.3"`.

### [NEW] `packages/credits-data/tsconfig.json`
- Creates: `"extends": "../../tsconfig.base.json"`, `"include": ["src"]`, `compilerOptions.noEmit: true`.

### [NEW] `packages/credits-data/src/types.ts`
- Creates and exports:
  ```ts
  export const CATEGORIES = ["cloud", "ai", "devtools", "database", "analytics", "productivity", "customer-support", "sales-marketing", "finance", "other"] as const;
  export type Category = (typeof CATEGORIES)[number];
  export const STAGES = ["pre-seed", "seed", "series-a", "any"] as const;
  export type Stage = (typeof STAGES)[number];
  export interface Credit {
    slug: string;            // unique, kebab-case
    provider: string;        // "Amazon Web Services"
    program: string;         // "AWS Activate"
    category: Category;
    value: string;           // display string, e.g. "Up to $100,000"
    valueUsd: number | null; // integer USD or null
    duration: string;        // "2 years", "12 months", "Ongoing"
    eligibility: string;     // one sentence
    stages: Stage[];         // funding stages accepted; ["any"] if unrestricted
    requirements: string[];  // bullet list
    howToApply: string;      // one or two sentences
    applyUrl: string;
    website: string;
    tags: string[];
    notes?: string;
    updated: string;         // ISO date YYYY-MM-DD
    sourceUrl: string;
  }
  ```

### [NEW] `packages/credits-data/src/credits.json`
- Creates: a JSON array of `Credit` objects. Include exactly these 18 entries, in this order, with these values (fill `requirements`, `howToApply`, `tags`, `stages`, `notes` sensibly; every `updated` is `"2026-09-05"`; `sourceUrl` equals `applyUrl` unless a better public page is known):
  1. `aws-activate` — Amazon Web Services / AWS Activate — cloud — "Up to $100,000" — 100000 — "2 years" — eligibility: unfunded or funded startups less than 10 years old with a working website; higher tiers require an affiliated accelerator, VC, or partner — applyUrl `https://aws.amazon.com/activate/` — website `https://aws.amazon.com/`.
  2. `google-cloud-for-startups` — Google Cloud / Google for Startups Cloud Program — cloud — "Up to $200,000 (up to $350,000 for AI startups)" — 350000 — "2 years" — eligibility: pre-seed to Series A startups less than 10 years old; AI-first startups may qualify for the higher tier — applyUrl `https://cloud.google.com/startup` — website `https://cloud.google.com/`.
  3. `microsoft-founders-hub` — Microsoft / Microsoft for Startups Founders Hub — cloud — "Up to $150,000 Azure credits" — 150000 — "Tiered, up to 2 years" — eligibility: early-stage software startups; no funding required to join at the entry tier — applyUrl `https://www.microsoft.com/en-us/startups` — website `https://azure.microsoft.com/`.
  4. `cloudflare-for-startups` — Cloudflare / Cloudflare for Startups — cloud — "Up to $250,000" — 250000 — "1 year" — eligibility: early-stage startups, typically Series A or earlier, applying through Cloudflare's startup program — applyUrl `https://www.cloudflare.com/forstartups/` — website `https://www.cloudflare.com/`.
  5. `mongodb-for-startups` — MongoDB / MongoDB for Startups — database — "Atlas credits plus technical support" — null — "1 year" — eligibility: early-stage startups building on MongoDB Atlas — applyUrl `https://www.mongodb.com/startups` — website `https://www.mongodb.com/`.
  6. `posthog-for-startups` — PostHog / PostHog for Startups — analytics — "$50,000 in credits" — 50000 — "1 year" — eligibility: companies less than 2 years old with under $5M in funding — applyUrl `https://posthog.com/startups` — website `https://posthog.com/`.
  7. `mixpanel-for-startups` — Mixpanel / Mixpanel for Startups — analytics — "Free Growth plan (up to $50,000 value)" — 50000 — "1 year" — eligibility: companies less than 5 years old with under $8M raised — applyUrl `https://mixpanel.com/startups/` — website `https://mixpanel.com/`.
  8. `amplitude-for-startups` — Amplitude / Amplitude for Startups — analytics — "Free Growth plan" — null — "1 year" — eligibility: companies with under $10M raised — applyUrl `https://amplitude.com/startups` — website `https://amplitude.com/`.
  9. `segment-startup-program` — Twilio Segment / Segment Startup Program — analytics — "Up to $50,000 Segment credits" — 50000 — "1 year" — eligibility: companies less than 2 years old with under $5M raised — applyUrl `https://segment.com/industry/startups/` — website `https://segment.com/`.
  10. `github-for-startups` — GitHub / GitHub for Startups — devtools — "20 seats of GitHub Enterprise free, then 50% off" — null — "Free for year 1, 50% off year 2" — eligibility: Series A or earlier startups affiliated with a GitHub partner accelerator or VC — applyUrl `https://github.com/enterprise/startups` — website `https://github.com/`.
  11. `notion-for-startups` — Notion / Notion for Startups — productivity — "Up to 6 months of Plus with Notion AI (about $6,000 value)" — 6000 — "6 months" — eligibility: startups affiliated with a Notion partner (VC, accelerator, or startup program) — applyUrl `https://www.notion.so/startups` — website `https://www.notion.so/`.
  12. `hubspot-for-startups` — HubSpot / HubSpot for Startups — sales-marketing — "30% to 75% off in year 1" — null — "Discount steps down over 3 years" — eligibility: startups affiliated with an approved partner and under a funding threshold — applyUrl `https://www.hubspot.com/startups` — website `https://www.hubspot.com/`.
  13. `intercom-early-stage` — Intercom / Intercom Early Stage — customer-support — "90% off in year 1" — null — "3 years (90%, 50%, 25%)" — eligibility: under 15 employees, under $1M funding, less than 2 years old — applyUrl `https://www.intercom.com/early-stage` — website `https://www.intercom.com/`.
  14. `zendesk-for-startups` — Zendesk / Zendesk for Startups — customer-support — "6 months free" — null — "6 months" — eligibility: under 50 employees, less than Series A, new Zendesk customers — applyUrl `https://www.zendesk.com/startups/` — website `https://www.zendesk.com/`.
  15. `stripe-atlas` — Stripe / Stripe Atlas — finance — "Company formation plus partner perks" — null — "One-time" — eligibility: founders anywhere forming a US company — applyUrl `https://stripe.com/atlas` — website `https://stripe.com/`.
  16. `anthropic-for-startups` — Anthropic / Claude for Startups — ai — "API credits (varies by partner)" — null — "Varies" — eligibility: startups affiliated with an Anthropic partner VC or accelerator — applyUrl `https://www.anthropic.com/startups` — website `https://www.anthropic.com/`.
  17. `modal-for-startups` — Modal / Modal for Startups — ai — "Up to $25,000 compute credits" — 25000 — "Varies" — eligibility: early-stage startups running AI workloads on Modal — applyUrl `https://modal.com/startups` — website `https://modal.com/`.
  18. `digitalocean-hatch` — DigitalOcean / DigitalOcean Hatch — cloud — "Cloud credits (varies)" — null — "12 months" — eligibility: early-stage startups, typically via an accelerator or VC partner — applyUrl `https://www.digitalocean.com/hatch` — website `https://www.digitalocean.com/`.

### [NEW] `packages/credits-data/src/index.ts`
- Creates: imports the JSON as `import data from "./credits.json" with { type: "json" };` (the `with` attribute is required so the same file runs under both Node and Vite). Do not cast the JSON to `Credit[]`; assign `const raw: unknown = data` and validate with `assertCredits(value: unknown): asserts value is Credit[]`, which checks every field's type, enum membership for `category` and `stages`, unique slugs, the kebab-case slug regex `^[a-z0-9]+(-[a-z0-9]+)*$`, `valueUsd` is `null` or a non-negative integer, and the `^\d{4}-\d{2}-\d{2}$` regex on `updated`; throw `Error` naming the offending slug and field. Exports: `credits: Credit[]` (validated, sorted by `provider` then `program`), `categories: Category[]` (only those present in data, in `CATEGORIES` order), `getCredit(slug: string): Credit | undefined`, `creditsByCategory(category: Category): Credit[]`, `CATEGORY_LABELS: Record<Category, string>` (e.g. `"sales-marketing": "Sales & Marketing"`, `"customer-support": "Customer Support"`, `"ai": "AI"`, others Title Case), `STAGE_LABELS: Record<Stage, string>`, and re-exports of everything in `types.ts`.
- Edge cases: duplicate slug in JSON -> throws at import time; unknown category -> throws; `valueUsd` present but not an integer -> throws.
- Wired in by: `apps/credits-wiki` in Phase 2.

#### Automated verification
- [ ] workspace installs: `pnpm install`
- [ ] data package typechecks: `pnpm --filter @wholeearth/credits-data typecheck`
- [ ] data validates at runtime and has 18 entries: `node --experimental-strip-types -e "import('./packages/credits-data/src/index.ts').then(m => { if (m.credits.length !== 18) throw new Error('expected 18, got ' + m.credits.length); console.log('ok', m.credits.length, m.categories.join(',')) })"`

---

## Phase 2 — Astro app: global stylesheet, layout, and the credits list page
At the end of this phase `pnpm --filter @wholeearth/credits-wiki build` succeeds and `dist/index.html` renders the header and a sortable table of all 18 programs in the models.dev style.

### [NEW] `apps/credits-wiki/package.json`
- Creates: `"name": "@wholeearth/credits-wiki"`, `"version": "0.1.0"`, `"private": true`, `"type": "module"`, scripts `"dev": "astro dev"`, `"build": "astro build"`, `"preview": "astro preview"`, `"check": "astro check"`. dependencies: `"astro": "^7.3.1"`, `"@wholeearth/credits-data": "workspace:*"`. devDependencies: `"@astrojs/check": "^0.9.10"`, `"typescript": "^5.9.3"`.

### [NEW] `apps/credits-wiki/astro.config.mjs`
- Creates: `defineConfig({ site: "https://credits.wholeearth.dev", output: "static", trailingSlash: "never", build: { format: "file" } })`. `format: "file"` so `/credits/aws-activate` builds to `dist/credits/aws-activate.html`.

### [NEW] `apps/credits-wiki/tsconfig.json`
- Creates: `"extends": "astro/tsconfigs/strict"`, `"include": [".astro/types.d.ts", "**/*"]`, `"exclude": ["dist"]`.

### [NEW] `apps/credits-wiki/public/favicon.svg`
- Creates: a 32x32 SVG: rounded square filled `#fd9527` with a white bold "$" glyph centered (font-family sans-serif, font-weight 700). Keep under 600 bytes.

### [NEW] `apps/credits-wiki/src/styles/global.css`
- Creates: derived from `.plans/models-dev-reference.css`. Copy the file, then: keep every rule listed under "Matches models.dev style" in Operational definitions unchanged; delete `.modalities`, `.modality-icon*`, `.fact-modalities*`, `.fact-logo`, `.provider-logo`, `.lab-logo`, `.provider-link`, `.lab-link`, `.copy-*`, `.mobile-menu*`, `.mobile-menu-list*` rules; keep `table { min-width: 76rem }` but change it to `min-width: 64rem` (fewer columns than models.dev) and the `52rem` breakpoint's `table { min-width: 62rem }` to `52rem`. Add, at the end, these app-specific rules using existing tokens only:
  ```css
  .badge { display: inline-flex; align-items: center; border: 1px solid var(--color-border); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0; border-radius: .25rem; padding: .1875rem .375rem; font-size: .625rem; line-height: 1; white-space: nowrap; }
  .badge-list { display: flex; flex-wrap: wrap; gap: .25rem; }
  .detail-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 2rem; padding: 1.5rem .75rem; border-bottom: 1px solid var(--color-border); }
  .detail-body h3 { text-transform: uppercase; letter-spacing: 0; font-size: .875rem; font-weight: 600; line-height: 1; margin-bottom: .75rem; }
  .detail-body p, .detail-body li { color: var(--color-text-secondary); font-size: .9375rem; }
  .detail-body ul { padding-left: 1.25rem; }
  .detail-body li + li { margin-top: .25rem; }
  .detail-body .block + .block { margin-top: 1.5rem; }
  .apply-button { display: inline-flex; align-items: center; gap: .375rem; cursor: pointer; background-color: var(--color-brand); color: var(--color-text-invert); border: none; border-radius: .25rem; height: 2rem; padding: .5rem .75rem; font-size: .8125rem; line-height: 1.1; text-decoration: none; }
  .apply-button:hover { color: var(--color-text-invert); filter: brightness(.95); }
  .footer-note { color: var(--color-text-tertiary); font-size: .75rem; padding: 1rem .75rem; }
  @media (width <= 52rem) { .detail-body { grid-template-columns: 1fr; } }
  ```
- Anchor strings: must appear `--color-brand: #fd9527`, `font-family: Rubik, sans-serif`, `--font-mono: "IBM Plex Mono", monospace`, `.page-scroll {`, `.stats-strip {`, `table thead th {`; must no longer appear `.modality-icon`, `.copy-button`, `.lab-logo`.

### [NEW] `apps/credits-wiki/src/layouts/Base.astro`
- Creates: props `{ title: string; description?: string; active?: "credits" | "categories" }`. Emits `<!doctype html><html lang="en">` with `<head>`: charset, viewport (`width=device-width, initial-scale=1.0`), `<title>{title === "Startup Credits" ? title : `${title} · Startup Credits`}</title>`, meta description, `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`, `<link rel="preconnect" href="https://fonts.googleapis.com">`, `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`, `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Rubik:wght@300..900&display=swap">`, and `import "../styles/global.css"` in frontmatter. `<body>` contains `<Header active={active} />`, `<main class="page-scroll"><slot /><p class="footer-note">Values and eligibility change often. Verify on the provider's page before relying on any entry. Last data update: {latestUpdated}.</p></main>`, `<HelpDialog />`, and `<SearchDialog />` (both created in this phase; `SearchDialog` is a static shell whose behavior arrives in Phase 3). `latestUpdated` = max `updated` across `credits`.

### [NEW] `apps/credits-wiki/src/components/Header.astro`
- Creates: the models.dev header markup verbatim in structure (see Evidence): `.left` with `<a class="brand" href="/"><h1>Startup Credits</h1></a><span class="slash"></span><p>An open-source wiki of startup credit programs</p>`; `.right` with `<nav class="top-nav">` links `Credits` (`/`, active when `active === "credits"`) and `Categories` (`/categories`, active when `active === "categories"`), a GitHub icon link to `https://github.com/wholeearth/oss` with the same 24px GitHub SVG path as models.dev, the `.search-container` search trigger button (`id="search-trigger"`, label "Search", shortcut span text "Ctrl K"), and `<button id="help">How to use</button>`. Omit the mobile menu trigger entirely (its CSS was dropped).

### [NEW] `apps/credits-wiki/src/components/HelpDialog.astro`
- Creates: `<dialog id="help-modal" aria-labelledby="help-modal-title">` with `.header` (`<h2 id="help-modal-title">How to use</h2>` and `<button id="close" aria-label="Close">` containing an X SVG), `.body` with three short `<h2>`/`<p>` pairs: "What this is" (a community-maintained list of credit and discount programs for startups), "Sorting and search" (click a column header to sort; press Ctrl K or Cmd K to search), "Contributing" (edit `packages/credits-data/src/credits.json` and open a pull request; each entry needs a source URL and an updated date), and `.footer` with a link to the GitHub repo. Include an inline `<script>` that wires `#help` click -> `showModal()` and `#close` click -> `close()`.

### [NEW] `apps/credits-wiki/src/components/SearchDialog.astro`
- Creates: `<dialog id="search-modal" class="search-modal" aria-labelledby="search-modal-title">` containing `<h2 id="search-modal-title" class="sr-only">Search</h2>`, `.search-field` with the 14px magnifier SVG, `<input id="search-input" type="text" placeholder="Search programs, providers, and categories" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="search-results" aria-autocomplete="list">`, and `<span class="search-escape">Esc</span>`; `<div class="search-count" id="search-count"></div>`; `<div class="search-results" id="search-results" role="listbox"></div>`; `<p class="search-empty" id="search-empty" hidden>No matching programs.</p>`. Also renders a `<script type="application/json" id="search-index">` containing `JSON.stringify(credits.map(c => ({ slug, provider, program, category, categoryLabel, value, duration, tags })))`. No behavior script in this phase.

### [NEW] `apps/credits-wiki/src/components/CreditsTable.astro`
- Creates: props `{ credits: Credit[]; caption?: string }`. Renders `<section class="table-section">` with `<div class="section-heading"><h3>{caption ?? "Programs"}</h3><span>{credits.length} programs</span></div>` then `.table-wrap > table[data-enhanced-table]` with columns, in order: Program (`th.sortable[data-type=text]`; cell has `<a class="primary-link" href={`/credits/${slug}`}>{program}</a><span class="subtle mono">{slug}</span>`, `data-sort={program}`), Provider (text), Category (text; cell is `<a href={`/categories/${category}`}>{label}</a>`), Value (`data-type=number`, `data-sort={valueUsd ?? -1}`, cell text `value`), Duration (text), Stages (text; comma-joined labels), Eligibility (text; the sentence, with `title` attribute equal to the full sentence), Apply (cell is `<a href={applyUrl} target="_blank" rel="noopener noreferrer">Apply ↗</a>`, `data-sort={provider}`), Updated (text, mono). Every `<tr>` gets `data-search` = lowercase concatenation of program, provider, slug, category label, tags, value. Each sortable `th` ends with `<span class="sort-indicator"></span>`. Below the table: `<p class="empty-message">No programs match.</p>`. Client script in Phase 3 (do not add one here).

### [NEW] `apps/credits-wiki/src/pages/index.astro`
- Creates: uses `Base` with `title="Startup Credits"`, `active="credits"`. Renders `<section class="overview">` with left `<div><h2>Startup credits, in one list.</h2><p>Cloud credits, API credits, and SaaS discounts available to early-stage startups. Every entry links to its source and shows when it was last checked.</p></div>` and right `<dl class="stats-strip">` with five `<div><dt>…</dt><dd>…</dd></div>` cells: Programs (count), Providers (distinct count), Categories (count), Max value (largest `valueUsd`, formatted `$350,000`), Last updated (latest `updated`). Then `<CreditsTable credits={credits} />`.
- Edge cases: `valueUsd` all null -> "Max value" shows "—".

#### Automated verification
- [ ] app installs against the data package: `pnpm install`
- [ ] app typechecks: `pnpm --filter @wholeearth/credits-wiki check`
- [ ] app builds: `pnpm --filter @wholeearth/credits-wiki build`
- [ ] list renders all programs and the models.dev header: `node -e "const h=require('fs').readFileSync('apps/credits-wiki/dist/index.html','utf8'); const n=(h.match(/class=\"primary-link\"/g)||[]).length; if(n!==18) throw new Error('expected 18 primary links, got '+n); for (const s of ['class=\"brand\"','class=\"slash\"','class=\"stats-strip\"','fonts.googleapis.com/css2?family=IBM+Plex+Mono','id=\"search-modal\"','id=\"help-modal\"']) if(!h.includes(s)) throw new Error('missing '+s); console.log('ok')"`

#### Manual verification
- [ ] `pnpm dev` at http://localhost:4321 looks like models.dev in both light and dark OS themes (header, fonts, table density, brand orange button).

---

## Phase 3 — Detail pages, category pages, and client-side sorting and search
At the end of this phase every program has a detail page, every category has a filtered list page, table headers sort on click, and Ctrl K / Cmd K opens a working search modal.

### [NEW] `apps/credits-wiki/src/pages/credits/[slug].astro`
- Creates: `getStaticPaths` from `credits` (`params: { slug }`, `props: { credit }`). Uses `Base` with `title={credit.program}`, `description={credit.eligibility}`. Renders `<section class="detail-header">` with `<nav class="breadcrumbs"><a href="/">Credits</a><span>/</span><a href={`/categories/${category}`}>{label}</a><span>/</span><span>{program}</span></nav>`, `<h2>{program}</h2>`, `<p>{eligibility}</p>`, `<div class="code-line"><code>{slug}</code></div>`, and an `<a class="apply-button" href={applyUrl} target="_blank" rel="noopener noreferrer">Apply at {provider} ↗</a>` placed after the paragraph with `margin-top: .875rem` via inline style. Then `<dl class="fact-grid">` with six cells: Provider (link to `website`), Category (link), Value, Duration, Stages (`.badge-list` of `.badge`), Updated (mono). Then `<div class="detail-body">`: left column blocks "Requirements" (`<ul>`; if empty, `<p>No published requirements.</p>`), "How to apply" (`<p>`), "Notes" (only when `notes` present); right column blocks "Tags" (`.badge-list`), "Source" (`<a href={sourceUrl}>` with the URL as text, class `mono`). Then `<details class="json-section"><summary>JSON</summary><pre>{JSON.stringify(credit, null, 2)}</pre></details>`.
- Edge cases: `notes` undefined -> Notes block not rendered; `requirements` empty -> fallback sentence.

### [NEW] `apps/credits-wiki/src/pages/categories/index.astro`
- Creates: uses `Base` with `title="Categories"`, `active="categories"`. `<section class="detail-header"><h2>Categories</h2><p>Programs grouped by what they pay for.</p></section>` followed by one `<CreditsTable credits={creditsByCategory(c)} caption={CATEGORY_LABELS[c]} />` per category in `categories`.

### [NEW] `apps/credits-wiki/src/pages/categories/[category].astro`
- Creates: `getStaticPaths` from `categories`. Uses `Base` with `title={label}`, `active="categories"`. `<section class="detail-header">` with breadcrumbs (`Credits / Categories / {label}`), `<h2>{label}</h2>`, `<p>{n} programs in this category.</p>`, then `<CreditsTable credits={creditsByCategory(category)} caption={label} />`.

### [NEW] `apps/credits-wiki/src/scripts/table.ts`
- Creates: `export function enhanceTables(root: ParentNode = document): void`. For each `table[data-enhanced-table]`: on `th.sortable` click, sort `tbody` rows by that column using `td[data-sort]` when present else `td.textContent.trim()`; `data-type="number"` compares `Number(...)`, `text` uses `localeCompare` with `{ numeric: true, sensitivity: "base" }`; clicking the same header toggles direction; the active header's `.sort-indicator` shows `▲` or `▼` and every other indicator is emptied; `aria-sort` is set to `ascending`/`descending` on the active `th` and removed elsewhere. Rows are re-appended in the new order (no cloning).
- Edge cases: table with zero rows -> no-op; header without `.sortable` -> ignored.

### [NEW] `apps/credits-wiki/src/scripts/search.ts`
- Creates: `export function initSearch(): void`. Reads `#search-index` JSON. Opens `#search-modal` via `showModal()` on `#search-trigger` click and on `Ctrl+K` / `Meta+K` keydown (call `preventDefault`); `Escape` closes (native dialog behavior is fine). On `input`, filter entries whose `program`, `provider`, `slug`, `categoryLabel`, or any tag includes the query (case-insensitive; empty query shows all). Render up to 50 results as `<a class="search-result" href="/credits/{slug}" role="option">` containing `<span class="search-result-icon">{first letter of provider}</span>` and `.search-result-body` with `.search-result-top` (`.search-result-title` program with the matched substring wrapped in `<mark>`, `.search-result-kind` categoryLabel), `.search-result-subtitle` provider, `.search-result-meta` with `<span>` for value and duration. `#search-count` shows `N results`; `#search-empty` toggles `hidden` when zero. Arrow Up/Down move `.is-active` among results, Enter navigates to the active one. Focus the input on open; clear query and results on close.
- Edge cases: `#search-index` missing -> return without throwing; query with regex metacharacters -> must not throw (escape before building the highlight RegExp).

### [MODIFY] `apps/credits-wiki/src/layouts/Base.astro`
- Current: renders header, main, dialogs; no client behavior for table or search.
- Change: add, before `</body>`, `<script>import { enhanceTables } from "../scripts/table"; import { initSearch } from "../scripts/search"; enhanceTables(); initSearch();</script>`.
- Preserve: everything else in the layout unchanged.
- Anchor strings: must appear `enhanceTables();` and `initSearch();`.

#### Automated verification
- [ ] app typechecks: `pnpm --filter @wholeearth/credits-wiki check`
- [ ] app builds: `pnpm --filter @wholeearth/credits-wiki build`
- [ ] every program and category page exists and detail pages carry facts: `node -e "const fs=require('fs');const p='apps/credits-wiki/dist/';const slugs=JSON.parse(fs.readFileSync('packages/credits-data/src/credits.json','utf8')).map(c=>c.slug);for(const s of slugs){const f=p+'credits/'+s+'.html';if(!fs.existsSync(f))throw new Error('missing '+f);const h=fs.readFileSync(f,'utf8');if(!h.includes('class=\"fact-grid\"')||!h.includes('class=\"apply-button\"'))throw new Error('detail markup missing in '+s)}for(const c of ['cloud','ai','analytics'])if(!fs.existsSync(p+'categories/'+c+'.html'))throw new Error('missing category '+c);if(!fs.existsSync(p+'categories.html'))throw new Error('missing categories index');console.log('ok',slugs.length,'detail pages')"`
- [ ] client scripts are bundled into the page: `node -e "const h=require('fs').readFileSync('apps/credits-wiki/dist/index.html','utf8'); if(!/<script[^>]*src=\"\/_astro\/|<script type=\"module\">/.test(h)) throw new Error('no bundled client script'); console.log('ok')"`

#### Manual verification
- [ ] Clicking "Value" sorts by dollar amount with nulls last in descending order; clicking again reverses.
- [ ] Cmd K opens search, typing "cloud" lists AWS, Google Cloud, Microsoft, Cloudflare, DigitalOcean; Enter opens the highlighted result.

---

## Out of scope
- Authentication, editing UI, or any backend; the wiki is edited via pull requests to the JSON file.
- Provider logos (models.dev ships SVG logos per provider; this app uses a letter tile).
- Mobile hamburger menu (models.dev's `.mobile-menu`); the top nav simply hides under 52rem like models.dev's does.
- A second app in `apps/`; the workspace is ready for one but none is created.
- Deployment config (Vercel, Cloudflare Pages, GitHub Actions).
- Fetching or verifying live program values from provider websites.

## Halt surfaces
Stop and report instead of proceeding if the work would touch one of these AND no phase above states the intended behavior on it. "Touch" means your change alters that surface's behavior, not that the file you are editing mentions it.
- authentication, authorization, tokens, PII, CORS, or session management
- a destructive schema change or a data migration
- an external API contract
- any network request at build time or at runtime other than loading Google Fonts

## Definition of done
- [ ] Every automated-verification command in every phase has been run and exited 0
- [ ] `pnpm install && pnpm -r build` exits 0 from the repo root
- [ ] No file outside the paths named in this plan was changed

---

## Execution log
<Implementer appends here, newest last. Planner does not write in this section.>

---
Section ownership: everything above `## Execution log` is written by the planner and is READ-ONLY to the implementer, except the `#### Automated verification` checkboxes, which the implementer ticks after running the command and pasting its output. `#### Manual verification` boxes are ticked only by a human. Omit any section entirely when it would be empty — never write "None."
