import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CollectionEntry } from 'astro:content';
import {
  getStableArticleId,
  loadContentIdsRegistry,
  resolveStableOrSlugRef,
  type ContentIdsRegistry,
} from './content-ids';
import {
  getOverrideForArticle,
  loadContentOverrides,
  type ContentOverride,
} from './content-metadata';
import type { ArticleType } from '../data/media-taxonomy';
import { isArticleType } from '../data/media-taxonomy';
import { getArticlePath, getPostLocale, type Locale } from './locale';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export type ReadingJourneyStep = {
  label: string;
  ref: string;
};

export type ResolvedJourneyLink = {
  label: string;
  href: string;
  title: string;
};

export type ArticlePresentation = {
  stableArticleId: string;
  articleType: ArticleType | null;
  cluster: string | null;
  hubId: string | null;
  isHub: boolean;
  keyTakeaway: string | null;
  readingJourney: ReadingJourneyStep[];
  hubLink: ResolvedJourneyLink | null;
};

function inferArticleTypeFromTitle(title: string): ArticleType | null {
  const t = title.toLowerCase();
  if (t.startsWith('how to ') || t.includes(' guide')) return 'guide';
  if (t.startsWith('should ') || t.includes('should you ')) return 'decide';
  if (t.includes(' vs ') || t.includes(' versus ') || t.startsWith('best ')) return 'compare';
  if (t.startsWith('what is ') || t.startsWith('why ')) return 'explain';
  return null;
}

function mergeOverride(
  entry: CollectionEntry<'blog'>,
  registry: ContentIdsRegistry,
  overrides: Record<string, ContentOverride>
): ContentOverride {
  const locale = getPostLocale(entry.data);
  const href = getArticlePath(entry);
  const stableId = getStableArticleId(locale, entry.slug, registry);
  const ov = stableId
    ? getOverrideForArticle(locale, entry.slug, href, overrides, stableId)
    : getOverrideForArticle(locale, entry.slug, href, overrides);
  return ov ?? {};
}

export function getArticlePresentation(
  entry: CollectionEntry<'blog'>,
  allEntries?: CollectionEntry<'blog'>[],
  registry = loadContentIdsRegistry(ROOT),
  overrides = loadContentOverrides(ROOT)
): ArticlePresentation {
  const locale = getPostLocale(entry.data);
  const stableArticleId =
    getStableArticleId(locale, entry.slug, registry) ?? `${locale}:${entry.slug}`;
  const ov = mergeOverride(entry, registry, overrides);

  const articleType =
    (entry.data.articleType && isArticleType(entry.data.articleType)
      ? entry.data.articleType
      : null) ??
    (ov.articleType ?? null) ??
    inferArticleTypeFromTitle(entry.data.title);

  const keyTakeaway =
    (entry.data as { keyTakeaway?: string }).keyTakeaway ?? ov.keyTakeaway ?? null;

  const journeyRaw =
    (entry.data as { readingJourney?: ReadingJourneyStep[] }).readingJourney ??
    ov.readingJourney ??
    [];

  const hubRef = entry.data.hubId ?? ov.hubId;
  const hubLink = hubRef
    ? resolveHubLink(hubRef, locale, registry, allEntries)
    : null;

  return {
    stableArticleId,
    articleType,
    cluster: entry.data.cluster ?? ov.cluster ?? null,
    hubId: hubRef ?? null,
    isHub: entry.data.isHub ?? ov.isHub ?? false,
    keyTakeaway,
    readingJourney: journeyRaw,
    hubLink,
  };
}

function resolveHubLink(
  hubRef: string,
  locale: Locale,
  registry: ContentIdsRegistry,
  allEntries?: CollectionEntry<'blog'>[]
): ResolvedJourneyLink | null {
  const resolved = resolveStableOrSlugRef(hubRef, locale, registry);
  if (!resolved) return null;
  const entry = allEntries?.find(
    (e) => e.slug === resolved.slug && getPostLocale(e.data) === locale
  );
  const title = entry?.data.title ?? resolved.slug;
  const href = entry
    ? getArticlePath(entry)
    : locale === 'ja'
      ? `/jp/work/${resolved.slug}`
      : `/${resolved.slug}`;
  return { label: title, href, title };
}

export function resolveReadingJourney(
  steps: ReadingJourneyStep[],
  locale: Locale,
  allEntries: CollectionEntry<'blog'>[]
): ResolvedJourneyLink[] {
  const registry = loadContentIdsRegistry(ROOT);
  const out: ResolvedJourneyLink[] = [];
  for (const step of steps) {
    const resolved = resolveStableOrSlugRef(step.ref, locale, registry);
    if (!resolved) continue;
    const entry = allEntries.find(
      (e) => e.slug === resolved.slug && getPostLocale(e.data) === locale
    );
    if (!entry || entry.data.draft) continue;
    out.push({
      label: step.label,
      href: getArticlePath(entry),
      title: entry.data.title,
    });
  }
  return out;
}

export function articleTypeLabel(type: ArticleType | null, locale: Locale): string | null {
  if (!type) return null;
  if (locale === 'ja') {
    const ja: Record<ArticleType, string> = {
      guide: 'ガイド',
      decide: '判断',
      compare: '比較',
      explain: '解説',
      review: 'レビュー',
      tool: 'ツール',
      essay: 'エッセイ',
    };
    return ja[type];
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
}
