# The Focus Dividend

English-language AdSense blog at **focus.matomeyo.me**. Built with Astro + Cloudflare Pages. Reading-focused, minimal images.

## Stack

- **Astro** (SSG) + **MDX** for posts
- **Tailwind CSS** for layout
- **Content Collections** for blog entries
- **Cloudflare Pages** for hosting

## First-time setup

```bash
cd focus-blog
npm install
npm run build
```

Then push to GitHub and connect the repo to Cloudflare Pages. See **DNS / Cloudflare 設定** below for the subdomain.

## Commands

| Command        | Action                                      |
|----------------|---------------------------------------------|
| `npm install`  | Install dependencies                        |
| `npm run dev`  | Start dev server at `localhost:4321`        |
| `npm run build`| Build for production → `dist/`              |
| `npm run preview` | Preview production build locally         |

## Project structure

- `src/content/blog/` — MDX articles (frontmatter: title, description, pubDate, tags, draft)
- `src/pages/` — Routes (index, blog, about, rss.xml)
- `src/layouts/` — BaseLayout, BlogPost
- `src/components/` — Header, Footer, AdSense
- `public/` — favicon, robots.txt, static assets

## AdSense

Replace `ca-pub-YOUR_ID` in:

- `src/layouts/BaseLayout.astro` (script src)
- `src/components/AdSense.astro` (data-ad-client)

Use your real publisher ID after AdSense approval.

## OG image (optional)

Add `public/og-default.png` (e.g. 1200×630) and in `BaseLayout.astro` set:

```ts
const image = ogImage ?? new URL('/og-default.png', site).href;
```

Then use `image` in the meta tag (remove the `{image && ...}` conditional if you always want a default).

---

## DNS / Cloudflare 設定（サブドメイン）

サブドメイン **focus.matomeyo.me** を Cloudflare Pages に向ける手順です。

### 前提

- **matomeyo.me** の DNS がすでに Cloudflare で管理されていること
- このリポジトリを GitHub に push し、Cloudflare Pages にデプロイ済みであること

### 1. Cloudflare Pages でカスタムドメインを追加

1. [Cloudflare Dashboard](https://dash.cloudflare.com) にログイン
2. **Workers & Pages** → このプロジェクト（focus-blog など）を選択
3. **Custom domains** → **Set up a custom domain**
4. `focus.matomeyo.me` を入力して **Continue**
5. 画面の指示に従う（通常は「DNS レコードを追加」と表示される）

### 2. DNS レコードを追加（まだの場合）

**matomeyo.me** の **DNS** タブで:

1. **Add record**
2. 設定:
   - **Type:** `CNAME`
   - **Name:** `focus`（サブドメインのみ。`focus.matomeyo.me` ではない）
   - **Target:** Cloudflare Pages が表示する値（例: `focus-blog.pages.dev`）
   - **Proxy status:** **Proxied**（オレンジの雲）
   - **TTL:** Auto
3. **Save**

### 3. 初回だけ CNAME を仮で打っておく場合

デプロイ前に DNS だけ先に用意する場合:

1. **Target** を一時的に `matomeyo-me.pages.dev` など適当な値にしておく
2. デプロイ後、Cloudflare Pages の **Custom domains** に表示される正しい **Target**（例: `xxxx.pages.dev`）に **DNS の CNAME の Target を更新**

### 4. SSL

Cloudflare で Proxied にしていれば、SSL 証明書は自動で発行・更新されます。数分〜最大24時間かかることがあります。

### 5. 確認

- `https://focus.matomeyo.me` にアクセスして表示を確認
- `https://focus.matomeyo.me/sitemap-index.xml` で sitemap を確認
- `https://focus.matomeyo.me/rss.xml` で RSS を確認

---

## Finalize before deploy (pillar full content)

Framework と Focus は全文済み。Work も全文反映済み。Money と Habits を元 MD で上書きする場合:

**1. 元 MD の置き場所**

Downloads にある 4 つの MD を **`src/content/pillar-sources/`** に移動またはコピーする。ファイル名はそのまま。

- `src/content/pillar-sources/attention-management-guide.md`（Focus）
- `src/content/pillar-sources/sustainable-productivity-guide.md`（Work）
- `src/content/pillar-sources/intentional-money-guide.md`（Money）
- `src/content/pillar-sources/behavior-design-guide.md`（Habits）

**2. リンク修正 + frontmatter 付きで MDX を生成**

```bash
# Money と Habits だけ上書きする場合
node scripts/pillar-link-fix.mjs src/content/pillar-sources/intentional-money-guide.md src/pages/money/intentional-money-guide.mdx --frontmatter
node scripts/pillar-link-fix.mjs src/content/pillar-sources/behavior-design-guide.md src/pages/habits/behavior-design-guide.mdx --frontmatter

# 3 本（Work / Money / Habits）まとめて生成する場合
node scripts/write-pillars.mjs
```

**3. ビルド & サイトマップ**

```bash
npm run build
node scripts/generate-sitemap.mjs
```

その後、commit → push でデプロイ。

## Deploy (Cloudflare Pages)

1. GitHub にリポジトリを push
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Connect to Git**
3. リポジトリを選択
4. **Build settings:**
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** （空欄）
   - **Environment variables:** `NODE_VERSION` = `18`
5. **Save and Deploy**
6. デプロイ完了後、上記「DNS / Cloudflare 設定」のとおり `focus.matomeyo.me` をカスタムドメインとして追加・CNAME を設定
