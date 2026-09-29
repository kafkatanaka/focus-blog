import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import type { CollectionEntry } from 'astro:content';
import {
  getEntryForStableId,
  isStableArticleId,
  loadContentIdsRegistry,
} from './content-ids';
import { getArticlePath, getPostLocale, type Locale } from './locale';
import { thumbnailPathFor } from './posts';
import type { ArticleType } from '../data/media-taxonomy';
import { isArticleType } from '../data/media-taxonomy';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

export type SituationPrompt = {
  label: string;
  href?: string;
  articleId?: string;
};

export type EditorialHomeConfig = {
  hero: { title: string; subtitle: string; articleId?: string };
  situationPrompts?: SituationPrompt[];
  featured?: string[];
  decisionGuides?: string[];
  comparisons?: string[];
  toolsSystems?: string[];
  editorsPicks?: string[];
  latest?: { max: number; articleIds?: string[] };
  browseAll?: { label: string; href: string };
  explore?: { category: string }[];
};

export type ResolvedEditorialArticle = {
  articleId: string;
  entry: CollectionEntry<'blog'>;
  href: string;
  thumbnailPath: string;
  articleType: ArticleType | null;
};

export type ResolvedEditorialHome = {
  config: EditorialHomeConfig;
  heroArticle?: ResolvedEditorialArticle;
  situationLinks: { label: string; href: string }[];
  featured: ResolvedEditorialArticle[];
  decisionGuides: ResolvedEditorialArticle[];
  comparisons: ResolvedEditorialArticle[];
  toolsSystems: ResolvedEditorialArticle[];
  editorsPicks: ResolvedEditorialArticle[];
  latest: ResolvedEditorialArticle[];
  exploreCategories: { slug: string; href: string; label: string }[];
};

export class EditorialConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EditorialConfigError';
  }
}

function inferArticleTypeFromTitle(title: string): ArticleType | null {
  const t = title.toLowerCase();
  if (t.startsWith('how to ') || t.includes(' guide')) return 'guide';
  if (t.startsWith('should ') || t.includes('should you ')) return 'decide';
  if (t.includes(' vs ') || t.includes(' versus ') || t.startsWith('best ')) return 'compare';
  if (t.startsWith('what is ') || t.startsWith('why ')) return 'explain';
  return null;
}

function articleTypeForEntry(entry: CollectionEntry<'blog'>): ArticleType | null {
  const t = entry.data.articleType;
  if (t && isArticleType(t)) return t;
  return inferArticleTypeFromTitle(entry.data.title);
}

export function loadEditorialHomeConfig(locale: Locale): EditorialHomeConfig {
  const file = locale === 'ja' ? 'ja-home.yml' : 'en-home.yml';
  const filePath = path.join(ROOT, 'src', 'data', 'editorial', file);
  const raw = parseYaml(fs.readFileSync(filePath, 'utf8')) as EditorialHomeConfig;
  return raw;
}

function postBySlug(
  posts: CollectionEntry<'blog'>[],
  slug: string
): CollectionEntry<'blog'> | undefined {
  return posts.find((p) => p.slug === slug);
}

/**
 * Validate and resolve stable article IDs for editorial home (throws on invalid refs).
 */
export function resolveEditorialArticleId(
  articleId: string,
  expectedLocale: Locale,
  posts: CollectionEntry<'blog'>[],
  context: string
): ResolvedEditorialArticle {
  if (!isStableArticleId(articleId)) {
    throw new EditorialConfigError(`${context}: "${articleId}" is not a stable article ID`);
  }
  const registry = loadContentIdsRegistry(ROOT);
  const regEntry = getEntryForStableId(articleId, registry);
  if (!regEntry) {
    throw new EditorialConfigError(`${context}: unknown articleId ${articleId}`);
  }
  if (regEntry.locale !== expectedLocale) {
    throw new EditorialConfigError(
      `${context}: articleId ${articleId} is locale ${regEntry.locale}, expected ${expectedLocale}`
    );
  }
  const entry = postBySlug(posts, regEntry.slug);
  if (!entry) {
    throw new EditorialConfigError(
      `${context}: no blog collection entry for slug "${regEntry.slug}" (${articleId})`
    );
  }
  if (entry.data.draft) {
    throw new EditorialConfigError(`${context}: articleId ${articleId} is draft`);
  }
  if (getPostLocale(entry.data) !== expectedLocale) {
    throw new EditorialConfigError(
      `${context}: frontmatter locale mismatch for ${articleId}`
    );
  }
  return {
    articleId,
    entry,
    href: getArticlePath(entry),
    thumbnailPath: thumbnailPathFor(entry),
    articleType: articleTypeForEntry(entry),
  };
}

function resolveIdList(
  ids: string[] | undefined,
  locale: Locale,
  posts: CollectionEntry<'blog'>[],
  context: string
): ResolvedEditorialArticle[] {
  if (!ids?.length) return [];
  const seen = new Set<string>();
  const out: ResolvedEditorialArticle[] = [];
  for (const id of ids) {
    if (seen.has(id)) {
      throw new EditorialConfigError(`${context}: duplicate articleId ${id}`);
    }
    seen.add(id);
    out.push(resolveEditorialArticleId(id, locale, posts, context));
  }
  return out;
}

const CATEGORY_LABELS_EN: Record<string, string> = {
  framework: 'Framework',
  focus: 'Focus',
  work: 'Work',
  money: 'Money',
  habits: 'Habits',
};

