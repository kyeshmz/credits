Execute Phase 3 of the plan at `.plans/startup-credits-monorepo.md`.

## What this phase must achieve
At the end of this phase every program has a detail page, every category has a filtered list page, table headers sort on click, and Ctrl K / Cmd K opens a working search modal.

## Read this first
Open `.plans/startup-credits-monorepo.md`. The sections that apply to you: Conventions in force, Evidence, Existing code to reuse, Phase 3, Out of scope, Halt surfaces, Definition of done. Also read `~/.claude/skills/handoff-contract/SKILL.md` and `~/.claude/agents/implementer.md` — you are acting as the implementer role defined there and must report in that format.

## Files you own in this phase
- `apps/credits-wiki/src/pages/credits/[slug].astro`
- `apps/credits-wiki/src/pages/categories/index.astro`
- `apps/credits-wiki/src/pages/categories/[category].astro`
- `apps/credits-wiki/src/scripts/table.ts`
- `apps/credits-wiki/src/scripts/search.ts`
- `apps/credits-wiki/src/layouts/Base.astro` (MODIFY only as the plan states: add the script tag before `</body>`)
Do not create, edit, or delete any file outside this list, except the plan file, where you may tick your phase's `#### Automated verification` checkboxes and append to `## Execution log`. Generated `apps/credits-wiki/.astro/` and `apps/credits-wiki/dist/` are build output, gitignored, and fine to produce.

## Already on disk from earlier phases
- Root pnpm workspace (`package.json`, `pnpm-workspace.yaml`, `.npmrc`, `.gitignore`, `tsconfig.base.json`, `pnpm-lock.yaml`).
- `packages/credits-data/` — `@wholeearth/credits-data` exporting `credits`, `categories`, `getCredit`, `creditsByCategory`, `CATEGORY_LABELS`, `STAGE_LABELS`, `CATEGORIES`, `STAGES`, and types `Credit`, `Category`, `Stage`.
- `apps/credits-wiki/` — Astro 7 app with `src/styles/global.css` (models.dev-derived, includes `.badge`, `.badge-list`, `.detail-body`, `.apply-button`, `.footer-note`), `src/layouts/Base.astro`, `src/components/{Header,HelpDialog,SearchDialog,CreditsTable}.astro`, `src/pages/index.astro`. `SearchDialog.astro` already renders the dialog shell and a `<script type="application/json" id="search-index">` with `{slug, provider, program, category, categoryLabel, value, duration, tags}` per credit. `CreditsTable.astro` already emits `table[data-enhanced-table]`, `th.sortable[data-type]` with `.sort-indicator` spans, and `td[data-sort]` cells.

## Conventions that apply here
- Build (app): `pnpm --filter @wholeearth/credits-wiki build`
- Typecheck (app): `pnpm --filter @wholeearth/credits-wiki check`
- TypeScript strict. ESM only.
- Styling: use only the classes already in `global.css`; do not edit `global.css` (not owned in this phase). If a needed style is missing, use the closest existing class and note it in your report rather than adding CSS.
- Forbidden here: Tailwind, any CSS framework, React/Vue/Svelte, any client-side routing, `any` in TypeScript, committing `node_modules` or `dist`.
- Commits: do not commit; leave changes unstaged. The planner commits at the end.

## Verification you must run
- `pnpm --filter @wholeearth/credits-wiki check` — Astro typecheck passes including the two client scripts
- `pnpm --filter @wholeearth/credits-wiki build` — static build emits every detail and category page
- `node -e "const fs=require('fs');const p='apps/credits-wiki/dist/';const slugs=JSON.parse(fs.readFileSync('packages/credits-data/src/credits.json','utf8')).map(c=>c.slug);for(const s of slugs){const f=p+'credits/'+s+'.html';if(!fs.existsSync(f))throw new Error('missing '+f);const h=fs.readFileSync(f,'utf8');if(!h.includes('class=\"fact-grid\"')||!h.includes('class=\"apply-button\"'))throw new Error('detail markup missing in '+s)}for(const c of ['cloud','ai','analytics'])if(!fs.existsSync(p+'categories/'+c+'.html'))throw new Error('missing category '+c);if(!fs.existsSync(p+'categories.html'))throw new Error('missing categories index');console.log('ok',slugs.length,'detail pages')"` — every program and category page exists with detail markup
- `node -e "const h=require('fs').readFileSync('apps/credits-wiki/dist/index.html','utf8'); if(!/<script[^>]*src=\"\/_astro\/|<script type=\"module\">/.test(h)) throw new Error('no bundled client script'); console.log('ok')"` — the sort/search scripts are bundled into the page

## Out of scope for this dispatch
- Anything under `packages/`, and every file under `apps/credits-wiki/` not in your owned list (in particular `global.css`, `CreditsTable.astro`, `SearchDialog.astro`, `Header.astro`, `index.astro`).
- Provider logos, mobile menu, deployment config.

Report in the format your role definition specifies. Your final message is all I will see, so make it complete on its own.
These instructions supersede any conflicting general instruction in your own role definition. Do only the work described here.
