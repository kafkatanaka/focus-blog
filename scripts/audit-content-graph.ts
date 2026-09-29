/**
 * Audit internal content graph (warnings only — no auto-fix).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildInventoryRecord,
  loadContentOverrides,
  type InventoryRecord,
  type ParsedBlogFrontmatter,
} from '../src/lib/content-metadata';
import { makeArticleId } from '../src/lib/locale';
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
  const records: InventoryRecord[] = [];
  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!file.endsWith('.md') || SKIP_FILES.has(file)) continue;
    const slug = file.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { fm, body } = parseFrontmatter(content);
    records.push(
      buildInventoryRecord(slug, fm as ParsedBlogFrontmatter, countWords(body), overrides)
    );
  }
  return records;
}

function resolveRelatedId(
  current: InventoryRecord,
  relatedSlug: string,
  bySlugLocale: Map<string, InventoryRecord[]>
): InventoryRecord | undefined {
  const sameLocale = bySlugLocale.get(relatedSlug)?.find((r) => r.locale === current.locale);
  if (sameLocale) return sameLocale;
  return bySlugLocale.get(relatedSlug)?.[0];
}

function main() {
  const records = loadRecords();
  const published = records.filter((r) => !r.draft && r.indexable);
  const bySlugLocale = new Map<string, InventoryRecord[]>();
  for (const r of records) {
    const list = bySlugLocale.get(r.slug) ?? [];
    list.push(r);
    bySlugLocale.set(r.slug, list);
  }

  const publishedById = new Map(published.map((r) => [r.articleId, r]));
  const issues: Issue[] = [];

  const hubArticleIds = new Set(published.filter((r) => r.isHub).map((r) => r.articleId));

  for (const r of published) {
    if (!r.category) {
      issues.push({
        level: 'warning',
        code: 'missing_category',
        articleId: r.articleId,
        slug: r.slug,
        message: 'Published article has no category',
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

    if (r.hubId) {
      const hubMatches = bySlugLocale.get(r.hubId) ?? [];
      const hubSameLocale = hubMatches.find((h) => h.locale === r.locale);
      if (!hubSameLocale) {
        issues.push({
          level: 'warning',
          code: 'broken_hub_id',
          articleId: r.articleId,
          slug: r.slug,
          message: `hubId "${r.hubId}" has no published article in locale ${r.locale}`,
        });
      }
      const hubOtherLocale = hubMatches.find((h) => h.locale !== r.locale);
      if (hubOtherLocale && !hubSameLocale) {
        issues.push({
          level: 'warning',
          code: 'cross_locale_hub',
          articleId: r.articleId,
          slug: r.slug,
          message: `hubId "${r.hubId}" only exists in locale ${hubOtherLocale.locale}`,
        });
      }
    }

    const seenRelated = new Set<string>();
    for (const relSlug of r.relatedArticleIds) {
      if (relSlug === r.slug) {
        issues.push({
          level: 'warning',
          code: 'self_relation',
          articleId: r.articleId,
          slug: r.slug,
          message: 'relatedArticleIds includes self',
        });
      }
      if (seenRelated.has(relSlug)) {
        issues.push({
          level: 'warning',
          code: 'duplicate_relation',
          articleId: r.articleId,
          slug: r.slug,
          message: `duplicate relatedArticleId "${relSlug}"`,
        });
      }
      seenRelated.add(relSlug);

      const targets = bySlugLocale.get(relSlug) ?? [];
      if (targets.length === 0) {
        issues.push({
          level: 'warning',
          code: 'broken_related',
          articleId: r.articleId,
          slug: r.slug,
          message: `relatedArticleId "${relSlug}" not found`,
        });
        continue;
      }

      const sameLocale = targets.find((t) => t.locale === r.locale);
      if (!sameLocale) {
        issues.push({
          level: 'warning',
          code: 'cross_locale_relation',
          articleId: r.articleId,
          slug: r.slug,
          message: `relatedArticleId "${relSlug}" has no ${r.locale} edition`,
        });
      } else if (!publishedById.has(sameLocale.articleId)) {
        issues.push({
          level: 'warning',
          code: 'unpublished_relation',
          articleId: r.articleId,
          slug: r.slug,
          message: `relatedArticleId "${relSlug}" is draft or not indexable in ${r.locale}`,
        });
      } else if (targets.some((t) => t.locale !== r.locale)) {
        issues.push({
          level: 'warning',
          code: 'cross_locale_relation',
          articleId: r.articleId,
          slug: r.slug,
          message: `relatedArticleId "${relSlug}" also exists in another locale — verify intent`,
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
      (r.hubId && published.some((p) => p.slug === r.hubId && p.locale === r.locale)) ||
      hubArticleIds.has(makeArticleId(r.locale, r.slug));
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
