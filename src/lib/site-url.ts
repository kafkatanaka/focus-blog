/** Canonical URL rules for focus-dividend.com (trailing slash: never). */

export const SITE_ORIGIN = 'https://focus-dividend.com';

const RESERVED_SLUGS = new Set([
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

/** Article URL path from blog slug (root-level `/{slug}`). */
export function articlePath(slug: string): string {
  return normalizePath(`/${slug}`);
}

export function categoryPath(category: string): string {
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

export function canonicalUrlFromSlug(slug: string): string {
  return canonicalUrl(articlePath(slug));
}

export function isReservedBlogSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export { RESERVED_SLUGS };
