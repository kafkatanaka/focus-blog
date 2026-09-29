# Content inventory & SEO guardrails (PR 1)

## Commands

| Script | Purpose |
|--------|---------|
| `npm run build-inventory` | `generated/content-inventory.json` + `.csv` + `tag-inventory.json` |
| `npm run audit-content-graph` | `generated/content-graph-audit.json` (warnings for orphans, broken relations) |
| `npm run build` | Runs inventory + sitemap generation in `prebuild` |

## Override registry

Editorial fields for legacy posts live in `src/data/content-overrides.yml` (not bulk frontmatter edits).

Priority: **frontmatter** → **content-overrides.yml** → **inferred defaults**.

## Canonical URLs

Single helper: `src/lib/site-url.ts` — used by layouts, article pages, and `scripts/generate-sitemap.ts`.

Rules: `https://focus-dividend.com`, no trailing slash (`astro.config.mjs` `trailingSlash: 'never'`).
