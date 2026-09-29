/**
 * Audit internal content graph (warnings only — no auto-fix).
 * Run: npm run audit-content-graph
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildInventoryRecord,
  loadContentOverrides,
  type ParsedBlogFrontmatter,
} from '../src/lib/content-metadata';
import { canonicalUrlFromSlug } from '../src/lib/site-url';
import { countWords, parseFrontmatter } from './lib/parse-frontmatter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const OUT_DIR = path.join(ROOT, 'generated');

type IssueLevel = 'error' | 'warning';
type Issue = { level: IssueLevel; code: string; slug: string; message: string };

function loadRecords() {
  const overrides = loadContentOverrides(ROOT);
  const records = [];
  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!file.endsWith('.md')) continue;
    const slug = file.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { fm, body } = parseFrontmatter(content);
    records.push(
      buildInventoryRecord(slug, fm as ParsedBlogFrontmatter, countWords(body), overrides)
    );
  }
  return records;
}

function main() {
  const records = loadRecords();
  const published = records.filter((r) => !r.draft && r.indexable);
  const slugSet = new Set(records.map((r) => r.slug));
  const publishedSlugSet = new Set(published.map((r) => r.slug));
  const issues: Issue[] = [];

  const hubSlugs = new Set(published.filter((r) => r.isHub).map((r) => r.slug));
  const hubIdTargets = new Set(
    published.map((r) => r.hubId).filter((id): id is string => Boolean(id))
  );

  for (const r of published) {
    if (!r.category) {
      issues.push({
        level: 'warning',
        code: 'missing_category',
        slug: r.slug,
        message: 'Published article has no category',
      });
    }

    if (r.hubId && !slugSet.has(r.hubId) && !hubSlugs.has(r.hubId)) {
      issues.push({
        level: 'warning',
        code: 'broken_hub_id',
        slug: r.slug,
        message: `hubId "${r.hubId}" does not match a known article slug`,
      });
    }

    const seenRelated = new Set<string>();
    for (const rel of r.relatedArticleIds) {
      if (rel === r.slug) {
        issues.push({
          level: 'warning',
          code: 'self_relation',
          slug: r.slug,
          message: 'relatedArticleIds includes self',
        });
      }
      if (seenRelated.has(rel)) {
        issues.push({
          level: 'warning',
          code: 'duplicate_relation',
          slug: r.slug,
          message: `duplicate relatedArticleId "${rel}"`,
        });
      }
      seenRelated.add(rel);
      if (!slugSet.has(rel)) {
        issues.push({
          level: 'warning',
          code: 'broken_related',
          slug: r.slug,
          message: `relatedArticleId "${rel}" not found`,
        });
      } else if (!publishedSlugSet.has(rel)) {
        issues.push({
          level: 'warning',
          code: 'unpublished_relation',
          slug: r.slug,
          message: `relatedArticleId "${rel}" is draft or missing`,
        });
      }
    }

    if (r.canonical !== canonicalUrlFromSlug(r.slug)) {
      issues.push({
        level: 'error',
        code: 'canonical_mismatch',
        slug: r.slug,
        message: `canonical ${r.canonical} does not match slug rule`,
      });
    }

    if (r.indexable && !r.inSitemap && !r.draft) {
      issues.push({
        level: 'warning',
        code: 'sitemap_mismatch',
        slug: r.slug,
        message: 'indexable but inSitemap is false',
      });
    }
  }

  // Orphans: published, indexable, no hub link and not a hub themselves
  for (const r of published) {
    const linkedToHub =
      r.isHub ||
      (r.hubId && publishedSlugSet.has(r.hubId)) ||
      hubIdTargets.has(r.slug);
    const hasRelations = r.relatedArticleIds.length > 0;
    if (!linkedToHub && !hasRelations) {
      issues.push({
        level: 'warning',
        code: 'orphan_article',
        slug: r.slug,
        message: 'No hubId, isHub, or relatedArticleIds (graph orphan during migration)',
      });
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, 'content-graph-audit.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        articleCount: records.length,
        publishedCount: published.length,
        issueCount: issues.length,
        errors: issues.filter((i) => i.level === 'error').length,
        warnings: issues.filter((i) => i.level === 'warning').length,
        issues,
      },
      null,
      2
    )
  );

  const errors = issues.filter((i) => i.level === 'error').length;
  const warnings = issues.filter((i) => i.level === 'warning').length;
  console.log(`✅ content-graph audit → ${outPath} (${errors} errors, ${warnings} warnings)`);

  if (errors > 0) {
    process.exitCode = 1;
  }
}

main();
