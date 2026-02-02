/**
 * 手動で関連記事を上書きするマップ。
 * キー: 記事の slug、値: 関連記事の slug の配列（表示順）。
 * ここに無い記事は tag ベースの自動関連が使われます。
 */
export const relatedMap: Record<string, string[]> = {
  // 例: 検索流入・滞在の多い記事だけここに追加
  // "why-good-habits-feel-harder-than-bad-ones": [
  //   "focus-is-not-willpower",
  //   "emotional-cost-of-falling-off",
  // ],
};
