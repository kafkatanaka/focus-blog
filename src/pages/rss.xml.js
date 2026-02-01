import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('blog'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
  return rss({
    title: 'The Focus Dividend',
    description: 'Readings on focus, attention, and intentional living.',
    site: context.site ?? 'https://focus.matomeyo.me',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.slug}`,
    })),
    customData: '<language>en-us</language>',
  });
}
