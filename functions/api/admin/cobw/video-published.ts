/**
 * COBW → Focus Dividend webhook (Cloudflare Pages Function).
 * Env: GITHUB_TOKEN (required), COBW_WEBHOOK_SECRET (optional Bearer).
 */

const REPO = { owner: 'kafkatanaka', repo: 'focus-blog', branch: 'main' };
const SYNC_PATH = 'data/cobw-sync-state.json';

type SyncState = {
  schemaVersion: number;
  registryUrl: string;
  lastSyncedAt: string | null;
  ideas: Record<string, Record<string, unknown>>;
};

function b64ToUtf8(b64: string): string {
  const clean = b64.replace(/\n/g, '');
  if (typeof atob === 'function') {
    return decodeURIComponent(escape(atob(clean)));
  }
  return '';
}

function utf8ToB64(text: string): string {
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(text)));
  }
  return '';
}

async function gh(path: string, token: string, init: RequestInit = {}) {
  const url = `https://api.github.com/repos/${REPO.owner}/${REPO.repo}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message ?? res.statusText);
  return data as { content?: string; sha?: string };
}

async function loadState(token: string): Promise<{ state: SyncState; sha?: string }> {
  try {
    const data = await gh(`/contents/${SYNC_PATH}?ref=${REPO.branch}`, token);
    return { state: JSON.parse(b64ToUtf8(data.content ?? '')) as SyncState, sha: data.sha };
  } catch {
    return {
      state: { schemaVersion: 1, registryUrl: '/cobw-registry.json', lastSyncedAt: null, ideas: {} },
    };
  }
}

async function saveState(state: SyncState, token: string, message: string, sha?: string) {
  let existingSha = sha;
  if (!existingSha) {
    try {
      const data = await gh(`/contents/${SYNC_PATH}?ref=${REPO.branch}`, token);
      existingSha = data.sha;
    } catch {
      /* new */
    }
  }
  const body = JSON.stringify(state, null, 2) + '\n';
  await gh(`/contents/${SYNC_PATH}`, token, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: utf8ToB64(body),
      branch: REPO.branch,
      ...(existingSha ? { sha: existingSha } : {}),
    }),
  });
}

function applyVideoPublished(state: SyncState, payload: Record<string, string>, syncedAt: string): SyncState {
  const id = payload.cobw_id;
  const existing = state.ideas[id] ?? {
    cobwId: id,
    sourceTitle: '',
    sourceCategory: 'money',
    sourcePremise: '',
    youtubeStatus: 'not_started',
    youtubeUrl: null,
    youtubeVideoId: null,
    articleStatus: 'not_created',
    articleSlug: null,
    articleUrl: null,
    articleTitle: null,
    seoTitle: null,
    lastSyncedAt: syncedAt,
  };

  return {
    ...state,
    lastSyncedAt: syncedAt,
    ideas: {
      ...state.ideas,
      [id]: {
        ...existing,
        youtubeStatus: 'published',
        youtubeUrl: payload.youtube_url,
        youtubeVideoId: payload.youtube_video_id,
        lastSyncedAt: syncedAt,
      },
    },
  };
}

type Env = { COBW_WEBHOOK_SECRET?: string; GITHUB_TOKEN?: string };

export async function onRequestPost(context: { request: Request; env: Env }) {
  const secret = context.env.COBW_WEBHOOK_SECRET;
  if (secret) {
    const header = context.request.headers.get('authorization') ?? '';
    if (header !== `Bearer ${secret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const token = context.env.GITHUB_TOKEN;
  if (!token) {
    return Response.json({ error: 'GITHUB_TOKEN not configured' }, { status: 503 });
  }

  const payload = (await context.request.json().catch(() => null)) as Record<string, string> | null;
  if (!payload?.cobw_id || !payload?.youtube_url || !payload?.youtube_video_id) {
    return Response.json({ error: 'cobw_id, youtube_url, youtube_video_id required' }, { status: 400 });
  }

  const syncedAt = new Date().toISOString();
  const { state, sha } = await loadState(token);
  const next = applyVideoPublished(state, payload, syncedAt);
  await saveState(next, token, `COBW video published: ${payload.cobw_id}`, sha);

  const row = next.ideas[payload.cobw_id];
  return Response.json({
    ok: true,
    cobw_id: payload.cobw_id,
    articleStatus: row?.articleStatus ?? 'not_created',
  });
}
