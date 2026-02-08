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

---

## Phase 1 完了状況（2026年2月）

| 項目 | 状態 |
|------|------|
| 開示ページ・フッター・サイトマップ | ✅ 完了 |
| 開示文 49記事 + スタイル（小さい・グレー） | ✅ 完了 |
| 書籍系6記事の Amazon リンク | ✅ 完了（best-career-books 含む） |
| ツール系2記事（headphones, desk-setup） | ✅ 完了 |
| ハウツー5記事の推奨書籍（wealth-average-income 等） | ✅ 完了 |
| UTM 設計・トラッキングテンプレート | ✅ 完了 |
| laptop-stands / blue-light / desk-lamps 記事 | 該当スラグなし → 対象外 |

---

## Phase 1 残タスク（任意）

- [x] **ハウツー4記事に書籍リンク追加**（2026年2月完了）  
  - `handle-being-passed-over-for-promotion`：*So Good They Can't Ignore You*（Cal Newport）  
  - `know-if-youre-growing`：*Designing Your Life*（Bill Burnett & Dave Evans）  
  - `investment-platforms-beginners`：*The Simple Path to Wealth*（JL Collins）  
  - `reading-habits-stick`：*Make Time*（Jake Knapp & John Zeratsky）  
- [ ] **QA（推奨）**  
  - 全 Amazon リンクのクリック動作確認  
  - 開示文の表示・一貫性確認  
  - モバイル表示確認  
- [x] **Amazon Associates 申請**（申請済み）

---

## Week 2 残り作業（完了済み）

- [x] 書籍系3記事の既存 Amazon リンク確認・linkId/UTM 付与
- [x] UTM 設計ドキュメント確認（`docs/UTM-AFFILIATE-PARAMS.md`）
- [x] トラッキングスプレッドシート作成（列は `docs/AFFILIATE-TRACKING-TEMPLATE.md` 参照）

---

## Week 3 実装（完了済み）

- [x] 開示文: Tier 2 前半16記事
- [x] ツール系2記事: headphones, desk-setup（standing desks）
- [x] ハウツー5記事: 上表から1–2冊ずつ推奨書籍追加

---

## Week 4 実装（完了済み）

- [x] 開示文: Tier 2 後半17記事（全49記事に開示＋スタイル）
- [x] 書籍系2記事: behavior-change, focus books
- [x] ツール系3記事: 該当スラグなしのためスキップ
- [x] ハウツー5記事: 推奨書籍追加（上記「残タスク」の4記事は任意）
- [ ] QA: 全 Amazon リンク動作・開示一貫性・モバイル表示（推奨）

---

最終更新: 2026年2月（Phase 1 改訂版）
