/**
 * Generate public/sitemap.xml using inventory records + locale-aware routes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES } from '../src/lib/categories';
import { EN_NAV_CATEGORIES } from '../src/data/media-taxonomy';
import { loadContentIdsRegistry } from '../src/lib/content-ids';
import {
  buildInventoryRecord,
  loadContentOverrides,
  type InventoryRecord,
  type ParsedBlogFrontmatter,
} from '../src/lib/content-metadata';
import { canonicalUrl, categoryPath, pillarGuidePath, tagPath } from '../src/lib/site-url';
import { countWords, parseFrontmatter } from './lib/parse-frontmatter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SKIP_FILES = new Set(['article-master-template.md']);

const PILLAR_GUIDES: { category: string; slug: string }[] = [
  { category: 'focus', slug: 'attention-management-guide' },
  { category: 'work', slug: 'sustainable-productivity-guide' },
  { category: 'money', slug: 'intentional-money-guide' },
  { category: 'habits', slug: 'behavior-design-guide' },
];

const EN_STATIC_PATHS = [
  '/',
  '/framework',
  '/articles',
  '/affiliate-disclosure',
  '/privacy-policy',
  '/contact',
];

const JA_STATIC_PATHS = ['/jp', '/jp/framework'];

function loadAllRecords(): InventoryRecord[] {
  const overrides = loadContentOverrides(ROOT);
  const idRegistry = loadContentIdsRegistry(ROOT);
  const records: InventoryRecord[] = [];
  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!file.endsWith('.md') || SKIP_FILES.has(file)) continue;
    const slug = file.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { fm, body } = parseFrontmatter(content);
    records.push(
      buildInventoryRecord(
        slug,
        fm as ParsedBlogFrontmatter,
        countWords(body),
        overrides,
        idRegistry
      )
    );
  }
  return records;
}

function categoryHasIndexablePosts(
  records: InventoryRecord[],
  category: string,
  locale: 'en' | 'ja'
): boolean {
  return records.some(
    (r) =>
      r.inSitemap && r.locale === locale && r.category === category && !r.draft
  );
}

function main() {
  const records = loadAllRecords();
  const paths = new Set<string>(EN_STATIC_PATHS);
  for (const p of JA_STATIC_PATHS) paths.add(p);

  for (const cat of EN_NAV_CATEGORIES) {
    if (categoryHasIndexablePosts(records, cat, 'en')) {
      paths.add(categoryPath(cat, 'en'));
    }
  }

  for (const cat of CATEGORIES) {
    if (categoryHasIndexablePosts(records, cat, 'ja')) {
      paths.add(categoryPath(cat, 'ja'));
    }
  }

  if (categoryHasIndexablePosts(records, 'framework', 'ja')) {
    paths.add('/jp/framework');
  }

  for (const { category, slug } of PILLAR_GUIDES) {
    paths.add(pillarGuidePath(category, slug));
  }

  const enTagSet = new Set<string>();

  for (const record of records) {
    if (!record.inSitemap) continue;
    paths.add(record.url);
    if (record.locale === 'en') {
      for (const tag of record.tags) enTagSet.add(tag);
    }
  }

  for (const tag of enTagSet) {
    paths.add(tagPath(tag));
  }

  const sorted = [...paths].sort((a, b) => a.localeCompare(b));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sorted
  .map(
    (urlPath) => `  <url>
    <loc>${canonicalUrl(urlPath)}</loc>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml);

  const enArticleUrls = sorted.filter(
    (p) => p.startsWith('/') && !p.startsWith('/jp') && p.split('/').filter(Boolean).length === 1
  ).length;
  const jaArticleUrls = sorted.filter((p) => p.startsWith('/jp/') && p.split('/').filter(Boolean).length === 3).length;

  console.log(
    `✅ sitemap.xml generated (${sorted.length} URLs, ~${enArticleUrls} EN article paths, ~${jaArticleUrls} JA article paths)`
  );
}

main();
