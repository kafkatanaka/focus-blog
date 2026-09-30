import type { CollectionEntry } from 'astro:content';
import { CATEGORY_TITLES } from './categories';
import type { Locale } from './locale';

export type Crumb = { label: string; href?: string };

export function buildArticleBreadcrumbs(
  entry: CollectionEntry<'blog'>,
  locale: Locale
): Crumb[] {
  const home: Crumb =
    locale === 'ja'
      ? { label: 'ホーム', href: '/jp' }
      : { label: 'Home', href: '/' };

  const category = entry.data.category;
  const crumbs: Crumb[] = [home];

  if (category) {
    const label = CATEGORY_TITLES[category] ?? category;
    const href = locale === 'ja' ? `/jp/${category}` : `/${category}`;
    crumbs.push({ label, href });
  }

  crumbs.push({ label: entry.data.title });
  return crumbs;
}
