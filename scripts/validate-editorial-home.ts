/**
 * Validate editorial home YAML references at build time (filesystem + content-ids).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPostLocale } from '../src/lib/locale';
import {
  loadEditorialHomeConfig,
  validateEditorialHomesFromParsed,
} from '../src/lib/editorial-home';
import { parseFrontmatter } from './lib/parse-frontmatter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const SKIP_FILES = new Set(['article-master-template.md']);

function loadParsedPosts() {
  const posts: {
    slug: string;
    draft: boolean;
    locale: 'en' | 'ja';
    category?: string;
    title: string;
  }[] = [];
  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!file.endsWith('.md') || SKIP_FILES.has(file)) continue;
    const slug = file.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { fm } = parseFrontmatter(content);
    posts.push({
      slug,
      draft: Boolean(fm.draft),
      locale: getPostLocale(fm),
      category: fm.category,
      title: fm.title ?? '',
    });
  }
  return posts;
}

function main() {
  const posts = loadParsedPosts();
  validateEditorialHomesFromParsed(posts);
  for (const locale of ['en', 'ja'] as const) {
    loadEditorialHomeConfig(locale);
  }
  console.log('✅ editorial home config validated (en + ja)');
}

main();
