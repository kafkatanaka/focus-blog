/**
 * Audit internal content graph (warnings only — no auto-fix).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContentIdsRegistry, resolveStableOrSlugRef } from '../src/lib/content-ids';
import {
  buildInventoryRecord,
  loadContentOverrides,
  type InventoryRecord,
  type ParsedBlogFrontmatter,
} from '../src/lib/content-metadata';
import type { Locale } from '../src/lib/locale';
import { countWords, parseFrontmatter } from './lib/parse-frontmatter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const OUT_DIR = path.join(ROOT, 'generated');
const SKIP_FILES = new Set(['article-master-template.md']);

type IssueLevel = 'error' | 'warning';
type Issue = { level: IssueLevel; code: string; articleId: string; slug: string; message: string };

function loadRecords(): InventoryRecord[] {
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

function findRecordByRef(
  ref: string,
  locale: Locale,
  records: InventoryRecord[],
  registry: ReturnType<typeof loadContentIdsRegistry>
): InventoryRecord | undefined {
  const resolved = resolveStableOrSlugRef(ref, locale, registry);
  if (!resolved) return undefined;
  if (resolved.stableId) {
    return records.find((r) => r.articleId === resolved.stableId);
  }
  return records.find((r) => r.slug === resolved.slug && r.locale === resolved.locale);
}

function main() {
  const registry = loadContentIdsRegistry(ROOT);
  const records = loadRecords();
  const published = records.filter((r) => !r.draft && r.indexable);
  const publishedById = new Map(published.map((r) => [r.articleId, r]));
  const issues: Issue[] = [];

  const hubArticleIds = new Set(published.filter((r) => r.isHub).map((r) => r.articleId));

  for (const r of records) {
    if (!r.category) {
      issues.push({
        level: r.locale === 'ja' ? 'error' : 'warning',
        code: 'missing_category',
        articleId: r.articleId,
        slug: r.slug,
        message:
          r.locale === 'ja'
            ? 'Japanese article requires category for /jp/{category}/{slug}'
            : 'Published article has no category',
      });
    }

    if (r.canonical !== `https://focus-dividend.com${r.url}`) {
      issues.push({
        level: 'error',
        code: 'canonical_mismatch',
        articleId: r.articleId,
        slug: r.slug,
        message: `canonical ${r.canonical} does not match url ${r.url}`,
      });
    }

    if (r.locale === 'ja' && r.url.includes('__missing_category__')) {
      issues.push({
        level: 'error',
        code: 'ja_missing_category_url',
        articleId: r.articleId,
        slug: r.slug,
        message: 'Japanese article URL cannot be built without category',
      });
    }

    if (r.locale === 'ja' && !r.url.startsWith('/jp/')) {
      issues.push({
        level: 'error',
        code: 'ja_url_mismatch',
        articleId: r.articleId,
        slug: r.slug,
        message: `Japanese article must use /jp/... path, got ${r.url}`,
      });
    }

    if (r.locale === 'en' && r.url.startsWith('/jp/')) {
      issues.push({
        level: 'error',
        code: 'en_url_mismatch',
        articleId: r.articleId,
        slug: r.slug,
        message: `English article must not use /jp/ path`,
      });
    }
  }

  for (const r of published) {
    if (r.hubId) {
      const hubRecord = findRecordByRef(r.hubId, r.locale, records, registry);
      if (!hubRecord) {
        issues.push({
          level: 'warning',
          code: 'broken_hub_id',
          articleId: r.articleId,
          slug: r.slug,
          message: `hubId "${r.hubId}" not found`,
        });
      } else if (hubRecord.locale !== r.locale) {
        issues.push({
          level: 'warning',
          code: 'cross_locale_hub',
          articleId: r.articleId,
          slug: r.slug,
          message: `hubId "${r.hubId}" resolves to locale ${hubRecord.locale}, expected ${r.locale}`,
        });
      } else if (!publishedById.has(hubRecord.articleId)) {
        issues.push({
          level: 'warning',
          code: 'unpublished_hub',
          articleId: r.articleId,
          slug: r.slug,
          message: `hubId "${r.hubId}" is draft or not indexable`,
        });
      }
    }

    const seenRelated = new Set<string>();
    for (const relRef of r.relatedArticleIds) {
      if (relRef === r.slug || relRef === r.articleId) {
        issues.push({
          level: 'warning',
          code: 'self_relation',
          articleId: r.articleId,
          slug: r.slug,
          message: 'relatedArticleIds includes self',
        });
      }
      if (seenRelated.has(relRef)) {
        issues.push({
          level: 'warning',
          code: 'duplicate_relation',
          articleId: r.articleId,
          slug: r.slug,
          message: `duplicate relatedArticleId "${relRef}"`,
        });
      }
      seenRelated.add(relRef);

      const target = findRecordByRef(relRef, r.locale, records, registry);
      if (!target) {
        issues.push({
          level: 'warning',
          code: 'broken_related',
          articleId: r.articleId,
          slug: r.slug,
          message: `relatedArticleId "${relRef}" not found`,
        });
        continue;
      }
      if (target.locale !== r.locale) {
        issues.push({
          level: 'warning',
          code: 'cross_locale_relation',
          articleId: r.articleId,
          slug: r.slug,
          message: `relatedArticleId "${relRef}" resolves to locale ${target.locale}`,
        });
      } else if (!publishedById.has(target.articleId)) {
        issues.push({
          level: 'warning',
          code: 'unpublished_relation',
          articleId: r.articleId,
          slug: r.slug,
          message: `relatedArticleId "${relRef}" is draft or not indexable`,
        });
      }
    }

    if (r.indexable && !r.inSitemap && !r.draft) {
      issues.push({
        level: 'warning',
        code: 'sitemap_mismatch',
        articleId: r.articleId,
        slug: r.slug,
        message: 'indexable but inSitemap is false',
      });
    }
  }

  for (const r of published) {
    const linkedToHub =
      r.isHub ||
      (r.hubId && findRecordByRef(r.hubId, r.locale, published, registry) !== undefined) ||
      hubArticleIds.has(r.articleId);
    const hasRelations = r.relatedArticleIds.length > 0;
    if (!linkedToHub && !hasRelations) {
      issues.push({
        level: 'warning',
        code: 'orphan_article',
        articleId: r.articleId,
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
