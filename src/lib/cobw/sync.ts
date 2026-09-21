import type {
  CobwArticleStatus,
  CobwLocalIdea,
  CobwRegistry,
  CobwRegistryIdea,
  CobwSyncState,
  CobwVideoPublishedPayload,
} from './types';

import { COBW_REGISTRY_DEFAULT_URL, COBW_REGISTRY_LOCAL_PATH } from './constants.ts';

/** Remote COBW export; use local path only when developing offline. */
export const DEFAULT_REGISTRY_URL = COBW_REGISTRY_DEFAULT_URL;
export const FALLBACK_REGISTRY_URL = COBW_REGISTRY_LOCAL_PATH;
export const COBW_SYNC_STATE_PATH = 'data/cobw-sync-state.json';

const SYNCABLE_FROM_REGISTRY = [
  'sourceTitle',
  'sourceCategory',
  'sourcePremise',
  'youtubeStatus',
  'youtubeUrl',
  'youtubeVideoId',
] as const;

export function emptySyncState(registryUrl = DEFAULT_REGISTRY_URL): CobwSyncState {
  return {
    schemaVersion: 1,
    registryUrl,
    lastSyncedAt: null,
    ideas: {},
  };
}

function registryToLocalBase(row: CobwRegistryIdea): Omit<CobwLocalIdea, 'articleStatus' | 'articleSlug' | 'articleUrl' | 'articleTitle' | 'seoTitle' | 'lastSyncedAt'> {
  return {
    cobwId: row.cobw_id,
    sourceTitle: row.title,
    sourceCategory: row.category,
    sourcePremise: row.premise,
    youtubeStatus: row.youtube_status,
    youtubeUrl: row.youtube_url,
    youtubeVideoId: row.youtube_video_id,
  };
}

function defaultArticleFields(): Pick<
  CobwLocalIdea,
  'articleStatus' | 'articleSlug' | 'articleUrl' | 'articleTitle' | 'seoTitle'
> {
  return {
    articleStatus: 'not_created',
    articleSlug: null,
    articleUrl: null,
    articleTitle: null,
    seoTitle: null,
  };
}

/** Upsert registry rows by cobw_id without touching article body fields. */
export function syncCobwRegistry(
  state: CobwSyncState,
  registry: CobwRegistry,
  syncedAt: string = new Date().toISOString(),
): CobwSyncState {
  const ideas: Record<string, CobwLocalIdea> = { ...state.ideas };

  for (const row of registry.ideas) {
    const id = row.cobw_id;
    const existing = ideas[id];
    const base = registryToLocalBase(row);

    if (!existing) {
      ideas[id] = {
        ...base,
        ...defaultArticleFields(),
        lastSyncedAt: syncedAt,
      };
      continue;
    }

    const next: CobwLocalIdea = { ...existing, lastSyncedAt: syncedAt };
    next.sourceTitle = base.sourceTitle;
    next.sourceCategory = base.sourceCategory;
    next.sourcePremise = base.sourcePremise;
    next.youtubeStatus = base.youtubeStatus;
    next.youtubeUrl = base.youtubeUrl;
    next.youtubeVideoId = base.youtubeVideoId;
    ideas[id] = next;
  }

  const registryIds = new Set(registry.ideas.map((r) => r.cobw_id));
  for (const id of Object.keys(ideas)) {
    if (registryIds.has(id)) continue;
    const row = ideas[id];
    if (row.articleStatus === 'not_created' || row.articleStatus === 'failed') {
      delete ideas[id];
    }
  }

  return {
    ...state,
    lastSyncedAt: syncedAt,
    ideas,
  };
}

export function assertUniqueCobwIds(registry: CobwRegistry): void {
  const seen = new Set<string>();
  for (const row of registry.ideas) {
    if (seen.has(row.cobw_id)) {
      throw new Error(`Duplicate cobw_id in registry: ${row.cobw_id}`);
    }
    seen.add(row.cobw_id);
  }
}

export function applyVideoPublishedWebhook(
  state: CobwSyncState,
  payload: CobwVideoPublishedPayload,
  syncedAt: string = new Date().toISOString(),
): CobwSyncState {
  const id = payload.cobw_id;
  const existing = state.ideas[id];
  const base: CobwLocalIdea = existing ?? {
    ...registryToLocalBase({
      cobw_id: id,
      title: '',
      category: 'money',
      premise: '',
      youtube_status: 'published',
      youtube_video_id: payload.youtube_video_id,
      youtube_url: payload.youtube_url,
      youtube_published_at: payload.published_at ?? null,
    }),
    ...defaultArticleFields(),
    lastSyncedAt: syncedAt,
  };

  const ideas = {
    ...state.ideas,
    [id]: {
      ...base,
      youtubeStatus: 'published',
      youtubeUrl: payload.youtube_url,
      youtubeVideoId: payload.youtube_video_id,
      lastSyncedAt: syncedAt,
    },
  };

  return { ...state, ideas, lastSyncedAt: syncedAt };
}

export function setArticleStatus(
  state: CobwSyncState,
  cobwId: string,
  patch: Partial<Pick<CobwLocalIdea, 'articleStatus' | 'articleSlug' | 'articleUrl' | 'articleTitle' | 'seoTitle'>>,
): CobwSyncState {
  const existing = state.ideas[cobwId];
  if (!existing) {
    throw new Error(`Unknown cobw_id: ${cobwId}`);
  }
  return {
    ...state,
    ideas: {
      ...state.ideas,
      [cobwId]: { ...existing, ...patch },
    },
  };
}

export function listIdeasSorted(state: CobwSyncState): CobwLocalIdea[] {
  return Object.values(state.ideas).sort((a, b) => a.cobwId.localeCompare(b.cobwId));
}

export function syncStats(state: CobwSyncState) {
  const rows = listIdeasSorted(state);
  const videosPublished = rows.filter((r) => r.youtubeStatus === 'published').length;
  const articlesPublished = rows.filter((r) => r.articleStatus === 'published').length;
  const drafts = rows.filter((r) => r.articleStatus === 'draft' || r.articleStatus === 'review').length;
  const notCreated = rows.filter((r) => r.articleStatus === 'not_created').length;
  return {
    total: rows.length,
    videosPublished,
    articlesPublished,
    drafts,
    notCreated,
  };
}

/** Fields that sync may update on an existing local row (for tests). */
export function syncableFieldNames(): readonly string[] {
  return SYNCABLE_FROM_REGISTRY;
}

export function isTerminalArticleFailure(status: CobwArticleStatus): boolean {
  return status === 'failed';
}

export type CobwArticleMeta = {
  cobwId: string;
  slug: string;
  draft: boolean;
  title: string;
  youtubeUrl: string | null;
  youtubeVideoId: string | null;
};

/** Match published/draft articles in the repo without overwriting registry-sourced fields. */
export function reconcileArticleMetadata(state: CobwSyncState, articles: CobwArticleMeta[]): CobwSyncState {
  const ideas = { ...state.ideas };
  for (const article of articles) {
    const existing = ideas[article.cobwId];
    if (!existing) continue;
    ideas[article.cobwId] = {
      ...existing,
      articleSlug: article.slug,
      articleTitle: article.title,
      articleStatus: article.draft ? 'draft' : 'published',
      articleUrl: `https://focus-dividend.com/${article.slug}`,
      youtubeUrl: article.youtubeUrl ?? existing.youtubeUrl,
      youtubeVideoId: article.youtubeVideoId ?? existing.youtubeVideoId,
    };
  }
  return { ...state, ideas };
}
