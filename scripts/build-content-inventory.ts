/**
 * Build full content inventory (JSON + CSV). Does not modify source MD files.
 * Run: npm run build-inventory
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildInventoryRecord,
  loadContentOverrides,
  type InventoryRecord,
  type ParsedBlogFrontmatter,
} from '../src/lib/content-metadata';
import { countWords, parseFrontmatter } from './lib/parse-frontmatter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const OUT_DIR = path.join(ROOT, 'generated');

const SKIP_FILES = new Set(['article-master-template.md']);

function toCsvValue(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function main() {
  const overrides = loadContentOverrides(ROOT);
  const records: InventoryRecord[] = [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md') && !SKIP_FILES.has(f));

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { fm, body } = parseFrontmatter(content);
    const wordCount = countWords(body);
    records.push(
      buildInventoryRecord(slug, fm as ParsedBlogFrontmatter, wordCount, overrides)
    );
  }

  records.sort((a, b) => a.slug.localeCompare(b.slug));

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const jsonPath = path.join(OUT_DIR, 'content-inventory.json');
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        site: 'https://focus-dividend.com',
        totalArticles: records.length,
        published: records.filter((r) => !r.draft).length,
        articles: records,
      },
      null,
      2
    )
  );

  const columns: (keyof InventoryRecord | 'tagsJoined' | 'relatedJoined')[] = [
    'articleId',
    'url',
    'slug',
    'locale',
    'title',
    'description',
    'category',
    'tagsJoined',
    'publishedAt',
    'updatedAt',
    'wordCount',
    'canonical',
    'articleType',
    'cluster',
    'hubId',
    'isHub',
    'relatedJoined',
    'indexable',
    'inSitemap',
    'consolidationStatus',
    'duplicateGroup',
    'draft',
  ];

  const csvRows = [
    columns.join(','),
    ...records.map((r) => {
      const row = {
        ...r,
        tagsJoined: r.tags.join('|'),
        relatedJoined: r.relatedArticleIds.join('|'),
      };
      return columns.map((c) => toCsvValue(row[c as keyof typeof row])).join(',');
    }),
  ];

  fs.writeFileSync(path.join(OUT_DIR, 'content-inventory.csv'), csvRows.join('\n'));

  const tagMap = new Map<string, { tag: string; articleCount: number; indexableCount: number }>();
  for (const r of records) {
    for (const tag of r.tags) {
      const cur = tagMap.get(tag) ?? { tag, articleCount: 0, indexableCount: 0 };
      cur.articleCount += 1;
      if (!r.draft && r.indexable) cur.indexableCount += 1;
      tagMap.set(tag, cur);
    }
  }
  const tagInventory = [...tagMap.values()].sort((a, b) => b.articleCount - a.articleCount);
  fs.writeFileSync(
    path.join(OUT_DIR, 'tag-inventory.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        tagCount: tagInventory.length,
        tags: tagInventory.map((t) => ({
          tag: t.tag,
          articleCount: t.articleCount,
          indexableCount: t.indexableCount,
          tagUrl: `/tag/${encodeURIComponent(t.tag)}`,
          hasUniqueIntro: false,
        })),
      },
      null,
      2
    )
  );

  console.log(`✅ content-inventory written (${records.length} articles) → ${jsonPath}`);
}

main();
