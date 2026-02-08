# Phase 3 残り作業: 既存記事 → 新記事・ピラー リンク追加マッピング

**目的:** テーマクラスターに沿って、既存325記事から Phase 2 の5本および4ピラーへのリンクを追加する。  
**参照:** IMPLEMENTATION-SPEC「Cross-Category Linking」「Theme Clusters」  
**作業量目安:** 優先度Tier 1のみで 約50記事 × 1リンク = 5–8時間。全実施で 20–30時間。

---

## リンク先一覧（Phase 2 新記事・ピラー）

| 種別 | スラグ or パス | 説明 |
|------|----------------|------|
| NEW | `sleep-deprived-investors-financial-decisions` | Article 1: 睡眠不足と投資判断 |
| NEW | `attention-cost-portfolio-checking` | Article 2: ポートフォリオ頻繁チェックのコスト |
| NEW | `cognitive-cost-saas-sprawl` | Article 3: SaaSスプロールの認知コスト |
| NEW | `index-funds-vs-stocks-cognitive-load` | Article 4: インデックス vs 個株の認知負荷 |
| NEW | `sleep-quality-career-investments` | Article 5: 睡眠・キャリア・投資の関係 |
| Pillar | `/focus/attention-management-guide` | Attention Management Guide |
| Pillar | `/work/sustainable-productivity-guide` | Sustainable Productivity Guide |
| Pillar | `/money/intentional-money-guide` | Intentional Money Guide |
| Pillar | `/habits/behavior-design-guide` | Behavior Design Guide |

**リンク形式:** 記事本文内では `[アンカーテキスト](/slug)` または `[アンカーテキスト](/category/pillar-path)`。末尾スラッシュなしで統一。

---

## 実施済み（Phase 3 リンク追加済み記事）

| 既存記事 slug | 追加したリンク先 |
|---------------|------------------|
| `sleep-focus-relationship` | sleep-quality-career-investments |
| `money-attention-problems` | attention-cost-portfolio-checking |
| `financial-systems-reduce-willpower` | attention-cost-portfolio-checking, index-funds-vs-stocks-cognitive-load |
| `how-to-build-financial-calm` | attention-cost-portfolio-checking, /money/intentional-money-guide |
| `reduce-financial-stress` | sleep-deprived-investors-financial-decisions, attention-cost-portfolio-checking |
| `investment-platforms-beginners` | attention-cost-portfolio-checking, index-funds-vs-stocks-cognitive-load |
| `hidden-cost-financial-multitasking` | attention-cost-portfolio-checking |
| `morning-evening-focus` | sleep-quality-career-investments |

---

## テーマ1: Sleep & Cognitive Performance

**追加するリンク先:** Article 5 (`sleep-quality-career-investments`), Article 1 (`sleep-deprived-investors-financial-decisions`), 該当ピラー

| 既存記事 slug | 追加リンク先 | 推奨アンカー例・配置メモ |
|---------------|--------------|---------------------------|
| `sleep-focus-relationship` | sleep-quality-career-investments | 「キャリアと投資への影響は別記事で」など文脈に合わせて |
| `sleep-focus-relationship` | /habits/behavior-design-guide | 末尾 Related または「習慣設計の全体像」 |
| `why-focus-harder-afternoon` | sleep-quality-career-investments | 午後の集中低下と睡眠の関係で言及 |
| `focus-cost-of-decision-fatigue` | sleep-deprived-investors-financial-decisions | 判断疲れ・睡眠・金銭判断のつながり |
| `morning-evening-focus` | sleep-quality-career-investments | 睡眠とピーク時間の話の流れで |
| `sleep-tracking-apps-comparison` | sleep-quality-career-investments | 測定の先の「なぜ睡眠がキャリア・投資に効くか」 |
| `stress-focus-impact` | sleep-quality-career-investments | ストレス・睡眠・パフォーマンス |
| `trade-off-time-energy-work` | sleep-quality-career-investments | エネルギーと睡眠の関係 |
| `how-knowledge-workers-burn-out-quietly` | sleep-quality-career-investments | バーンアウトと睡眠・回復 |

---

## テーマ2: Attention & Decision Fatigue × Money（投資・お金の注意コスト）

