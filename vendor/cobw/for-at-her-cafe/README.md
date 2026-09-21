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

## Focus Dividend consumer

- Default registry URL:  
  `https://raw.githubusercontent.com/kafkatanaka/at_her_cafe/main/public/cobw-registry.json`
- Admin: `/admin/cobw` → **Sync from COBW**
- If the remote file is missing, the admin UI falls back to `focus-blog/public/cobw-registry.json` (dev mirror only).

## Pull mirror into focus-blog (developers)

From `focus-blog` with a token that can read the private COBW repo:

```bash
GITHUB_TOKEN=ghp_... npm run cobw:pull-from-cobw
```

This updates `vendor/cobw/data/cobw-ideas.yaml` and re-runs `cobw:export-registry`.
