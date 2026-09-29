import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");

const SITE = "https://focus-dividend.com";

const BLOG_DIR = path.join(ROOT, "src", "content", "blog");
const PUBLIC_DIR = path.join(ROOT, "public");

const CATEGORIES = ["focus", "work", "money", "habits"];
const JP_CATEGORIES = ["framework", ...CATEGORIES];
const NAV_CATEGORIES = JP_CATEGORIES;

function parseTags(content) {
  const tags = [];
  const tagsMatch = content.match(/^tags:\s*\n([\s\S]*?)(?=\n\w|\n---|\n$)/m);
  if (tagsMatch) {
    for (const line of tagsMatch[1].split("\n")) {
      const m = line.match(/^\s*-\s*["']?([^"'\n]+)["']?/);
      if (m) tags.push(m[1].trim());
    }
  }
  return tags;
}

function parseFrontmatterField(content, field) {
  const re = new RegExp(`^${field}:\\s*(.+)$`, "m");
  const m = content.match(re);
  if (!m) return null;
  return m[1].trim().replace(/^["']|["']$/g, "");
}

function isJapaneseArticle(content) {
  return parseFrontmatterField(content, "locale") === "ja";
}

function parseCategory(content) {
  return parseFrontmatterField(content, "category");
}

const urls = ["/", "/framework", "/articles", "/affiliate-disclosure", "/privacy-policy", "/contact"];

urls.push("/jp");
for (const cat of NAV_CATEGORIES) {
  urls.push(`/jp/${cat}`);
}

for (const cat of CATEGORIES) {
  urls.push(`/${cat}`);
}

urls.push("/focus/attention-management-guide");
urls.push("/work/sustainable-productivity-guide");
urls.push("/money/intentional-money-guide");
urls.push("/habits/behavior-design-guide");

const tagSet = new Set();
const reservedSlugs = ["focus", "work", "money", "habits", "about", "articles", "framework"];
if (fs.existsSync(BLOG_DIR)) {
  const files = fs.readdirSync(BLOG_DIR);
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const fullPath = path.join(BLOG_DIR, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    if (content.includes("draft: true")) continue;
    const slug = file.replace(/\.md$/, "");
    const ja = isJapaneseArticle(content);
    const category = parseCategory(content);

    if (ja && category && JP_CATEGORIES.includes(category)) {
      urls.push(`/jp/${category}/${slug}`);
    } else if (!ja && !reservedSlugs.includes(slug)) {
      urls.push(`/${slug}`);
    }

    if (!ja) {
      for (const tag of parseTags(content)) tagSet.add(tag);
    }
  }
} else {
  console.warn("⚠️ BLOG_DIR not found:", BLOG_DIR);
}

for (const tag of tagSet) {
  urls.push(`/tag/${encodeURIComponent(tag)}`);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (urlPath) => `  <url>
    <loc>${SITE}${urlPath}</loc>
  </url>`
  )
  .join("\n")}
</urlset>
`;

fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), xml);

console.log(`✅ sitemap.xml generated (${urls.length} URLs)`);
