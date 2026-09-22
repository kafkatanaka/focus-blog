# COBW × Focus Dividend sync

## Architecture

- **Source of truth:** [kafkatanaka/at_her_cafe](https://github.com/kafkatanaka/at_her_cafe) — `data/cobw-ideas.yaml`  
  (Wave 1: `config/cobw-opportunity-map/inventory.csv` → bootstrap; runtime pipeline remains Supabase `topics` — see at_her_cafe `docs/COBW-REGISTRY.md`)
- **Stable IDs:** `cobw_opp_###` (from `COBW-OPP-###`), not title-derived slugs
- **at_her_cafe PR:** merge [PR #187](https://github.com/kafkatanaka/at_her_cafe/pull/187) before first production sync
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
6. **YouTube link (optional)** — per-row field on `/admin/cobw` writes `youtube_url` / `youtube_video_id` to the article when both article and video exist (order does not matter).

### Loose coupling (articles ↔ videos)

- COBW articles use `source_type: cobw`, `cobw_id`, `series: cost-of-being-wrong` in frontmatter.
- Publish articles first; add YouTube later via dashboard, registry **Sync**, or **Apply saved YouTube links to articles** (batch).
- Future: YouTube channel crawl can suggest matches by title / description `cobw_id`—human confirm in the same UI.

## Article frontmatter

```yaml
source_type: cobw
cobw_id: cobw_opp_001
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

## After at_her_cafe PR #187 merges

1. Merge focus-blog COBW pipeline PR (#2) if not already on `main`.
2. Create PAT with read on **at_her_cafe**, read/write on **focus-blog** → save on `/admin`.
3. `/admin/cobw` → leave registry as  
   `github:kafkatanaka/at_her_cafe@main:public/cobw-registry.json` → **Sync from COBW**  
   Expect **30 ideas**, **4** with `youtube_status: published`. Dev mirror IDs (`cobw_001` …) drop from sync state automatically if no article was created.
4. Generate **1 draft** → review → publish; then batch in small groups.
5. (Optional) In at_her_cafe: set `FOCUS_BLOG_PAT` and enable `push-registry-to-focus-blog.yml` so focus-blog’s `public/cobw-registry.json` mirror updates on each export.

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
