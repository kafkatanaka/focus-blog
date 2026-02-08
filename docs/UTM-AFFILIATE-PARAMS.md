# UTM・アフィリエイトリンク パラメータ設計

Phase 1 改訂版で確定したルール。ShareASale/Personal Capital は後回しでも、今から全リンクに適用する。

---

## 1. Amazon Associates 用

- **ドメイン**: 読者は英語圏想定のため **amazon.com（US）** を使用。日本アソシエイト登録でも US ストアへのリンクで OK。
- **ASIN**: 英語版商品の US ASIN を使用。

### URL 形式

```
https://www.amazon.com/dp/[ASIN]?tag=[YOUR_TAG]-20
&linkCode=as2
&linkId=[article-slug]-[product-type]
```

- **tag**: 既存の Amazon Associates タグ（例: `focusdividend-22`）を使用
- **linkId**: 記事と商品を特定するため、以下のフォーマットで統一

### linkId 命名規則

| 形式 | 説明 | 例 |
|------|------|-----|
| `{article-slug}-{product-type}` | 記事スラグ + 商品種別 | `best-investment-books-random-walk` |
| 書籍 | product-type = 書籍名の短縮（小文字・ハイフン） | `wealth-average-income-simple-path` |
| ツール比較記事 | product-type = 製品名 or 汎用 | `best-budgeting-apps-ynab` |

- 記事スラグ: 全小文字、ハイフン区切り（例: `best-budgeting-apps`）
- 商品タイプ: 短い識別子（例: `random-walk`, `radical-candor`, `four-thousand-weeks`）

### 例（書籍）

- 記事: `wealth-average-income` → 書籍 *The Simple Path to Wealth*  
  `linkId=wealth-average-income-simple-path`
- 記事: `recover-from-bad-performance-review` → 書籍 *Radical Candor*  
  `linkId=recover-from-bad-performance-review-radical-candor`

---

## 2. 将来の ShareASale / Personal Capital 用

### UTM パラメータ（クエリ文字列）

| パラメータ | 値 | 説明 |
|------------|-----|------|
| `utm_source` | `focusdividend` | サイト識別（固定） |
| `utm_medium` | `affiliate` | メディア種別（固定） |
| `utm_campaign` | **記事スラグ** | どの記事からか（例: `best-budgeting-apps`） |
| `utm_content` | **リンク位置** | 同一記事内のどのリンクか（下記） |

### utm_campaign（記事特定）

- **ルール**: 記事のスラグをそのまま使用
- 全小文字、ハイフン区切り
- 例: `best-budgeting-apps`, `negotiate-bills-subscriptions`, `recover-from-bad-performance-review`

### utm_content（リンク位置）

| 値 | 意味 |
|----|------|
| `intro-text` | 記事冒頭のテキストリンク |
| `comparison-table` | 比較表内のリンク |
| `cta-button` | CTA ボタン |
| `further-reading` | 参考書籍セクション |
| `body-inline` | 本文中のインラインリンク（上記に当てはまらない場合） |

### 例（将来の ShareASale リンク）

```
https://www.example-merchant.com/landing
?utm_source=focusdividend
&utm_medium=affiliate
&utm_campaign=best-budgeting-apps
&utm_content=comparison-table
```

---

## 3. 運用メモ

- **今**: Amazon のみ実装。`tag` と `linkId` を全リンクに付与
- **申請後**: ShareASale/Personal Capital のリンクには上記 UTM を付与
- トラッキングスプレッドシートの「utm_campaign」列には記事スラグを記録すると、レポートと照合しやすい

---

最終更新: 2026年2月（Phase 1 改訂版）
