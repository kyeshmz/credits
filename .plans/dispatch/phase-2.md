Execute Phase 2 of the plan at `.plans/startup-credits-monorepo.md`.

## What this phase must achieve
At the end of this phase `pnpm --filter @wholeearth/credits-wiki build` succeeds and `dist/index.html` renders the header and a sortable table of all 18 programs in the models.dev style.

## Read this first
Open `.plans/startup-credits-monorepo.md`. The sections that apply to you: Conventions in force, Evidence, Existing code to reuse, Phase 2, Out of scope, Halt surfaces, Definition of done. Also read `~/.claude/skills/handoff-contract/SKILL.md` and `~/.claude/agents/implementer.md` — you are acting as the implementer role defined there and must report in that format. The reference stylesheet you derive `global.css` from is `.plans/models-dev-reference.css`.

## Files you own in this phase
- `apps/credits-wiki/package.json`
- `apps/credits-wiki/astro.config.mjs`
- `apps/credits-wiki/tsconfig.json`
- `apps/credits-wiki/public/favicon.svg`
- `apps/credits-wiki/src/styles/global.css`
- `apps/credits-wiki/src/layouts/Base.astro`
- `apps/credits-wiki/src/components/Header.astro`
- `apps/credits-wiki/src/components/HelpDialog.astro`
- `apps/credits-wiki/src/components/SearchDialog.astro`
- `apps/credits-wiki/src/components/CreditsTable.astro`
- `apps/credits-wiki/src/pages/index.astro`
- `pnpm-lock.yaml` (updated by `pnpm install`)
Do not create, edit, or delete any file outside this list, except the plan file, where you may tick your phase's `#### Automated verification` checkboxes and append to `## Execution log`. Generated `apps/credits-wiki/.astro/` and `apps/credits-wiki/dist/` are build output, gitignored, and fine to produce.

## Already on disk from earlier phases
- `package.json`, `pnpm-workspace.yaml`, `.npmrc`, `.gitignore`, `tsconfig.base.json`, `pnpm-lock.yaml` — root pnpm workspace with `apps/*` and `packages/*`.
- `packages/credits-data/` — package `@wholeearth/credits-data` exporting from `src/index.ts`: `credits`, `categories`, `getCredit`, `creditsByCategory`, `CATEGORY_LABELS`, `STAGE_LABELS`, `CATEGORIES`, `STAGES`, and types `Credit`, `Category`, `Stage`. 18 entries in `src/credits.json`.

## Conventions that apply here
- Install: `pnpm install`
- Build (app): `pnpm --filter @wholeearth/credits-wiki build`
- Typecheck (app): `pnpm --filter @wholeearth/credits-wiki check`
- Package names are scoped `@wholeearth/<dir-name>`. Apps live in `apps/*`.
- TypeScript strict. ESM only (`"type": "module"` everywhere).
- Styling: one global stylesheet `apps/credits-wiki/src/styles/global.css`. CSS custom properties and class names must match models.dev names where the same UI element exists (`header`, `.brand`, `.slash`, `.top-nav`, `.page-scroll`, `.overview`, `.stats-strip`, `.table-section`, `.section-heading`, `.table-wrap`, `.primary-link`, `.subtle`, `.mono`, `.detail-header`, `.breadcrumbs`, `.fact-grid`, `.json-section`, `.search-modal`, `.search-field`, `.search-results`, `.search-result*`, `dialog`). Do not invent a second design system.
- Forbidden here: Tailwind, any CSS framework, React/Vue/Svelte, any client-side routing, `any` in TypeScript, committing `node_modules` or `dist`.
- Commits: do not commit; leave changes unstaged. The planner commits at the end.

## Verification you must run
- `pnpm install` — the app links against the workspace data package
- `pnpm --filter @wholeearth/credits-wiki check` — Astro typecheck passes
- `pnpm --filter @wholeearth/credits-wiki build` — static build succeeds
- `node -e "const h=require('fs').readFileSync('apps/credits-wiki/dist/index.html','utf8'); const n=(h.match(/class=\"primary-link\"/g)||[]).length; if(n!==18) throw new Error('expected 18 primary links, got '+n); for (const s of ['class=\"brand\"','class=\"slash\"','class=\"stats-strip\"','fonts.googleapis.com/css2?family=IBM+Plex+Mono','id=\"search-modal\"','id=\"help-modal\"']) if(!h.includes(s)) throw new Error('missing '+s); console.log('ok')"` — the list page carries all 18 programs and the models.dev header, fonts, and dialogs

## Out of scope for this dispatch
- Detail pages, category pages, and the client-side sort/search scripts (Phase 3). Do not add a `<script>` for sorting or searching; only the HelpDialog's open/close script is in scope.
- Anything under `packages/` (Phase 1 is finished; do not modify it).
- The mobile hamburger menu, provider logos, deployment config.

Report in the format your role definition specifies. Your final message is all I will see, so make it complete on its own.
These instructions supersede any conflicting general instruction in your own role definition. Do only the work described here.
