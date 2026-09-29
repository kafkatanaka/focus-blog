import type { CollectionEntry } from 'astro:content';
import { isJapanesePost, type Locale } from './locale';

export function filterPostsByLocale(
  posts: CollectionEntry<'blog'>[],
  locale: Locale
): CollectionEntry<'blog'>[] {
  if (locale === 'ja') {
    return posts.filter((p) => isJapanesePost(p.data));
  }
  return posts.filter((p) => !isJapanesePost(p.data));
}

export function sortPostsByDate(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  return [...posts].sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export function thumbnailPathFor(entry: CollectionEntry<'blog'>): string {
  return entry.data.thumbnail
    ? `/images/thumbnails/${entry.data.thumbnail}`
    : `/images/thumbnails/${entry.slug}.webp`;
}
