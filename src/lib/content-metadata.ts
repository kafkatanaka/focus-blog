import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import {
  type ArticleType,
  type ConsolidationStatus,
  isArticleType,
  isContentCategory,
  isClusterSlug,
} from '../data/media-taxonomy';
import { getStableArticleId, type ContentIdsRegistry } from './content-ids';
import { getPostLocale, makeArticleId, type Locale } from './locale';
import {
  articlePathFromFrontmatter,
  canonicalUrlForArticle,
  isReservedEnglishBlogSlug,
} from './site-url';

export type ReadingJourneyOverride = {
  label: string;
  ref: string;
};

export type ContentOverride = {
  articleType?: ArticleType;
  cluster?: string;
  hubId?: string;
  isHub?: boolean;
  keyTakeaway?: string;
  readingJourney?: ReadingJourneyOverride[];
  relatedArticleIds?: string[];
  indexable?: boolean;
  inSitemap?: boolean;
  consolidationStatus?: ConsolidationStatus;
  duplicateGroup?: string;
  locale?: Locale;
};

export type ParsedBlogFrontmatter = {
  title: string;
  description: string;
  pubDate?: string;
  updatedDate?: string;
  category?: string;
  tags: string[];
  draft: boolean;
  articleType?: string;
  cluster?: string;
  hubId?: string;
  isHub?: boolean;
  relatedArticleIds?: string[];
  indexable?: boolean;
  inSitemap?: boolean;
  consolidationStatus?: string;
  duplicateGroup?: string;
  locale?: string;
};

export type InventoryRecord = {
  articleId: string;
  url: string;
  slug: string;
  locale: Locale;
  title: string;
  description: string;
  category: string | null;
  tags: string[];
  publishedAt: string | null;
  updatedAt: string | null;
  wordCount: number;
  canonical: string;
  articleType: ArticleType | null;
  cluster: string | null;
  hubId: string | null;
  isHub: boolean;
  relatedArticleIds: string[];
  indexable: boolean;
  inSitemap: boolean;
  consolidationStatus: ConsolidationStatus;
  duplicateGroup: string | null;
  draft: boolean;
};

const DEFAULT_CONSOLIDATION: ConsolidationStatus = 'review';

let overridesCache: Record<string, ContentOverride> | null = null;

export function loadContentOverrides(rootDir: string): Record<string, ContentOverride> {
  if (overridesCache) return overridesCache;
  const filePath = path.join(rootDir, 'src', 'data', 'content-overrides.yml');
  if (!fs.existsSync(filePath)) {
    overridesCache = {};
    return overridesCache;
  }
  const raw = parseYaml(fs.readFileSync(filePath, 'utf8')) as Record<string, ContentOverride> | null;
  overridesCache = raw ?? {};
  return overridesCache;
}

export function resetOverridesCache(): void {
  overridesCache = null;
}

function overrideKeyCandidates(
  locale: Locale,
  slug: string,
  urlPath: string,
  stableArticleId?: string
): string[] {
  const keys = [makeArticleId(locale, slug), slug, urlPath, `/${slug}`];
  if (stableArticleId) keys.unshift(stableArticleId);
  return keys;
}

export function getOverrideForArticle(
  locale: Locale,
  slug: string,
  urlPath: string,
  overrides: Record<string, ContentOverride>,
  stableArticleId?: string
): ContentOverride | undefined {
  for (const key of overrideKeyCandidates(locale, slug, urlPath, stableArticleId)) {
    if (overrides[key]) return overrides[key];
  }
  return undefined;
}

/** @deprecated Use getOverrideForArticle */
export function getOverrideForSlug(
  slug: string,
  overrides: Record<string, ContentOverride>
): ContentOverride | undefined {
  return getOverrideForArticle('en', slug, `/${slug}`, overrides);
}

function pickString(
  fm: string | undefined,
  ov: string | undefined,
  inferred?: string | null
): string | null {
  if (fm) return fm;
  if (ov) return ov;
  return inferred ?? null;
}

