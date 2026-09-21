# COBW Idea Registry (export source)

**Canonical repo:** [kafkatanaka/at_her_cafe](https://github.com/kafkatanaka/at_her_cafe)

Focus Dividend is a **consumer** only. The COBW repo owns `data/cobw-ideas.yaml` and publishes `public/cobw-registry.json`.

This folder holds a **dev mirror** until `at_her_cafe` export is live:

```text
at_her_cafe/data/cobw-ideas.yaml  →  export  →  public/cobw-registry.json
                                                      ↓
focus-blog /admin/cobw  ←  sync  ←  raw.githubusercontent.com/.../cobw-registry.json
```

- Drop-in files for the COBW repo: `vendor/cobw/for-at-her-cafe/`
- Refresh mirror from GitHub: `GITHUB_TOKEN=... npm run cobw:pull-from-cobw`

Do not edit `vendor/cobw/data/cobw-ideas.yaml` for production changes—change ideas in **at_her_cafe**, export, then sync from `/admin/cobw`.
