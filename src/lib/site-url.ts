/** Canonical URL rules for focus-dividend.com (trailing slash: never). */

import {
  getPostLocale,
  resolveArticlePath,
  type Locale,
} from './locale';

export const SITE_ORIGIN = 'https://focus-dividend.com';

const RESERVED_ENGLISH_SLUGS = new Set([
  'focus',
  'work',
  'money',
  'habits',
  'about',
  'articles',
  'framework',
]);

/**
 * Normalize a site path: leading slash, no trailing slash (except root).
 */
export function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  let p = path.trim();
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

/** @deprecated Use resolveArticlePath / canonicalUrlForArticle — English-only shortcut */
export function articlePath(slug: string): string {
  return normalizePath(`/${slug}`);
}

export function categoryPath(category: string, locale: Locale = 'en'): string {
  if (locale === 'ja') {
    return normalizePath(`/jp/${category}`);
  }
  return normalizePath(`/${category}`);
}

export function tagPath(tag: string): string {
  return normalizePath(`/tag/${encodeURIComponent(tag)}`);
}

export function pillarGuidePath(category: string, guideSlug: string): string {
  return normalizePath(`/${category}/${guideSlug}`);
}

/** Full canonical URL string (no trailing slash). */
export function canonicalUrl(path: string): string {
  return `${SITE_ORIGIN}${normalizePath(path)}`;
}

export function canonicalUrlForArticle(params: {
  slug: string;
  locale: Locale;
  category?: string | null;
}): string {
  return canonicalUrl(resolveArticlePath(params));
}

export function canonicalUrlFromSlug(slug: string): string {
  return canonicalUrlForArticle({ slug, locale: 'en' });
}

export function articlePathFromFrontmatter(
  slug: string,
  fm: { locale?: string; category?: string | null }
): string {
  return resolveArticlePath({
    slug,
    locale: getPostLocale(fm),
    category: fm.category,
  });
}

export function isReservedEnglishBlogSlug(slug: string): boolean {
  return RESERVED_ENGLISH_SLUGS.has(slug);
}

export { RESERVED_ENGLISH_SLUGS as RESERVED_SLUGS };
