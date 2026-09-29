/**
 * Generate public/sitemap.xml using the same canonical rules as site-url.ts + inventory flags.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLOG_CATEGORIES } from '../src/data/media-taxonomy';
import {
  buildInventoryRecord,
  loadContentOverrides,
  type ParsedBlogFrontmatter,
} from '../src/lib/content-metadata';
import {
  canonicalUrl,
  categoryPath,
  pillarGuidePath,
  tagPath,
} from '../src/lib/site-url';
import { countWords, parseFrontmatter } from './lib/parse-frontmatter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const PUBLIC_DIR = path.join(ROOT, 'public');

const PILLAR_GUIDES: { category: string; slug: string }[] = [
  { category: 'focus', slug: 'attention-management-guide' },
  { category: 'work', slug: 'sustainable-productivity-guide' },
  { category: 'money', slug: 'intentional-money-guide' },
  { category: 'habits', slug: 'behavior-design-guide' },
];

const STATIC_PATHS = [
  '/',
  '/framework',
  '/articles',
  '/affiliate-disclosure',
  '/privacy-policy',
  '/contact',
];

function loadPublishedByCategory(): Map<string, number> {
  const overrides = loadContentOverrides(ROOT);
  const counts = new Map<string, number>();
  for (const cat of BLOG_CATEGORIES) counts.set(cat, 0);

  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!file.endsWith('.md')) continue;
    const slug = file.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { fm, body } = parseFrontmatter(content);
    const record = buildInventoryRecord(
      slug,
      fm as ParsedBlogFrontmatter,
      countWords(body),
      overrides
    );
    if (!record.inSitemap) continue;
    if (record.category && counts.has(record.category)) {
      counts.set(record.category, (counts.get(record.category) ?? 0) + 1);
    }
  }
  return counts;
}

function main() {
  const overrides = loadContentOverrides(ROOT);
  const paths = new Set<string>(STATIC_PATHS);

  const categoryCounts = loadPublishedByCategory();
  for (const cat of BLOG_CATEGORIES) {
    if ((categoryCounts.get(cat) ?? 0) > 0) {
      paths.add(categoryPath(cat));
    }
  }

  for (const { category, slug } of PILLAR_GUIDES) {
    paths.add(pillarGuidePath(category, slug));
  }

  const tagSet = new Set<string>();

  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!file.endsWith('.md')) continue;
    const slug = file.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { fm, body } = parseFrontmatter(content);
    const record = buildInventoryRecord(
      slug,
      fm as ParsedBlogFrontmatter,
      countWords(body),
      overrides
    );
    if (record.inSitemap) {
      paths.add(record.url);
      for (const tag of record.tags) tagSet.add(tag);
    }
  }

  for (const tag of tagSet) {
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
  console.log(`✅ sitemap.xml generated (${sorted.length} URLs)`);
}

main();
