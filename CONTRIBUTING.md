# Contributing

## Repo layout

```
apps/credits-wiki/          Astro site (static output)
  src/pages/index.astro     List page + stats strip
  src/pages/credits/[slug].astro   One detail page per program
  src/pages/categories/     Category indexes + filtered lists
  src/pages/suggest.astro   Suggestion form (POSTs to /api/submissions)
  src/components/           Header, CreditsTable, HelpDialog, SearchDialog
  src/scripts/              table.ts (sortable columns), search.ts (Ctrl/Cmd-K modal)
  functions/api/            Cloudflare Pages Functions: submissions.ts, feedback.ts
packages/credits-data/
  src/credits.json          Source of truth for all programs
  src/types.ts              Credit, Category, Stage types
  src/index.ts              Validation (assertCredits), sorting, helpers
migrations/                 D1 schema (0001_initial.sql) + seed (0002_seed_credits.sql)
scripts/import-csv.mjs      Bulk CSV -> credits.json + seed SQL importer
wrangler.jsonc              Pages + D1 (`startup-credits`) config
```

Live site `site` is set in `apps/credits-wiki/astro.config.mjs` (`https://credits.kyeshimizu.com`).

## Run it

Requires Node `>=22.12.0`, pnpm `11`.

```sh
pnpm install
pnpm dev                                   # astro dev for credits-wiki
pnpm --filter @wholeearth/credits-data typecheck
pnpm --filter @wholeearth/credits-wiki check
pnpm -r build
```

## Add or edit a program

1. Edit `packages/credits-data/src/credits.json`.
2. Run typecheck + build to validate (see below).
3. Open a pull request.

Each entry is a `Credit`:

| Field | Rules |
|---|---|
| `slug` | Unique kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`). Used as `/credits/<slug>`. |
| `provider` | Company name, e.g. `"Amazon Web Services"`. |
| `program` | Offer name, e.g. `"AWS Activate"`. |
| `category` | One of `cloud`, `ai`, `devtools`, `database`, `analytics`, `productivity`, `customer-support`, `sales-marketing`, `finance`, `other`. |
| `value` | Display string, e.g. `"Up to $100,000"`. |
| `valueUsd` | Integer USD headline value, or `null` for % discounts / free tiers with no dollar figure. Used for sorting + stats. |
| `duration` | e.g. `"12 months"`, `"2 years"`. Use `"Varies"` when unknown. |
| `eligibility` | One sentence. |
| `stages` | Subset of `pre-seed`, `seed`, `series-a`; use `["any"]` if unrestricted. |
| `requirements` | String array (can be `[eligibility]` if nothing more specific). |
| `howToApply` | One or two sentences. |
| `applyUrl` | Application URL. |
| `website` | Provider origin + `/`, e.g. `"https://aws.amazon.com/"`. |
| `tags` | String array, max ~8, lowercase. |
| `notes` | Optional free text. |
| `updated` | `YYYY-MM-DD`. Set to today when you verify the entry. |
| `sourceUrl` | Public page backing the entry (usually `== applyUrl`). |

Example:

```json
{
  "slug": "aws-activate",
  "provider": "Amazon Web Services",
  "program": "AWS Activate",
  "category": "cloud",
  "value": "Up to $100,000",
  "valueUsd": 100000,
  "duration": "2 years",
  "eligibility": "Unfunded or funded startups less than 10 years old with a working website.",
  "stages": ["pre-seed", "seed", "series-a"],
  "requirements": ["Less than 10 years old", "Working company website"],
  "howToApply": "Apply through AWS Activate with your company email.",
  "applyUrl": "https://aws.amazon.com/activate/",
  "website": "https://aws.amazon.com/",
  "tags": ["cloud", "credits", "iaas"],
  "updated": "2026-09-05",
  "sourceUrl": "https://aws.amazon.com/activate/"
}
```

Validation (`assertCredits` in `packages/credits-data/src/index.ts`) runs at import time and throws on: duplicate/non-kebab slugs, unknown category/stage, non-integer/negative `valueUsd`, bad `updated` date, or missing string fields. The exported `credits` array is sorted by `provider` then `program`.

### Bulk import from CSV

```sh
node scripts/import-csv.mjs /path/to/startup-credits.csv
```

Overwrites `packages/credits-data/src/credits.json` and regenerates `migrations/0002_seed_credits.sql`. Review the diff before committing — slug/category/stage mapping is heuristic (see `mapCategory`/`mapStages` in the script).

### Non-code contributions

- `/suggest` form on the site POSTs to `/api/submissions` (stored in D1 `submissions`, status `pending`/`approved`/`rejected`).
- Detail pages can POST feedback (`relevant`/`outdated`/`incorrect`) to `/api/feedback`.

## Commits

- Branch off `main`, keep changes scoped to one program or one feature.
- `pnpm --filter @wholeearth/credits-data typecheck && pnpm --filter @wholeearth/credits-wiki check && pnpm -r build` must pass.
- Use short imperative messages, e.g. `add vercel for startups`, `update aws-activate value`, `fix category page sort`.
- Push and open a PR against `main`. Data PRs should bump the entry's `updated` date and keep `sourceUrl` verifiable.

## Deploy / DB

- Cloudflare Pages serves `apps/credits-wiki/dist` (see `pages_build_output_dir` in `wrangler.jsonc`).
- D1 database `startup-credits` provides `credits`, `feedback`, `submissions` tables (see `migrations/0001_initial.sql`).
- Apply migrations with wrangler D1 tooling against the database in `wrangler.jsonc`.
