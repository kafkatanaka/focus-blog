# デプロイ手順（記事追加後）

## 1. ビルド確認（ローカル）

```bash
npm run build
```

- `prebuild` で `scripts/generate-sitemap.mjs` が実行され、`public/sitemap.xml` が更新される
- 続けて `astro build` が実行され、`dist/` が生成される
- エラーが出たら内容を確認して修正してから push

## 2. コミット & プッシュ

```bash
git add .
git status   # 追加した記事・変更内容を確認
git commit -m "Add new article: 記事タイトル or 説明"
git push origin main
```

## 3. Cloudflare Pages でのデプロイ

Git と連携していれば **push するだけで自動デプロイ**されます。

- Cloudflare Dashboard → **Workers & Pages** → 対象プロジェクト
- **Deployments** で最新のビルド状況を確認
- ビルド設定: Build command `npm run build`、Output directory `dist`

## ビルド設定（参考）

| 項目 | 値 |
|------|-----|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION` = `18` |

## トラブル時

- **ビルド失敗:** Cloudflare の Deployments で「View build logs」を開き、エラー行を確認
- **sitemap に新記事が含まれない:** `npm run build` で prebuild が動いているか確認（`public/sitemap.xml` の更新日時）
- **404:** 記事の `draft: true` を外したか、ファイルが `src/content/blog/*.md` にあるか確認
