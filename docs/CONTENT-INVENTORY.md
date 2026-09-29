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

Stable IDs live in `src/data/content-ids.yml` (`fd-en-000001`, `fd-ja-000001`, …). Inventory `articleId` is the stable ID; `slug` and `url` reflect the current file.

New posts: `npm run sync-content-ids` (also runs in `prebuild`).

Override keys: stable `articleId`, `en:slug`, `ja:slug`, slug, or full path (e.g. `/jp/work/foo`).

## Canonical URLs & routes

- **Route SSOT**: `resolveArticlePath` / `getArticlePath` in `src/lib/locale.ts`
- **Canonical strings**: `src/lib/site-url.ts` (`canonicalUrl`, `canonicalUrlForArticle`)
- English articles: `/{slug}` — Japanese: `/jp/{category}/{slug}`
- Locale code: `en` | `ja` (URL prefix `/jp/` does not change locale value)
- `trailingSlash: 'never'` in `astro.config.mjs`

Sitemap and inventory import the same metadata builders in `src/lib/content-metadata.ts`.

## Inventory file counts

`article-master-template.md` is excluded from inventory (authoring template only).
