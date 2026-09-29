import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type { Locale } from './locale';
import { makeArticleId } from './locale';

export type ContentIdEntry = {
  locale: Locale;
  slug: string;
};

export type ContentIdsRegistry = {
  version: 1;
  /** Stable ID → current slug + locale (slug may change; ID does not). */
  articles: Record<string, ContentIdEntry>;
  /** `locale:slug` → stable ID for lookup and overrides. */
  aliases: Record<string, string>;
};

const STABLE_ID_PATTERN = /^fd-(en|ja)-\d{6}$/;

export function isStableArticleId(value: string): boolean {
  return STABLE_ID_PATTERN.test(value);
}

export function localeSlugAlias(locale: Locale, slug: string): string {
  return makeArticleId(locale, slug);
}

let registryCache: ContentIdsRegistry | null = null;

export function loadContentIdsRegistry(rootDir: string): ContentIdsRegistry {
  if (registryCache) return registryCache;
  const filePath = path.join(rootDir, 'src', 'data', 'content-ids.yml');
  if (!fs.existsSync(filePath)) {
    registryCache = { version: 1, articles: {}, aliases: {} };
    return registryCache;
  }
  const raw = parseYaml(fs.readFileSync(filePath, 'utf8')) as ContentIdsRegistry;
  registryCache = {
    version: 1,
    articles: raw.articles ?? {},
    aliases: raw.aliases ?? {},
  };
  return registryCache;
}

export function resetContentIdsCache(): void {
  registryCache = null;
}

export function getStableArticleId(
  locale: Locale,
  slug: string,
  registry: ContentIdsRegistry
): string | undefined {
  const alias = registry.aliases[localeSlugAlias(locale, slug)];
  if (alias) return alias;
  for (const [id, entry] of Object.entries(registry.articles)) {
    if (entry.locale === locale && entry.slug === slug) return id;
  }
  return undefined;
}

export function getEntryForStableId(
  stableId: string,
  registry: ContentIdsRegistry
): ContentIdEntry | undefined {
  return registry.articles[stableId];
}

/** Resolve hub / related / override reference: stable ID first, then slug in same locale. */
export function resolveStableOrSlugRef(
  ref: string,
  locale: Locale,
  registry: ContentIdsRegistry
): { stableId: string | null; slug: string; locale: Locale } | undefined {
  if (isStableArticleId(ref)) {
    const entry = registry.articles[ref];
    if (!entry) return undefined;
    return { stableId: ref, slug: entry.slug, locale: entry.locale };
  }
  const byAlias = registry.aliases[localeSlugAlias(locale, ref)];
  if (byAlias) {
    const entry = registry.articles[byAlias];
    if (entry) return { stableId: byAlias, slug: entry.slug, locale: entry.locale };
  }
  const bySlug = getStableArticleId(locale, ref, registry);
  if (bySlug) {
    const entry = registry.articles[bySlug];
    if (entry) return { stableId: bySlug, slug: entry.slug, locale: entry.locale };
  }
  return { stableId: null, slug: ref, locale };
}

function nextStableId(locale: Locale, registry: ContentIdsRegistry): string {
  const prefix = locale === 'ja' ? 'fd-ja-' : 'fd-en-';
  let max = 0;
  for (const id of Object.keys(registry.articles)) {
    if (!id.startsWith(prefix)) continue;
    const n = parseInt(id.slice(prefix.length), 10);
    if (!Number.isNaN(n)) max = Math.max(max, n);
  }
  return `${prefix}${String(max + 1).padStart(6, '0')}`;
}

export type SyncContentIdsResult = {
  added: number;
  total: number;
  path: string;
};

/**
 * Ensure every blog MD (except template) has a stable ID. Updates content-ids.yml when new posts appear.
 */
export function syncContentIdsRegistry(
  rootDir: string,
  articles: { locale: Locale; slug: string }[]
): SyncContentIdsResult {
  const filePath = path.join(rootDir, 'src', 'data', 'content-ids.yml');
  const registry = loadContentIdsRegistry(rootDir);
  resetContentIdsCache();
  let added = 0;

  for (const { locale, slug } of articles) {
    const existing = getStableArticleId(locale, slug, registry);
    if (existing) {
      const entry = registry.articles[existing];
      if (entry && entry.slug !== slug) {
        entry.slug = slug;
      }
      registry.aliases[localeSlugAlias(locale, slug)] = existing;
      continue;
    }

    const stableId = nextStableId(locale, registry);
    registry.articles[stableId] = { locale, slug };
    registry.aliases[localeSlugAlias(locale, slug)] = stableId;
    added += 1;
  }

  const doc = {
    version: 1,
    articles: registry.articles,
    aliases: registry.aliases,
  };

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    `# Stable article IDs (slug-independent). Do not renumber.\n# Lookup: aliases[\"locale:slug\"] or articles[fd-en-000001].slug\n${stringifyYaml(doc)}`
  );
  resetContentIdsCache();

  return { added, total: Object.keys(registry.articles).length, path: filePath };
}
