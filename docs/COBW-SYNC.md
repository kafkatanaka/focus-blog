# COBW × Focus Dividend sync

## Architecture

- **Source of truth:** COBW Idea Registry (`vendor/cobw/data/cobw-ideas.yaml` in the COBW repo; dev mirror in this repo).
- **Export:** `npm run cobw:export-registry` → `public/cobw-registry.json`
- **Consumer:** Focus Dividend `/admin/cobw` → `syncCobwRegistry()` → `data/cobw-sync-state.json` (GitHub)
- **Stable key:** `cobw_id` (unique per idea)

Focus Dividend never edits COBW ideas. Sync updates only `sourceTitle`, `sourceCategory`, `sourcePremise`, and YouTube metadata.

## Admin

| Route | Purpose |
|-------|---------|
| `/admin` | Generic Markdown upload |
| `/admin/cobw` | Registry sync, draft generation, publish |

1. Save GitHub token on `/admin`.
2. Open `/admin/cobw`, set registry URL (default `/cobw-registry.json` or raw GitHub URL from COBW export).
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

## COBW repo checklist

When the COBW repository is available:

1. Copy `scripts/cobw/export-registry.mjs` and point it at `data/cobw-ideas.yaml`.
2. Publish `public/cobw-registry.json` (or CI artifact).
3. Set Focus Dividend registry URL to that endpoint.
