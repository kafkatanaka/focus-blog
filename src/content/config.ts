import { defineCollection, z } from 'astro:content';
import { ARTICLE_TYPES, CONSOLIDATION_STATUSES } from '../data/media-taxonomy';

const categoryEnum = z.enum(['focus', 'work', 'money', 'habits']);
const articleTypeEnum = z.enum(ARTICLE_TYPES);
const consolidationEnum = z.enum(CONSOLIDATION_STATUSES);

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: categoryEnum.optional(),
    tags: z.array(z.string()).optional(),
    /** Editorial metadata (optional on legacy posts; overrides in src/data/content-overrides.yml) */
    articleType: articleTypeEnum.optional(),
    cluster: z.string().optional(),
    hubId: z.string().optional(),
    isHub: z.boolean().optional(),
    relatedArticleIds: z.array(z.string()).optional(),
    indexable: z.boolean().optional(),
    inSitemap: z.boolean().optional(),
    consolidationStatus: consolidationEnum.optional(),
    duplicateGroup: z.string().optional(),
    locale: z.enum(['en', 'jp']).optional(),
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
