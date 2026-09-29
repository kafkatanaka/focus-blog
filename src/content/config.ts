import { defineCollection, z } from 'astro:content';

const categoryEnum = z.enum(['framework', 'focus', 'work', 'money', 'habits']);

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: categoryEnum.optional(),
    tags: z.array(z.string()).optional(),
    ads: z.boolean().default(true),
    draft: z.boolean().default(false),
    /** サムネイル画像ファイル名（例: "my-post.webp"）。省略時は /images/thumbnails/{slug}.webp を使用 */
    thumbnail: z.string().optional(),
    /** COBW handoff articles */
    source_type: z.literal('cobw').optional(),
    cobw_job_id: z.string().optional(),
    youtube_url: z.string().nullable().optional(),
    youtube_video_id: z.string().nullable().optional(),
    source_title: z.string().optional(),
    seo_title: z.string().optional(),
    /** ja = Japanese edition; omitted = English (legacy posts unchanged) */
    locale: z.literal('ja').optional(),
    translation_of: z.string().optional(),
    english_url: z.string().optional(),
    alternate_locales: z
      .object({
        en: z.string().optional(),
        ja: z.string().optional(),
      })
      .optional(),
  }),
});

/** ピラー元 MD（スクリプト用）。ビルドでは使わないが、Astro の auto-collection 警告を消すため定義 */
const pillarSourcesCollection = defineCollection({
  type: 'content',
  schema: z.object({}).catchall(z.unknown()),
});

export const collections = {
  blog: blogCollection,
  'pillar-sources': pillarSourcesCollection,
};
