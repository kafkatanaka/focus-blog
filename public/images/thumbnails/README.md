# 記事サムネイル (Thumbnails)

## 置き場所

- **ディレクトリ:** `public/images/thumbnails/`
- **公開URL:** `/images/thumbnails/{ファイル名}`

## 仕様

- **形式:** WebP
- **推奨サイズ:** 1200×630px（OGP推奨比率 1.91:1）
- **用途:** 記事一覧（正方形で表示）、記事詳細（タイトル直下）、OGP（og:image）

## 命名規則

- **ルール:** 記事のスラッグと同一のファイル名
- **例:** 記事 `src/content/blog/why-you-cant-focus.md` → サムネイル `why-you-cant-focus.webp`
- フロントマターで `thumbnail` を指定しない場合、`/images/thumbnails/{slug}.webp` が自動で使われます。
- 個別に変えたい場合は frontmatter で `thumbnail: "custom-name.webp"` のように指定可能（同じディレクトリ内のファイル名）。

## プレースホルダー

- **ファイル名:** `placeholder.webp`
- **置き場所:** `public/images/thumbnails/placeholder.webp`
- **用途:** サムネイル未設定の記事で表示。1200×630px の WebP を用意する。
