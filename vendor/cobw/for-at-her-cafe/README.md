# Add to `kafkatanaka/at_her_cafe` (COBW)

Copy these files into the **at_her_cafe** repository so Focus Dividend can sync from a single exported JSON—without copying YAML by hand.

## Layout (target)

```text
at_her_cafe/
  data/cobw-ideas.yaml      ← source of truth (ideas + youtube blocks)
  scripts/export-registry.mjs
  public/cobw-registry.json ← generated; commit on export
  package.json              ← script: "export-registry": "node scripts/export-registry.mjs"
```

## Steps

1. Move or author ideas in `data/cobw-ideas.yaml` using stable `id: cobw_XXX` fields.
2. Copy `scripts/export-registry.mjs` from this folder into the COBW repo (adjust `SOURCE` path if needed).
3. Run `npm run export-registry` and commit `public/cobw-registry.json`.
4. Optional: add `.github/workflows/export-cobw-registry.yml` from this folder so every push to `data/cobw-ideas.yaml` refreshes the JSON.

## Focus Dividend consumer (both repos private)

- Admin default source:  
  `github:kafkatanaka/at_her_cafe@main:public/cobw-registry.json`  
  (GitHub Contents API + PAT on `/admin` — not raw.githubusercontent.com)
- Optional: workflow `push-registry-to-focus-blog.yml` mirrors JSON into focus-blog
- Admin: `/admin/cobw` → **Sync from COBW**

## Pull mirror into focus-blog (developers)

From `focus-blog` with a token that can read the private COBW repo:

```bash
GITHUB_TOKEN=ghp_... npm run cobw:pull-from-cobw
```

This updates `vendor/cobw/data/cobw-ideas.yaml` and re-runs `cobw:export-registry`.
