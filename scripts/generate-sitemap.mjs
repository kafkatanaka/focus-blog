import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトルートを scripts/ から確定（CI / ローカル同一）
const ROOT = path.resolve(__dirname, "..");

const SITE = "https://focus.matomeyo.me";

const BLOG_DIR = path.join(ROOT, "src", "content", "blog");
const PUBLIC_DIR = path.join(ROOT, "public");

const CATEGORIES = ["focus", "work", "money", "habits"];

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

// 固定ページ（trailingSlash: 'never' に合わせる）
const urls = ["/", "/about"];

for (const cat of CATEGORIES) {
  urls.push(`/${cat}`);
}

// ブログ記事 + タグ収集
const tagSet = new Set();
if (fs.existsSync(BLOG_DIR)) {
  const files = fs.readdirSync(BLOG_DIR);
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const fullPath = path.join(BLOG_DIR, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    if (content.includes("draft: true")) continue;
    const slug = file.replace(/\.md$/, "");
    urls.push(`/blog/${slug}`);
    for (const tag of parseTags(content)) tagSet.add(tag);
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
