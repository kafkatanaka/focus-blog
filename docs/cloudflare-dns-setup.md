# Cloudflare DNS 設定ガイド（focus-dividend.com）

focus-dividend.com を Cloudflare で管理し、ブログ（**Cloudflare Pages**: `focus-blog.pages.dev`）に繋ぐ手順です。

---

## 前提：現在の構成

- **focus.matomeyo.me** → CNAME `focus` → `focus-blog.pages.dev`（Cloudflare Pages）
- **focus-dividend.com** → 新規ドメイン（Cloudflare で取得済み）、まだレコードなし

---

## 1. focus-dividend.com の設定（新ドメイン）

### 1-1. Cloudflare Pages にカスタムドメインを追加（先にやる）

1. Cloudflare ダッシュボード → **Workers & Pages** → **focus-blog** プロジェクトを開く
2. **「設定」** → **「カスタムドメイン」**（Custom domains）
3. **「ドメインを設定」** で次を追加：
   - `focus-dividend.com`
   - `www.focus-dividend.com`
4. 追加後、Pages が「このドメインの DNS を確認します」と表示する（DNS を設定するまで「保留」のまま）

### 1-2. focus-dividend.com のゾーンで DNS レコードを追加

**focus-dividend.com** の **「DNS」→「レコード」** で次を追加：

| タイプ | 名前 | コンテンツ | プロキシ |
|--------|------|------------|----------|
| **CNAME** | `@` | `focus-blog.pages.dev` | **プロキシ済み**（オレンジの雲） |
| **CNAME** | `www` | `focus-blog.pages.dev` | **プロキシ済み** |

- ルート（@）の CNAME は Cloudflare が CNAME フラット化で解決するのでそのままで問題ありません。
- 保存後、数分〜十数分で Pages の「カスタムドメイン」が有効になります。

### 1-3. SSL/TLS（focus-dividend.com ゾーン）

**「SSL/TLS」** → 暗号化モードは **「フル」** のまま（Cloudflare Pages はそのままで問題なし）。

---

## 2. focus.matomeyo.me の扱い（旧ドメイン）

**matomeyo.me** のゾーンでは、現在 **focus** が CNAME → `focus-blog.pages.dev` になっています。

### 選択肢 A: 両方とも同じサイトで使う（そのまま）

- **何もしない**。focus.matomeyo.me も focus-dividend.com も同じブログを表示します。
- 検索エンジンには「本ドメインは focus-dividend.com」と伝えたい場合は、サイト内の canonical や sitemap を focus-dividend.com に統一済みなので、徐々に focus-dividend.com が優先されます。

### 選択肢 B: 旧ドメインから新ドメインへ 301 リダイレクト（推奨）

検索・ブックマークを新ドメインに寄せたい場合は、**matomeyo.me** ゾーンでリダイレクトを設定します。

1. **matomeyo.me** を選択 → **「ルール」** → **「リダイレクトルール」**（Redirect rules）
2. **「ルールを作成」**
3. 例：
   - **ルール名**: `focus to focus-dividend`
   - **条件**: 「含む」→ フィールド「ホスト名」→ 値 `focus.matomeyo.me`
   - **アクション**: 「Dynamic redirect」または「Static redirect」
     - **URL のリダイレクト先**: `https://focus-dividend.com/$1`
     - **ステータスコード**: `301`（恒久的なリダイレクト）
4. 保存

※ 条件の書き方は UI によって「ホスト名が `focus.matomeyo.me` と等しい」などでも可。  
これで `https://focus.matomeyo.me/xxx` → `https://focus-dividend.com/xxx` に 301 転送されます。

**focus の CNAME レコード**は**削除しない**でください。削除すると focus.matomeyo.me が名前解決できず、リダイレクトが動きません。CNAME のままにしておき、リダイレクトルールが先に効く形にします。

---

## 3. ドメインを「今から」Cloudflare に追加する場合（参考）

focus-dividend.com をまだ Cloudflare に追加していない場合：

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com/) にログイン
2. **「サイトを追加」**（Add a site）をクリック
3. **focus-dividend.com** を入力 → **「サイトを追加」**
4. プランは **「Free」** で **「始める」**
5. 既存の DNS レコードがスキャンされるので、必要なものだけ残し **「続行」**

