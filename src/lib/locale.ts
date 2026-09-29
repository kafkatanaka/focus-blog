import type { CollectionEntry } from 'astro:content';

export type Locale = 'en' | 'ja';

export type LocaleMetadata = {
  alternate_locales?: { en?: string; ja?: string };
  english_url?: string;
  translation_of?: string;
};

/** URL prefix is the single source of truth for site locale. */
export function getLocaleFromPath(pathname: string): Locale {
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === '/jp' || path.startsWith('/jp/')) return 'ja';
  return 'en';
}

export function getPostLocale(data: { locale?: string }): Locale {
  return data.locale === 'ja' ? 'ja' : 'en';
}

export function isJapanesePost(data: { locale?: string }): boolean {
  return getPostLocale(data) === 'ja';
}

export function localeBasePath(locale: Locale): string {
  return locale === 'ja' ? '/jp' : '';
}

/** Route resolver SSOT — used by pages, inventory, sitemap, and canonical helpers. */
export function resolveArticlePath(params: {
  slug: string;
  locale: Locale;
  category?: string | null;
}): string {
  if (params.locale === 'ja') {
    if (!params.category) {
      return `/jp/__missing_category__/${params.slug}`;
    }
    return `/jp/${params.category}/${params.slug}`;
  }
  return `/${params.slug}`;
}

/** Locale + slug alias key (overrides / registry aliases). Not a stable article ID. */
export function makeArticleId(locale: Locale, slug: string): string {
  return `${locale}:${slug}`;
}

export function getArticlePath(
  entry: Pick<CollectionEntry<'blog'>, 'slug' | 'data'>
): string {
  return resolveArticlePath({
    slug: entry.slug,
    locale: getPostLocale(entry.data),
    category: entry.data.category,
  });
}

const CATEGORY_SLUGS = ['framework', 'focus', 'work', 'money', 'habits'] as const;

function stripTrailingSlash(path: string): string {
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}

/**
 * Resolve EN/JA switch targets. Uses frontmatter when present; otherwise maps
 * category and home paths; article pages without pairs fall back to locale home.
 */
export function getLocaleSwitchUrl(
  pathname: string,
  metadata?: LocaleMetadata
): { en: string; ja: string } {
  const path = stripTrailingSlash(pathname) || '/';

  if (metadata?.alternate_locales?.en && metadata?.alternate_locales?.ja) {
    return {
      en: metadata.alternate_locales.en,
      ja: metadata.alternate_locales.ja,
    };
  }

  if (metadata?.english_url && path.startsWith('/jp/')) {
    return { en: metadata.english_url, ja: path };
  }

  if (metadata?.translation_of && !path.startsWith('/jp/')) {
    return { en: path, ja: metadata.translation_of.startsWith('/') ? metadata.translation_of : `/jp${metadata.translation_of}` };
  }

  if (path === '/jp') {
    return { en: '/', ja: '/jp' };
  }
  if (path === '/') {
    return { en: '/', ja: '/jp' };
  }

  const jaCategory = path.match(/^\/jp\/(framework|focus|work|money|habits)$/);
  if (jaCategory) {
    const cat = jaCategory[1];
    const enPath = cat === 'framework' ? '/framework' : `/${cat}`;
    return { en: enPath, ja: path };
  }

  const enCategory = path.match(/^\/(framework|focus|work|money|habits)$/);
  if (enCategory) {
    const cat = enCategory[1];
    return { en: path, ja: `/jp/${cat}` };
  }

  const jaArticle = path.match(/^\/jp\/(focus|work|money|habits)\/([^/]+)$/);
  if (jaArticle) {
    return { en: '/', ja: path };
  }

  if (CATEGORY_SLUGS.every((c) => !path.startsWith(`/${c}/`)) && !path.startsWith('/jp/')) {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 1 && !CATEGORIES_RESERVED.includes(segments[0])) {
      return { en: path, ja: '/jp' };
    }
  }

  const locale = getLocaleFromPath(path);
  return {
    en: locale === 'ja' ? '/' : path,
    ja: locale === 'en' ? '/jp' : path,
  };
}

const CATEGORIES_RESERVED = ['focus', 'work', 'money', 'habits', 'about', 'articles', 'framework', 'jp', 'admin', 'tag', 'contact'];

export function formatPublishedDate(date: Date, locale: Locale): string {
  if (locale === 'ja') {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function buildHreflangAlternates(
  switchUrls: { en: string; ja: string },
  site: URL
): { en?: string; ja?: string } {
  return {
    en: new URL(switchUrls.en, site).href,
    ja: new URL(switchUrls.ja, site).href,
  };
}

export function localeMetadataFromPost(data: CollectionEntry<'blog'>['data']): LocaleMetadata {
  return {
    alternate_locales: data.alternate_locales,
    english_url: data.english_url,
    translation_of: data.translation_of,
  };
}
