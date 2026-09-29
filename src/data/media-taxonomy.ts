/** Editorial taxonomy — validation & display (locale-specific labels come later). */

/** All blog `category` values (includes framework for Japanese posts). */
export const CONTENT_CATEGORIES = ['framework', 'focus', 'work', 'money', 'habits'] as const;
export type ContentCategory = (typeof CONTENT_CATEGORIES)[number];

/** English category listing pages under `/{category}` (framework is `/framework`, not a blog list). */
export const EN_NAV_CATEGORIES = ['focus', 'work', 'money', 'habits'] as const;
export type EnNavCategory = (typeof EN_NAV_CATEGORIES)[number];

export const PILLAR_SLUGS = CONTENT_CATEGORIES;
export type PillarSlug = ContentCategory;

/** @deprecated Use EN_NAV_CATEGORIES for English blog-only filters */
export const BLOG_CATEGORIES = EN_NAV_CATEGORIES;
export type BlogCategory = EnNavCategory;

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

export function isContentCategory(value: string): value is ContentCategory {
  return (CONTENT_CATEGORIES as readonly string[]).includes(value);
}

export function isEnNavCategory(value: string): value is EnNavCategory {
  return (EN_NAV_CATEGORIES as readonly string[]).includes(value);
}

export function isBlogCategory(value: string): value is BlogCategory {
  return isEnNavCategory(value);
}

export function isArticleType(value: string): value is ArticleType {
  return (ARTICLE_TYPES as readonly string[]).includes(value);
}

export function isClusterSlug(value: string): value is ClusterSlug {
  return (CLUSTER_SLUGS as readonly string[]).includes(value);
}
