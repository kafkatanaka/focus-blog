# アフィリエイト トラッキングスプレッドシート（列定義）

Google スプレッドシートなどで運用するときの列構成。今から記録を始め、承認後にデータ入力する。

---

## 推奨列

| 列名 | 説明 | 例 |
|------|------|-----|
| **Article Slug** | 記事スラグ（utm_campaign と一致） | `best-investment-books-beginners` |
| **Link Type** | プログラム種別 | `Amazon` / `(Future) YNAB` |
| **Product/Service** | 商品・サービス名 | `Random Walk` / `YNAB` |
| **Link Position** | 記事内の位置（utm_content） | `comparison-table` / `further-reading` |
| **Status** | 実装状態 | `承認前` / `リンク挿入済` / `申請待ち` |
| **Clicks** | クリック数（月次など） | — |
| **Conversions** | コンバージョン数 | — |
| **Revenue** | 収益 | — |
| **Notes** | メモ | 承認日、ASIN など |

---

## 運用のポイント

- **今**: Article Slug + Link Type + Product/Service + Status を記録し、「どの記事にどのリンクを入れる予定か」を管理
- **承認後**: Clicks / Conversions / Revenue をレポートから転記
- **utm_campaign** は Article Slug と同一にすると、GA やマーチャントレポートと照合しやすい

---

## サンプル行（記入例）

| Article Slug | Link Type | Product/Service | Link Position | Status | Clicks | Conversions | Revenue | Notes |
|--------------|-----------|-----------------|---------------|--------|--------|-------------|---------|-------|
| best-investment-books-beginners | Amazon | Random Walk | comparison-table | リンク挿入済 | — | — | — | tag: focusdividend-22 |
| budgeting-apps-ranked-reviewed | (Future) YNAB | YNAB | intro-text | 申請待ち | — | — | — | トラフィック増加後に申請 |

---

最終更新: 2026年2月（Phase 1 改訂版）
