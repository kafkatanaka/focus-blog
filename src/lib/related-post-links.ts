import type { CollectionEntry } from 'astro:content';
import { getArticlePath } from './locale';

export function relatedPostHref(
  slug: string,
  postEntries?: Pick<CollectionEntry<'blog'>, 'slug' | 'data'>[]
): string {
  const entry = postEntries?.find((e) => e.slug === slug);
  if (entry) return getArticlePath(entry);
  return `/${slug}`;
}