**追加するリンク先:** Article 1, 2, 4, `money-attention-problems`, `financial-systems-reduce-willpower`, Intentional Money Guide

| 既存記事 slug | 追加リンク先 | 推奨アンカー例・配置メモ |
|---------------|--------------|---------------------------|
| `money-attention-problems` | attention-cost-portfolio-checking | ポートフォリオチェックの具体例として |
| `money-attention-problems` | sleep-deprived-investors-financial-decisions | 睡眠と金銭判断 |
| `financial-systems-reduce-willpower` | attention-cost-portfolio-checking | 自動化で「チェックしない」設計 |
| `financial-systems-reduce-willpower` | index-funds-vs-stocks-cognitive-load | インデックス＝システム化の一例 |
| `how-to-build-financial-calm` | attention-cost-portfolio-checking | 平静さと「チェック頻度を下げる」 |
| `how-to-build-financial-calm` | /money/intentional-money-guide | ピラー全体 |
| `reduce-financial-stress` | sleep-deprived-investors-financial-decisions | ストレス・睡眠・判断 |
| `reduce-financial-stress` | attention-cost-portfolio-checking | ストレス源としての頻繁チェック |
| `hidden-cost-financial-multitasking` | attention-cost-portfolio-checking | マルチタスクとポートフォリオチェック |
| `money-stress-isnt-about-math` | sleep-deprived-investors-financial-decisions | 感情・睡眠と判断 |
| `financial-anxiety-shapes-decisions` | sleep-deprived-investors-financial-decisions | 不安・睡眠・判断 |
| `investment-platforms-beginners` | index-funds-vs-stocks-cognitive-load | インデックスの認知負荷の話 |
| `investment-platforms-beginners` | attention-cost-portfolio-checking | チェック頻度を下げる |
| `best-investment-books-beginners` | index-funds-vs-stocks-cognitive-load | インデックス本とセットで |
| `best-investment-books-beginners` | /money/intentional-money-guide | ピラー |
| `wealth-average-income` | index-funds-vs-stocks-cognitive-load | シンプル投資・認知負荷 |
| `uncertainty-money-decisions` | sleep-deprived-investors-financial-decisions | 不確実性・疲労・判断 |
| `focus-problems-are-decision-problems` | attention-cost-portfolio-checking | 決定問題としての「いつチェックするか」 |
| `attention-management-beats-time-management` | attention-cost-portfolio-checking | 注意の配分と投資 |

---

## テーマ3: Environment & Systems × Tools（ツール・システム）

**追加するリンク先:** Article 3 (`cognitive-cost-saas-sprawl`), Sustainable Productivity Guide, Attention Management Guide

| 既存記事 slug | 追加リンク先 | 推奨アンカー例・配置メモ |
|---------------|--------------|---------------------------|
| `productivity-tools-destroy-focus` | cognitive-cost-saas-sprawl | ツール過多のコストとして |
| `solo-project-management-tools-guide` | cognitive-cost-saas-sprawl | ツールを絞る話の流れで |
| `focus-tools-that-actually-matter` | cognitive-cost-saas-sprawl | 本当に必要なツール数 |
| `context-switching-drains-energy` | cognitive-cost-saas-sprawl | コンテキストスイッチとツール数 |
| `focus-cost-of-constant-messages` | cognitive-cost-saas-sprawl | 通知・ツール・認知負荷 |
| `how-environment-beats-self-control` | cognitive-cost-saas-sprawl | 環境設計＝ツール環境の整理 |
| `why-paper-and-pen-beat-productivity-apps` | cognitive-cost-saas-sprawl | アプリを減らす選択 |
| `wfh-tools-article` | cognitive-cost-saas-sprawl | 在宅ツールの最小化 |
| `time-blocking-apps-comparison` | cognitive-cost-saas-sprawl | ツール1つに絞る考え方 |
| `note-taking-apps-deep-work` | cognitive-cost-saas-sprawl | ノート1本化 |
| `job-harder-than-it-should` | cognitive-cost-saas-sprawl | 仕事の重さとツール負荷 |
| `what-deep-work-actually-requires` | cognitive-cost-saas-sprawl | 深い仕事とツール削減 |
| `what-deep-work-actually-requires` | /focus/attention-management-guide | ピラー |
| `how-knowledge-workers-burn-out-quietly` | cognitive-cost-saas-sprawl | バーンアウトとツール過多 |
| `what-sustainable-career-looks-like` | /work/sustainable-productivity-guide | ピラー |