**Cloudflare Registrar で取得した場合**はネームサーバー変更は不要です。

---

## 4. 他のホスティング（Vercel / Netlify）の場合の参考

### パターン A: Vercel にデプロイしている場合

Vercel の **Project → Settings → Domains** で **focus-dividend.com** を追加し、表示される案内に従う。

一般的な設定例：

| タイプ | 名前 | コンテンツ | プロキシ |
|--------|------|------------|----------|
| **A**  | `@`  | `76.76.21.21` | プロキシ済み（オレンジの雲） |
| **CNAME** | `www` | `cname.vercel-dns.com` | プロキシ済み |

※ Vercel のドメイン画面に表示される IP / CNAME をそのまま使ってください。

### パターン B: Netlify にデプロイしている場合

Netlify の **Site → Domain management → Add custom domain** で **focus-dividend.com** を追加。

一般的な設定例：

| タイプ | 名前 | コンテンツ | プロキシ |
|--------|------|------------|----------|
| **A**  | `@`  | `75.2.60.5` | プロキシ済み |
| **CNAME** | `www` | `あなたのサイト名.netlify.app` | プロキシ済み |

※ Netlify の「Set up Netlify DNS」や「Configure DNS」の案内に表示される値を使ってください。

### ルートドメイン（@）について

- **A レコード**：ホスティング先が指定する IP をそのまま入力
- **CNAME フラット化**：Cloudflare はルート（@）で CNAME を利用可能。Vercel / Netlify の「ルート用 CNAME」の案内があればそれに従う

---

## 4. SSL/TLS の設定（重要）

Cloudflare 経由で HTTPS にするため、ここを合わせないとリダイレクトループになることがあります。

1. Cloudflare ダッシュボードで **「SSL/TLS」** を開く
2. **暗号化モード** を **「フル」** または **「フル（ストリクト）」** に設定
   - **フル**：Cloudflare ↔ オリジン間も HTTPS（証明書は自己署名でも可）
   - **フル（ストリクト）**：オリジンで有効な証明書が必要（Vercel/Netlify は対応済みなので「フル（ストリクト）」で問題ないことが多い）

Vercel / Netlify を使う場合は **「フル」** または **「フル（ストリクト）」** のどちらかで統一する。

---

## 5. その他のおすすめ設定

### 常時 HTTPS（リダイレクト）

- **SSL/TLS** の **「Edge 証明書」** で **「Always Use HTTPS」** をオンにすると、`http://` アクセスを `https://` にリダイレクトできる。

### www の有無をそろえる（任意）

- **ルール** → **「リダイレクトルール」** で、  
  - `https://www.focus-dividend.com/*` → `https://focus-dividend.com/$1`（301）  
  のように「www あり → なし」にそろえると、SEO 的にも分かりやすい。

### 旧ドメイン（focus.matomeyo.me）のリダイレクト（任意）

- 旧ドメインも Cloudflare に追加し、**「ページルール」** または **「リダイレクトルール」** で  
  `https://focus.matomeyo.me/*` → `https://focus-dividend.com/$1`（301）  
  を設定すると、検索エンジンとブックマークの移行がスムーズになる。

---

## 6. 確認の流れ

1. ネームサーバー変更後、[DNS Checker](https://dnschecker.org/) で **focus-dividend.com** の A / CNAME が Cloudflare の IP やホスティング先を向いているか確認
2. ブラウザで `https://focus-dividend.com` にアクセスして表示を確認
3. Vercel / Netlify の「ドメインの検証」が完了しているか、各管理画面で確認

---

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| 「リダイレクトが繰り返しました」 | SSL/TLS を **「フル」** または **「フル（ストリクト）」** にし、Vercel/Netlify 側でも HTTPS のみにしているか確認 |
| 502 Bad Gateway | オリジン（Vercel/Netlify）のデプロイとドメイン設定が正しいか確認。一時的に SSL を「フレキシブル」にして原因切り分け |
| ドメインが検証されない | DNS の A / CNAME がホスティング先の案内どおりか再確認。反映に最大 48 時間かかることがある |

---

**参照**

- [Cloudflare: DNS レコードの管理](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)
- [Vercel: カスタムドメイン](https://vercel.com/docs/projects/domains)
- [Netlify: カスタムドメイン](https://docs.netlify.com/domains-https/custom-domains/)