function pickBool(fm: boolean | undefined, ov: boolean | undefined, inferred: boolean): boolean {
  if (fm !== undefined) return fm;
  if (ov !== undefined) return ov;
  return inferred;
}

function pickArticleType(fm?: string, ov?: string): ArticleType | null {
  const v = fm ?? ov;
  if (!v) return null;
  return isArticleType(v) ? v : null;
}

function pickConsolidation(fm?: string, ov?: string): ConsolidationStatus {
  const v = fm ?? ov;
  if (
    v &&
    [
      'keep',
      'refresh',
      'differentiate',
      'merge_candidate',
      'redirect_candidate',
      'noindex_candidate',
      'review',
    ].includes(v)
  ) {
    return v as ConsolidationStatus;
  }
  return DEFAULT_CONSOLIDATION;
}

function inferArticleTypeFromTitle(title: string): ArticleType | null {
  const t = title.toLowerCase();
  if (t.startsWith('how to ') || t.includes(' guide')) return 'guide';
  if (t.startsWith('should ') || t.includes('should you ')) return 'decide';
  if (t.includes(' vs ') || t.includes(' versus ') || t.startsWith('best ')) return 'compare';
  if (t.startsWith('what is ') || t.startsWith('why ')) return 'explain';
  return null;
}

export function buildInventoryRecord(
  slug: string,
  fm: ParsedBlogFrontmatter,
  wordCount: number,
  overrides: Record<string, ContentOverride>,
  idRegistry: ContentIdsRegistry
): InventoryRecord {
  const locale = getPostLocale(fm);
  const stableArticleId = getStableArticleId(locale, slug, idRegistry);
  if (!stableArticleId) {
    throw new Error(`Missing stable article ID for ${locale}:${slug} — run npm run sync-content-ids`);
  }
  const urlPath = articlePathFromFrontmatter(slug, fm);
  const ov =
    getOverrideForArticle(locale, slug, urlPath, overrides, stableArticleId) ?? {};
  const category =
    fm.category && isContentCategory(fm.category) ? fm.category : fm.category ?? null;
  const draft = fm.draft;
  const indexable = pickBool(fm.indexable, ov.indexable, !draft);
  const reservedEnglish =
    locale === 'en' && isReservedEnglishBlogSlug(slug);
  const jaMissingCategory = locale === 'ja' && !category;
  const inSitemap = pickBool(
    fm.inSitemap,
    ov.inSitemap,
    indexable && !draft && !reservedEnglish && !jaMissingCategory
  );
  const inferredType = inferArticleTypeFromTitle(fm.title);
  const articleType = pickArticleType(fm.articleType, ov.articleType) ?? inferredType;
  const clusterRaw = pickString(fm.cluster, ov.cluster);
  const cluster =
    clusterRaw && (isClusterSlug(clusterRaw) || clusterRaw.length > 0) ? clusterRaw : null;
  const hubId = pickString(fm.hubId, ov.hubId);
  const isHub = pickBool(fm.isHub, ov.isHub, false);
  const relatedArticleIds = fm.relatedArticleIds ?? ov.relatedArticleIds ?? [];
  const duplicateGroup = pickString(fm.duplicateGroup, ov.duplicateGroup);

  return {
    articleId: stableArticleId,
    url: urlPath,
    slug,
    locale,
    title: fm.title,
    description: fm.description,
    category,
    tags: fm.tags,
    publishedAt: fm.pubDate ?? null,
    updatedAt: fm.updatedDate ?? null,
    wordCount,
    canonical: canonicalUrlForArticle({ slug, locale, category }),
    articleType,
    cluster,
    hubId,
    isHub,
    relatedArticleIds,
    indexable,
    inSitemap,
    consolidationStatus: pickConsolidation(fm.consolidationStatus, ov.consolidationStatus),
    duplicateGroup,
    draft,
  };
}
