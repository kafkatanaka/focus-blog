/**
 * Assign stable article IDs for new posts. Run via prebuild / npm run sync-content-ids
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncContentIdsRegistry } from '../src/lib/content-ids';
import { getPostLocale } from '../src/lib/locale';
import { parseFrontmatter } from './lib/parse-frontmatter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const SKIP_FILES = new Set(['article-master-template.md']);

function main() {
  const articles: { locale: 'en' | 'ja'; slug: string }[] = [];
  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!file.endsWith('.md') || SKIP_FILES.has(file)) continue;
    const slug = file.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { fm } = parseFrontmatter(content);
    articles.push({ locale: getPostLocale(fm), slug });
  }
  articles.sort((a, b) => a.locale.localeCompare(b.locale) || a.slug.localeCompare(b.slug));

  const result = syncContentIdsRegistry(ROOT, articles);
  console.log(
    `✅ content-ids.yml (${result.total} IDs${result.added ? `, +${result.added} new` : ''}) → ${result.path}`
  );
}

main();
