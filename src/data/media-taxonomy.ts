/** Editorial taxonomy — validation & display (locale-specific labels come later). */

export const PILLAR_SLUGS = ['framework', 'focus', 'work', 'money', 'habits'] as const;
export type PillarSlug = (typeof PILLAR_SLUGS)[number];

/** Blog frontmatter `category` values (framework is a separate page, not blog category). */
export const BLOG_CATEGORIES = ['focus', 'work', 'money', 'habits'] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const ARTICLE_TYPES = [
  'guide',
  'decide',
  'compare',
  'explain',
  'review',
  'tool',
  'essay',
] as const;
export type ArticleType = (typeof ARTICLE_TYPES)[number];

export const CONSOLIDATION_STATUSES = [
  'keep',
  'refresh',
  'differentiate',
  'merge_candidate',
  'redirect_candidate',
  'noindex_candidate',
  'review',
] as const;
export type ConsolidationStatus = (typeof CONSOLIDATION_STATUSES)[number];

/** Initial cluster slugs — refined via inventory + overrides, not enforced on legacy posts. */
export const CLUSTER_SLUGS = [
  'decision-making',
  'overthinking-information-overload',
  'career-change',
  'career-growth',
  'salary-negotiation',
  'work-burnout',
  'focus-management',
  'deep-work',
  'productivity-systems',
  'productivity-tools',
  'money-anxiety',
  'personal-finance',
  'investing-decisions',
  'behavior-change',
  'habit-building',
] as const;
export type ClusterSlug = (typeof CLUSTER_SLUGS)[number];

export function isBlogCategory(value: string): value is BlogCategory {
  return (BLOG_CATEGORIES as readonly string[]).includes(value);
}

export function isArticleType(value: string): value is ArticleType {
  return (ARTICLE_TYPES as readonly string[]).includes(value);
}

export function isClusterSlug(value: string): value is ClusterSlug {
  return (CLUSTER_SLUGS as readonly string[]).includes(value);
}
