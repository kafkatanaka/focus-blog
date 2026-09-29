# Editorial home (PR 2)

Configuration:

- `src/data/editorial/en-home.yml`
- `src/data/editorial/ja-home.yml`

Article references use **stable IDs** from `src/data/content-ids.yml` (`fd-en-000001`, `fd-ja-000001`, …).

## Validation

`npm run validate-editorial` (also runs in `prebuild`) fails the build when:

- articleId does not exist
- locale mismatch (e.g. `fd-ja-*` on English home)
- referenced article is `draft: true`
- duplicate IDs in the same list

Invalid ID example error:

```text
EditorialConfigError: editorial/en-home.yml: unknown articleId fd-en-999999
```

Sections with zero resolved articles are omitted from the rendered page.
