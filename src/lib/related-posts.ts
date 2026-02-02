import type { CollectionEntry } from 'astro:content';

export const RELATED_POSTS_LIMIT = 5;

export type RelatedPostItem = { slug: string; title: string; thumbnailPath: string };

/**
 * 関連記事を取得する。
 * 1. relatedMap に slug があればその順で返す（存在・非draftのみ）
 * 2. なければ同じ tag を持つ記事を共有数・日付でソートして返す
 */
export function getRelatedPosts(
  currentSlug: string,
  currentTags: string[],
  allPosts: CollectionEntry<'blog'>[],
  relatedMap: Record<string, string[]>
): RelatedPostItem[] {
  const limit = RELATED_POSTS_LIMIT;
  const manualSlugs = relatedMap[currentSlug];

  const toItem = (entry: CollectionEntry<'blog'>): RelatedPostItem => ({
    slug: entry.slug,
    title: entry.data.title,
    thumbnailPath: entry.data.thumbnail
      ? `/images/thumbnails/${entry.data.thumbnail}`
      : `/images/thumbnails/${entry.slug}.webp`,
  });

  if (manualSlugs?.length > 0) {
    const slugSet = new Set(allPosts.map((p) => p.slug));
    const result: RelatedPostItem[] = [];
    for (const slug of manualSlugs) {
      if (slug === currentSlug) continue;
      if (!slugSet.has(slug)) continue;
      const entry = allPosts.find((p) => p.slug === slug);
      if (entry && !entry.data.draft) {
        result.push(toItem(entry));
      }
      if (result.length >= limit) break;
    }
    return result;
  }

  const others = allPosts.filter((p) => p.slug !== currentSlug);
  const tags = currentTags ?? [];

  if (tags.length === 0) {
    return others
      .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
      .slice(0, limit)
      .map(toItem);
  }

  const withScore = others
    .map((p) => {
      const shared = (p.data.tags ?? []).filter((t) => tags.includes(t)).length;
      return { entry: p, shared };
    })
    .filter((x) => x.shared > 0);

  withScore.sort(
    (a, b) =>
      b.shared - a.shared ||
      b.entry.data.pubDate.getTime() - a.entry.data.pubDate.getTime()
  );

  return withScore.slice(0, limit).map((x) => toItem(x.entry));
}
