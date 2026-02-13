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

## 固定ページ・ピラー記事の OGP

- **置き場所:** `public/images/thumbnails/`（記事と同じ）
- **命名規則:** 記事と同じ。**URL パスの最後のセグメントをスラッグとして `{slug}.webp`**
  - `/framework/` → `framework.webp`
  - `/focus/attention-management-guide/` → `attention-management-guide.webp`
  - `/work/sustainable-productivity-guide/` → `sustainable-productivity-guide.webp`
  - `/money/intentional-money-guide/` → `intentional-money-guide.webp`
  - `/habits/behavior-design-guide/` → `behavior-design-guide.webp`
- **仕様:** 記事サムネイルと同じ（WebP、推奨 1200×630px）

## プレースホルダー

- **ファイル名:** `placeholder.webp`
- **置き場所:** `public/images/thumbnails/placeholder.webp`
- **用途:** サムネイル未設定の記事で表示。1200×630px の WebP を用意する。
