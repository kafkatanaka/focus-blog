import type { CobwArticleSource } from './cobw-article-source';
import type { ArticleCategory } from './article-rules';

export const COBW_IMPORTS_STORAGE_KEY = 'focus-blog-cobw-imports';

export interface CobwGeneratedDraft {
  title: string;
  seoTitle: string;
  description: string;
  slug: string;
  category: ArticleCategory;
  tags: [string, string, string];
  body: string;
  generatedAt: string;
}

export interface CobwArticleImport {
  jobId: string;
  sourceSnapshot: CobwArticleSource;
  importedAt: string;
  updatedAt: string;
  draft?: CobwGeneratedDraft;
  publishedAt?: string;
  publishedSlug?: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function listCobwImports(): CobwArticleImport[] {
  try {
    const raw = localStorage.getItem(COBW_IMPORTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CobwArticleImport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCobwImports(imports: CobwArticleImport[]): void {
  localStorage.setItem(COBW_IMPORTS_STORAGE_KEY, JSON.stringify(imports));
}

export function getCobwImportByJobId(jobId: string): CobwArticleImport | undefined {
  return listCobwImports().find((i) => i.jobId === jobId);
}

export function upsertCobwImportSource(
  source: CobwArticleSource,
  options?: { preserveDraft?: boolean },
): CobwArticleImport {
  const jobId = source.frontmatter.job_id;
  const imports = listCobwImports();
  const idx = imports.findIndex((i) => i.jobId === jobId);
  const existing = idx >= 0 ? imports[idx] : undefined;
  const timestamp = nowIso();

  const record: CobwArticleImport = {
    jobId,
    sourceSnapshot: source,
    importedAt: existing?.importedAt ?? timestamp,
    updatedAt: timestamp,
    ...(options?.preserveDraft && existing?.draft ? { draft: existing.draft } : {}),
    ...(existing?.publishedAt ? { publishedAt: existing.publishedAt } : {}),
    ...(existing?.publishedSlug ? { publishedSlug: existing.publishedSlug } : {}),
  };

  if (idx >= 0) {
    imports[idx] = record;
  } else {
    imports.push(record);
  }

  saveCobwImports(imports);
  return record;
}

export function saveCobwDraft(jobId: string, draft: CobwGeneratedDraft): CobwArticleImport {
  const imports = listCobwImports();
  const idx = imports.findIndex((i) => i.jobId === jobId);
  if (idx < 0) {
    throw new Error(`No import found for job_id ${jobId}`);
  }
  imports[idx] = {
    ...imports[idx],
    draft,
    updatedAt: nowIso(),
  };
  saveCobwImports(imports);
  return imports[idx];
}

export function markCobwPublished(jobId: string, slug: string): CobwArticleImport {
  const imports = listCobwImports();
  const idx = imports.findIndex((i) => i.jobId === jobId);
  if (idx < 0) {
    throw new Error(`No import found for job_id ${jobId}`);
  }
  imports[idx] = {
    ...imports[idx],
    publishedAt: nowIso(),
    publishedSlug: slug,
    updatedAt: nowIso(),
  };
  saveCobwImports(imports);
  return imports[idx];
}

export function deleteCobwImport(jobId: string): void {
  saveCobwImports(listCobwImports().filter((i) => i.jobId !== jobId));
}
