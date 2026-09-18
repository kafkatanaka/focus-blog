/**
 * Analyze existing blog articles for frontmatter, headings, and word counts.
 * Run: node scripts/analyze-articles.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');
const OUT_PATH = path.join(__dirname, '..', 'data', 'article-analysis.json');

function parseFrontmatter(content) {
  const m = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!m) return { fm: {}, body: content };
  const block = m[1];
  const body = m[2];
  const fm = {};
  const titleM = block.match(/^title:\s*(?:"([^"]*)"|'([^']*)'|(.+?))\s*$/m);
  if (titleM) fm.title = (titleM[1] ?? titleM[2] ?? titleM[3] ?? '').trim();
  const descM = block.match(/^description:\s*(?:"([^"]*)"|'([^']*)'|(.+?))\s*$/m);
  if (descM) fm.description = (descM[1] ?? descM[2] ?? descM[3] ?? '').trim();
  const catM = block.match(/^category:\s*(\S+)\s*$/m);
  if (catM) fm.category = catM[1];
  fm.draft = /draft:\s*true/.test(block);
  fm.ads = !/ads:\s*false/.test(block);
  fm.hasThumbnail = /thumbnail:/.test(block);
  const tagsM = block.match(/^tags:\s*\n((?:\s+-\s*.+\n?)+)/m);
  const tags = tagsM
    ? tagsM[1]
        .split('\n')
        .map((l) => l.replace(/^\s*-\s*/, '').trim())
        .filter(Boolean)
    : [];
  fm.tags = tags;
  return { fm, body };
}

function countWords(text) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_`[\]()>-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * p / 100)] ?? 0;
}

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

const files = fs
  .readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith('.md') && f !== 'article-master-template.md');

const articles = [];
for (const file of files) {
  const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
  const { fm, body } = parseFrontmatter(content);
  const h2 = [...body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
  const h3 = [...body.matchAll(/^###\s+(.+)$/gm)].map((m) => m[1].trim());
  const paragraphs = body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith('<!--') && !p.startsWith('---'));

  articles.push({
    slug: file.replace(/\.md$/, ''),
    title: fm.title ?? '',
    titleLen: (fm.title ?? '').length,
    description: fm.description ?? '',
    descLen: (fm.description ?? '').length,
    category: fm.category ?? 'none',
    tags: fm.tags ?? [],
    tagCount: (fm.tags ?? []).length,
    draft: fm.draft,
    ads: fm.ads,
    hasThumbnail: fm.hasThumbnail,
    words: countWords(body),
    h2,
    h2Count: h2.length,
    h3Count: h3.length,
    paragraphCount: paragraphs.length,
    hasAffiliateDisclosure: body.includes('affiliate-disclosure'),
    hasHookBeforeFirstH2: !body.trim().startsWith('##'),
  });
}

const published = articles.filter((a) => !a.draft);
const num = (key) => published.map((a) => a[key]);

const h2freq = {};
const tagfreq = {};
for (const a of published) {
  for (const h of a.h2) {
    const key = h.toLowerCase();
    h2freq[key] = (h2freq[key] || 0) + 1;
  }
  for (const t of a.tags) {
    tagfreq[t] = (tagfreq[t] || 0) + 1;
  }
}

const categoryCounts = {};
for (const a of published) {
  categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
}

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    all: articles.length,
    published: published.length,
    drafts: articles.length - published.length,
  },
  titleLength: {
    min: Math.min(...num('titleLen')),
    max: Math.max(...num('titleLen')),
    avg: Math.round(avg(num('titleLen')) * 10) / 10,
    p25: percentile(num('titleLen'), 25),
    p50: percentile(num('titleLen'), 50),
    p75: percentile(num('titleLen'), 75),
  },
  descriptionLength: {
    min: Math.min(...num('descLen')),
    max: Math.max(...num('descLen')),
    avg: Math.round(avg(num('descLen')) * 10) / 10,
    p25: percentile(num('descLen'), 25),
    p50: percentile(num('descLen'), 50),
    p75: percentile(num('descLen'), 75),
    inRange120to160: published.filter((a) => a.descLen >= 120 && a.descLen <= 160).length,
  },
  wordCount: {
    min: Math.min(...num('words')),
    max: Math.max(...num('words')),
    avg: Math.round(avg(num('words'))),
    p25: percentile(num('words'), 25),
    p50: percentile(num('words'), 50),
    p75: percentile(num('words'), 75),
  },
  h2Count: {
    min: Math.min(...num('h2Count')),
    max: Math.max(...num('h2Count')),
    avg: Math.round(avg(num('h2Count')) * 10) / 10,
    p50: percentile(num('h2Count'), 50),
  },
  h3Count: {
    min: Math.min(...num('h3Count')),
    max: Math.max(...num('h3Count')),
    avg: Math.round(avg(num('h3Count')) * 10) / 10,
    p50: percentile(num('h3Count'), 50),
  },
  tagCount: {
    distribution: Object.fromEntries(
      [0, 1, 2, 3, 4, 5, 6].map((n) => [String(n), published.filter((a) => a.tagCount === n).length])
    ),
    mostCommon: Object.entries(tagfreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([tag, count]) => ({ tag, count })),
  },
  categories: categoryCounts,
  affiliateDisclosure: {
    with: published.filter((a) => a.hasAffiliateDisclosure).length,
    without: published.filter((a) => !a.hasAffiliateDisclosure).length,
  },
  hookBeforeFirstH2: {
    with: published.filter((a) => a.hasHookBeforeFirstH2).length,
    without: published.filter((a) => !a.hasHookBeforeFirstH2).length,
  },
  topH2Headings: Object.entries(h2freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([heading, count]) => ({ heading, count })),
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));

console.log(JSON.stringify(report, null, 2));
