# COBW × Focus Dividend sync

## Architecture

- **Source of truth:** [kafkatanaka/at_her_cafe](https://github.com/kafkatanaka/at_her_cafe) — `data/cobw-ideas.yaml`
- **Export (COBW repo):** `node scripts/export-registry.mjs` → `public/cobw-registry.json`  
  Template: `vendor/cobw/for-at-her-cafe/`
- **Consumer (default, both repos private):**  
  `github:kafkatanaka/at_her_cafe@main:public/cobw-registry.json`  
  Loaded via **GitHub Contents API** + PAT saved on `/admin` (not raw.githubusercontent.com).
- **Focus Dividend:** `/admin/cobw` → `syncCobwRegistry()` → `data/cobw-sync-state.json` (GitHub)
- **Dev mirror:** `vendor/cobw/data/cobw-ideas.yaml` + `public/cobw-registry.json` in focus-blog (fallback only)
- **Stable key:** `cobw_id` (unique per idea)

Focus Dividend never edits COBW ideas. Sync updates only `sourceTitle`, `sourceCategory`, `sourcePremise`, and YouTube metadata.

## Admin

| Route | Purpose |
|-------|---------|
| `/admin` | Generic Markdown upload |
| `/admin/cobw` | Registry sync, draft generation, publish |

1. Save a **Personal Access Token** on `/admin` with `repo` scope and access to **both** `at_her_cafe` and `focus-blog` (fine-grained: Contents read on COBW, read/write on focus-blog).
2. Open `/admin/cobw` (default source is the private COBW export via `github:…` API; falls back to `/cobw-registry.json` if the file is not in COBW yet).
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

## Both repositories private

| Mechanism | How it works |
|-----------|----------------|
| **Admin Sync** | Browser calls GitHub API with your PAT → reads `at_her_cafe/.../cobw-registry.json` → upserts `focus-blog/data/cobw-sync-state.json` |
| **CLI pull** | `GITHUB_TOKEN=... npm run cobw:pull-from-cobw` |
| **Optional CI** | `vendor/cobw/for-at-her-cafe/.github/workflows/push-registry-to-focus-blog.yml` copies JSON into focus-blog after export |
| **Video webhook** | Cloudflare `GITHUB_TOKEN` updates focus-blog only (no COBW read) |

Raw `https://raw.githubusercontent.com/...` URLs **do not work** for private repos without authentication. Do not rely on them unless COBW is made public.

## Cloud Agent / CI access

Grant automation tokens read access to `at_her_cafe`, or enable the push-to-focus-blog workflow so the mirror in focus-blog stays updated.