---

## テーマ4: Burnout & Sustainability

**追加するリンク先:** Article 5, Sustainable Productivity Guide, Behavior Design Guide

| 既存記事 slug | 追加リンク先 | 推奨アンカー例・配置メモ |
|---------------|--------------|---------------------------|
| `how-knowledge-workers-burn-out-quietly` | sleep-quality-career-investments | 回復・睡眠 |
| `recover-from-career-burnout` | sleep-quality-career-investments | 回復の基盤として睡眠 |
| `trade-off-time-energy-work` | sleep-quality-career-investments | エネルギーと睡眠 |
| `what-sustainable-career-looks-like` | sleep-quality-career-investments | 持続可能なキャリアと睡眠 |
| `habits-survive-bad-days` | sleep-quality-career-investments | 悪い日と睡眠・習慣 |
| `why-focus-feels-harder` | sleep-quality-career-investments | 集中と睡眠（該当する slug で） |
| `stop-measuring-worth-by-output` | /work/sustainable-productivity-guide | ピラー |
| `set-boundaries-demanding-bosses` | /work/sustainable-productivity-guide | ピラー |
| `the-career-cost-of-always-saying-yes` | /work/sustainable-productivity-guide | ピラー |
| `being-reliable-is-not-the-same-as-being-valuable` | /work/sustainable-productivity-guide | ピラー |

---

## テーマ5: 習慣・行動設計（ピラー＋Article 5）

**追加するリンク先:** Article 5, Behavior Design Guide, Intentional Money Guide

| 既存記事 slug | 追加リンク先 | 推奨アンカー例・配置メモ |
|---------------|--------------|---------------------------|
| `how-environment-beats-self-control` | sleep-quality-career-investments | 環境設計と睡眠環境 |
| `why-keystone-habits-matter-most` | sleep-quality-career-investments | キーストーンハビットとして睡眠 |
| `how-habits-really-form` | sleep-quality-career-investments | 習慣と睡眠のループ |
| `sleep-tracking-apps-comparison` | sleep-quality-career-investments | 測定→改善の先のキャリア・投資 |
| `morning-routine-apps-comparison` | sleep-quality-career-investments | 朝の習慣と睡眠 |
| `best-sleep-tracking-apps` 等 | sleep-quality-career-investments | 該当 slug があれば |
| `financial-systems-reduce-willpower` | /money/intentional-money-guide | ピラー |
| `money-attention-problems` | /money/intentional-money-guide | ピラー |

---

## 実施優先度（Tier）

- **Tier 1（最優先）:** テーマ1・2の「睡眠」「投資・お金の注意」クラスター。既存の Money / Focus の重要記事から Article 1, 2, 4, 5 と Intentional Money Guide へ。約 25 記事。
- **Tier 2:** テーマ3「ツール・SaaS」。Work / Focus から Article 3 と Sustainable・Attention ピラーへ。約 15 記事。
- **Tier 3:** テーマ4・5「バーンアウト・習慣」。Work / Habits から Article 5 と各ピラーへ。約 15 記事。

---

## 作業ルール（実装時）

1. **1記事に足すリンクは 1〜2本まで** を目安にし、自然な文脈の場所に置く（「詳しくは」「関連して」など）。
2. **既に同じ先へのリンクがある記事はスキップ** する。
3. **末尾の Related Reading に追加** するだけでも可。その場合は「関連: [タイトル](/slug)」形式でよい。
4. **アンカーは多様に:** 「睡眠と投資判断」「ポートフォリオをあまり見ないほうがよい理由」「ツールを減らす」「睡眠とキャリア」など、被りすぎないようにする。

---

## 次のステップ

1. **Tier 1 から実施:** 上記テーマ1・2の表を元に、該当する既存記事の MD を開き、1記事ずつ 1 リンク追加。
2. **一覧の更新:** 追加済みの記事はこのドキュメントで「実施済」などマークして重複作業を防ぐ。
3. **Tier 2 → Tier 3** の順で同様に実施。

このマッピングを元に、まず Tier 1 の数記事から実際のリンク追加を始めることも可能です。
