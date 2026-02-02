import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('blog');
  const index = posts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
    .map((p) => ({
      slug: p.slug,
      title: p.data.title,
      description: p.data.description,
      tags: p.data.tags ?? [],
      category: p.data.category ?? null,
    }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
}
