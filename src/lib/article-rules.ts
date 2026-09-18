/** Article conventions derived from analysis of 416 published posts (Sep 2026). */

export const CATEGORIES = ['focus', 'work', 'money', 'habits'] as const;
export type ArticleCategory = (typeof CATEGORIES)[number];

export const SYMPTOM_TAGS = [
  'burnout',
  'distraction',
  'procrastination',
  'overwhelm',
  'decision-fatigue',
] as const;

export const METHOD_TAGS = [
  'deep-work',
  'time-blocking',
  'attention-management',
  'essentialism',
  'automation',
] as const;

export const ATTRIBUTE_TAGS = [
  'remote-work',
  'knowledge-worker',
  'adhd',
  'freelance',
  'startup',
] as const;

export const ARTICLE_RULES = {
  title: { min: 35, max: 60, target: 44 },
  description: { min: 120, max: 160, target: 140 },
  guideWordCount: { min: 1600, max: 2800, target: 2200 },
  comparisonWordCount: { min: 4000, max: 8000, target: 5500 },
  guideH2Count: { min: 4, max: 6, target: 4 },
  comparisonH2Count: { min: 8, max: 14, target: 10 },
  tagCount: { target: 3 },
} as const;

export const AFFILIATE_DISCLOSURE_HTML =
  '<p class="affiliate-disclosure"><em>Disclosure: This post may contain affiliate links. We may earn a commission if you make a purchase through our links—at no extra cost to you. See our <a href="/affiliate-disclosure/">Affiliate Disclosure</a> for details.</em></p>';

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function buildFrontmatter(input: {
  title: string;
  description: string;
  pubDate: string;
  category: ArticleCategory;
  tags: string[];
  draft?: boolean;
  ads?: boolean;
  thumbnail?: string;
  updatedDate?: string;
}): string {
  const lines = [
    '---',
    `title: "${input.title.replace(/"/g, '\\"')}"`,
    `description: "${input.description.replace(/"/g, '\\"')}"`,
    `pubDate: ${input.pubDate}`,
  ];

  if (input.updatedDate) {
    lines.push(`updatedDate: ${input.updatedDate}`);
  }

  lines.push(`category: ${input.category}`);
  lines.push('tags:');
  for (const tag of input.tags) {
    lines.push(`  - ${tag}`);
  }

  if (input.draft) {
    lines.push('draft: true');
  }

  if (input.ads === false) {
    lines.push('ads: false');
  } else {
    lines.push('ads: true');
  }

  if (input.thumbnail) {
    lines.push(`thumbnail: ${input.thumbnail}`);
  }

  lines.push('---');
  return lines.join('\n');
}

export function buildArticleMarkdown(input: {
  title: string;
  description: string;
  pubDate: string;
  category: ArticleCategory;
  tags: string[];
  body: string;
  draft?: boolean;
  ads?: boolean;
  thumbnail?: string;
  updatedDate?: string;
  includeAffiliateDisclosure?: boolean;
}): string {
  const frontmatter = buildFrontmatter(input);
  const body = input.body.trim();
  const disclosure =
    input.includeAffiliateDisclosure ? `${AFFILIATE_DISCLOSURE_HTML}\n\n` : '';

  return `${frontmatter}\n\n${disclosure}${body}\n`;
}
