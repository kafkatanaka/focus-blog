/**
 * Export all blog article titles (and slug) to JSON.
 * Output: public/article-titles.json (downloadable from the site)
 * Run: node scripts/export-article-titles.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "src", "content", "blog");
// プロジェクト直下に保存（ダウンロード不要で開ける）
const OUT_PATH = path.join(ROOT, "article-titles.json");

function getFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const block = match[1];
  const out = {};
  const titleMatch = block.match(/^title:\s*(?:"([^"]*)"|'([^']*)'|(.+?))\s*$/m);
  if (titleMatch) out.title = (titleMatch[1] ?? titleMatch[2] ?? titleMatch[3] ?? "").trim();
  const descMatch = block.match(/^description:\s*(?:"([^"]*)"|'([^']*)'|(.+?))\s*$/m);
  if (descMatch) out.description = (descMatch[1] ?? descMatch[2] ?? descMatch[3] ?? "").trim();
  const catMatch = block.match(/^category:\s*(\S+)\s*$/m);
  if (catMatch) out.category = catMatch[1];
  const pubMatch = block.match(/^pubDate:\s*(.+?)\s*$/m);
  if (pubMatch) out.pubDate = pubMatch[1].trim();
  return out;
}

const reservedSlugs = ["focus", "work", "money", "habits", "about", "articles", "framework"];
const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
const list = [];

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  if (reservedSlugs.includes(slug)) continue;
  const content = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
  if (content.includes("draft: true")) continue;
  const fm = getFrontmatter(content);
  list.push({
    slug,
    title: fm.title ?? slug,
    ...(fm.description && { description: fm.description }),
    ...(fm.category && { category: fm.category }),
    ...(fm.pubDate && { pubDate: fm.pubDate }),
  });
}

list.sort((a, b) => (a.title ?? a.slug).localeCompare(b.title ?? b.slug));

fs.writeFileSync(OUT_PATH, JSON.stringify(list, null, 2), "utf-8");
console.log(`Wrote ${list.length} articles to ${path.relative(ROOT, OUT_PATH)}`);