const CATEGORY_LABELS_JA: Record<string, string> = {
  framework: 'Framework',
  focus: 'Focus',
  work: 'Work',
  money: 'Money',
  habits: 'Habits',
};

export function buildEditorialHome(
  locale: Locale,
  posts: CollectionEntry<'blog'>[],
  config: EditorialHomeConfig
): ResolvedEditorialHome {
  const published = posts.filter((p) => !p.data.draft && getPostLocale(p.data) === locale);
  const registry = loadContentIdsRegistry(ROOT);

  const heroArticle = config.hero.articleId
    ? resolveEditorialArticleId(
        config.hero.articleId,
        locale,
        published,
        'hero.articleId'
      )
    : undefined;

  const situationLinks: { label: string; href: string }[] = [];
  for (const prompt of config.situationPrompts ?? []) {
    if (prompt.articleId) {
      const resolved = resolveEditorialArticleId(
        prompt.articleId,
        locale,
        published,
        `situationPrompts "${prompt.label}"`
      );
      situationLinks.push({ label: prompt.label, href: resolved.href });
    } else if (prompt.href) {
      situationLinks.push({ label: prompt.label, href: prompt.href });
    }
  }

  const featured = resolveIdList(config.featured, locale, published, 'featured');
  const decisionGuides = resolveIdList(config.decisionGuides, locale, published, 'decisionGuides');
  const comparisons = resolveIdList(config.comparisons, locale, published, 'comparisons');
  const toolsSystems = resolveIdList(config.toolsSystems, locale, published, 'toolsSystems');
  const editorsPicks = resolveIdList(config.editorsPicks, locale, published, 'editorsPicks');

  const usedIds = new Set<string>([
    ...featured,
    ...decisionGuides,
    ...comparisons,
    ...toolsSystems,
    ...editorsPicks,
    ...(heroArticle ? [heroArticle] : []),
  ].map((a) => a.articleId));

  let latest: ResolvedEditorialArticle[] = [];
  if (config.latest?.articleIds?.length) {
    latest = resolveIdList(config.latest.articleIds, locale, published, 'latest.articleIds');
  } else if (config.latest?.max) {
    const sorted = [...published].sort(
      (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
    );
    for (const entry of sorted) {
      const id = Object.entries(registry.articles).find(
        ([, v]) => v.locale === locale && v.slug === entry.slug
      )?.[0];
      if (!id || usedIds.has(id)) continue;
      latest.push({
        articleId: id,
        entry,
        href: getArticlePath(entry),
        thumbnailPath: thumbnailPathFor(entry),
        articleType: articleTypeForEntry(entry),
      });
      if (latest.length >= config.latest.max) break;
    }
  }

  const labels = locale === 'ja' ? CATEGORY_LABELS_JA : CATEGORY_LABELS_EN;
  const base = locale === 'ja' ? '/jp' : '';
  const exploreCategories = (config.explore ?? []).flatMap((item) => {
    const slug = item.category;
    const hasPosts = published.some((p) => p.data.category === slug);
    if (!hasPosts) return [];
    const href =
      locale === 'ja' && slug === 'framework'
        ? '/jp/framework'
        : `${base}/${slug}`;
    return [{ slug, href, label: labels[slug] ?? slug }];
  });

  return {
    config,
    heroArticle,
    situationLinks,
    featured,
    decisionGuides,
    comparisons,
    toolsSystems,
    editorsPicks,
    latest,
    exploreCategories,
  };
}

/** Collect every articleId referenced in YAML for build-time validation. */
export function collectEditorialArticleIds(config: EditorialHomeConfig): string[] {
  const ids: string[] = [];
  if (config.hero.articleId) ids.push(config.hero.articleId);
  for (const p of config.situationPrompts ?? []) {
    if (p.articleId) ids.push(p.articleId);
  }
  for (const list of [
    config.featured,
    config.decisionGuides,
    config.comparisons,
    config.toolsSystems,
    config.editorsPicks,
    config.latest?.articleIds,
  ]) {
    if (list) ids.push(...list);
  }
  return ids;
}

export type ParsedPostRef = {
  slug: string;
  draft: boolean;
  locale: Locale;
  category?: string;
  title: string;
};

function collectionEntriesFromParsed(
  parsed: ParsedPostRef[]
): CollectionEntry<'blog'>[] {
  return parsed.map((p) => ({
    slug: p.slug,
    id: p.slug,
    collection: 'blog' as const,
    data: {
      title: p.title,
      description: '',
      pubDate: new Date(),
      draft: p.draft,
      locale: p.locale === 'ja' ? 'ja' : undefined,
      category: p.category as CollectionEntry<'blog'>['data']['category'],
      ads: true,
    },
    body: '',
    render: async () => ({ Content: () => null, headings: [], remarkPluginFrontmatter: {} }),
  })) as CollectionEntry<'blog'>[];
}

/** Build-time validation from MD on disk (prebuild script). */
export function validateEditorialHomesFromParsed(parsed: ParsedPostRef[]): void {
  const entries = collectionEntriesFromParsed(parsed);
  validateEditorialHomes(entries);
}

export function validateEditorialHomes(posts: CollectionEntry<'blog'>[]): void {
  for (const locale of ['en', 'ja'] as Locale[]) {
    const config = loadEditorialHomeConfig(locale);
    const published = posts.filter((p) => !p.data.draft && getPostLocale(p.data) === locale);
    for (const id of collectEditorialArticleIds(config)) {
      resolveEditorialArticleId(id, locale, published, `editorial/${locale}-home.yml`);
    }
    buildEditorialHome(locale, posts, config);
  }
}
