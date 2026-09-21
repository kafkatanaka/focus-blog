# COBW × Focus Dividend sync

## Architecture

- **Source of truth:** [kafkatanaka/at_her_cafe](https://github.com/kafkatanaka/at_her_cafe) — `data/cobw-ideas.yaml`
- **Export (COBW repo):** `node scripts/export-registry.mjs` → `public/cobw-registry.json`  
  Template: `vendor/cobw/for-at-her-cafe/`
- **Consumer URL (default):**  
  `https://raw.githubusercontent.com/kafkatanaka/at_her_cafe/main/public/cobw-registry.json`
- **Focus Dividend:** `/admin/cobw` → `syncCobwRegistry()` → `data/cobw-sync-state.json` (GitHub)
- **Dev mirror:** `vendor/cobw/data/cobw-ideas.yaml` + `public/cobw-registry.json` in focus-blog (fallback only)
- **Stable key:** `cobw_id` (unique per idea)

Focus Dividend never edits COBW ideas. Sync updates only `sourceTitle`, `sourceCategory`, `sourcePremise`, and YouTube metadata.

## Admin

| Route | Purpose |
|-------|---------|
| `/admin` | Generic Markdown upload |
| `/admin/cobw` | Registry sync, draft generation, publish |

1. Save GitHub token on `/admin`.
2. Open `/admin/cobw` (default registry URL points at **at_her_cafe** export; falls back to `/cobw-registry.json` if missing).
3. **Sync from COBW** — imports ~30 ideas without generating articles.
4. **Generate article** — writes `src/content/blog/{slug}.md` with `source_type: cobw`, `series: cost-of-being-wrong`.
5. **Publish** — sets `draft: false` and refreshes `youtube_url` from sync state.

## Article frontmatter

```yaml
source_type: cobw
cobw_id: cobw_001
series: cost-of-being-wrong
source_title: "..."
seo_title: "..."
youtube_url: null
youtube_video_id: null
```

## Series page

`/series/cost-of-being-wrong` lists published posts where `series: cost-of-being-wrong`.

## Video webhook (Cloudflare Pages)

`POST /api/admin/cobw/video-published`

```json
{
  "cobw_id": "cobw_003",
  "youtube_video_id": "abc123",
  "youtube_url": "https://www.youtube.com/watch?v=abc123",
  "published_at": "2026-09-22T00:00:00Z"
}
```

Environment variables on Cloudflare Pages:

- `GITHUB_TOKEN` — token with `repo` scope to update `data/cobw-sync-state.json`
- `COBW_WEBHOOK_SECRET` — optional; require `Authorization: Bearer <secret>`

Idempotent: safe to retry. If no article exists yet, only sync state is updated.

## Tests

```bash
npm run cobw:test
```

## at_her_cafe setup

1. Copy contents of `vendor/cobw/for-at-her-cafe/` into [at_her_cafe](https://github.com/kafkatanaka/at_her_cafe).
2. Ensure every idea has stable `id: cobw_XXX` and optional `youtube:` block.
3. Run export and commit `public/cobw-registry.json` (or enable the included GitHub Action).

## Refresh focus-blog mirror (private repo)

```bash
GITHUB_TOKEN=ghp_... npm run cobw:pull-from-cobw
```

Requires a token with read access to `at_her_cafe`. Updates `vendor/cobw/data/cobw-ideas.yaml` and `public/cobw-registry.json`.

## Cloud Agent / CI access

If automated jobs return 404 for `at_her_cafe`, grant the token or environment access to that private repository, or publish `public/cobw-registry.json` and rely on the raw URL.
