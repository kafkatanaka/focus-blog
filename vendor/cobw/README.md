# COBW Idea Registry (export source)

This folder mirrors the **COBW** repository layout for local development and CI. In production, the Cost of Being Wrong repo owns `data/cobw-ideas.yaml` and runs the export script; Focus Dividend only consumes `public/cobw-registry.json` (or a remote URL).

```text
data/cobw-ideas.yaml   →  scripts/cobw/export-registry.mjs  →  public/cobw-registry.json
```

Do not copy `ideas.yaml` into Focus Dividend for manual edits. Change ideas in COBW, export, then sync from `/admin/cobw`.
