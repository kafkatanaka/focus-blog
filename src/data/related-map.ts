/**
 * 手動で関連記事を上書きするマップ。
 * キー: 記事の slug、値: 関連記事の slug の配列（表示順）。
 * ここに無い記事は tag ベースの自動関連が使われます。
 */
export const relatedMap: Record<string, string[]> = {
  // Phase 2 + Phase 3: 新記事どうし・既存記事との関連を固定
  "sleep-deprived-investors-financial-decisions": [
    "sleep-quality-career-investments",
    "attention-cost-portfolio-checking",
    "money-attention-problems",
    "sleep-focus-relationship",
    "financial-systems-reduce-willpower",
  ],
  "attention-cost-portfolio-checking": [
    "index-funds-vs-stocks-cognitive-load",
    "sleep-deprived-investors-financial-decisions",
    "money-attention-problems",
    "financial-systems-reduce-willpower",
    "context-switching-drains-energy",
  ],
  "cognitive-cost-saas-sprawl": [
    "productivity-tools-destroy-focus",
    "context-switching-drains-energy",
    "focus-problems-are-decision-problems",
    "solo-project-management-tools-guide",
    "how-environment-beats-self-control",
  ],
  "index-funds-vs-stocks-cognitive-load": [
    "attention-cost-portfolio-checking",
    "sleep-deprived-investors-financial-decisions",
    "financial-systems-reduce-willpower",
    "money-attention-problems",
    "career-growth-is-leverage",
  ],
  "sleep-quality-career-investments": [
    "sleep-deprived-investors-financial-decisions",
    "sleep-focus-relationship",
    "how-knowledge-workers-burn-out-quietly",
    "trade-off-time-energy-work",
    "how-environment-beats-self-control",
  ],
};
