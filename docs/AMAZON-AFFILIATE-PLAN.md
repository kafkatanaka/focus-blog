# Amazon アフィリエイト 実装計画（記事 × 書籍/ツール）

Phase 1 改訂版: Amazon 先行実装。どの記事にどの書籍・ツールを入れるか一覧。

---

## 書籍系記事（最優先・6記事）

| 記事スラグ | 対応 | Week | メモ |
|------------|------|------|------|
| best-money-management-books-couples | 既存リンク確認・最適化 | 2 | 開示済み |
| best-investment-books-beginners | 既存リンク確認・最適化 | 2 | 開示済み |
| best-productivity-books-careers | 既存リンク確認・最適化 | 2 | 開示済み |
| best-behavior-change-books | 書籍リンク追加 | 4 | |
| best-focus-attention-books-beginners | 書籍リンク追加 | 4 | 「Best Books on Focus」 |

---

## ツール系記事（次優先・5記事）

| 記事スラグ | 対応 | Week | メモ |
|------------|------|------|------|
| noise-canceling-headphones-focus | ヘッドホン製品リンク | 3 | Best Noise-Canceling Headphones |
| desk-setup-concentration | スタンディングデスク等 | 3 | Standing Desks に該当する記事として利用可 |
| （standing-desks 記事が別にあれば） | スタンディングデスク | 3 | スラグ要確認 |
| （laptop-stands） | ラップトップスタンド | 4 | スラグ要確認 |
| （blue-light-glasses） | ブルーライトメガネ | 4 | スラグ要確認 |
| （desk-lamps） | デスクランプ | 4 | スラグ要確認 |

※ 括弧のスラグはブログに同名記事がある場合。なければ desk-setup-concentration や focus 系ツール記事に統合しても可。

---

## ハウツー記事内の書籍推奨（10記事）

| 記事スラグ | 推奨書籍 | linkId 例 |
|------------|----------|------------|
| wealth-average-income | *The Simple Path to Wealth* | wealth-average-income-simple-path |
| recover-from-bad-performance-review | *Radical Candor* | recover-from-bad-performance-review-radical-candor |
| stop-measuring-worth-by-output | *Four Thousand Weeks* | stop-measuring-worth-by-output-four-thousand-weeks |
| morning-routine-apps-comparison | *The Miracle Morning* | morning-routine-apps-comparison-miracle-morning |
| negotiate-salary-without-feeling-pushy | *Never Split the Difference* | negotiate-salary-never-split |
| handle-being-passed-over-for-promotion | キャリア本（要選定） | — |
| know-if-youre-growing / career系 | *Designing Your Life* | career-article-designing-your-life |
| investment-platforms-beginners | 投資本（既存 or 追加） | — |
| （how-money-affects-sleep） | *Why We Sleep* | 該当記事スラグ要確認 |
| reading-habits-stick | 読書術本（要選定） | reading-habits-stick-xxx |

---

## Week 2 残り作業

- [ ] 書籍系3記事の既存 Amazon リンク確認・linkId/UTM 付与
- [ ] UTM 設計ドキュメント確認（`docs/UTM-AFFILIATE-PARAMS.md`）
- [ ] トラッキングスプレッドシート作成（列は `docs/AFFILIATE-TRACKING-TEMPLATE.md` 参照）

---

## Week 3 実装

- [ ] 開示文: Tier 2 前半16記事
- [ ] ツール系2記事: headphones, desk-setup（standing desks）
- [ ] ハウツー5記事: 上表から1–2冊ずつ推奨書籍追加

---

## Week 4 実装

- [ ] 開示文: Tier 2 後半17記事（全50記事完了）
- [ ] 書籍系2記事: behavior-change, focus books
- [ ] ツール系3記事: laptop-stands, blue-light-glasses, desk-lamps（該当スラグがあれば）
- [ ] ハウツー5記事: 残りの書籍推奨
- [ ] QA: 全 Amazon リンク動作・開示一貫性・モバイル表示

---

最終更新: 2026年2月（Phase 1 改訂版）
