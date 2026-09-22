/** GitHub Contents API (Node / Cloudflare Functions). */

import { GITHUB_REPO } from '../github-publish';
import type { CobwSyncState } from './types';
import { COBW_SYNC_STATE_PATH } from './sync';

function utf8ToBase64(text: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(text, 'utf8').toString('base64');
  }
  return btoa(unescape(encodeURIComponent(text)));
}

function base64ToUtf8(base64: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64').toString('utf8');
  }
  return decodeURIComponent(escape(atob(base64)));
}

async function githubFetch(path: string, token: string, init: RequestInit = {}) {
  const url = `https://api.github.com/repos/${GITHUB_REPO.owner}/${GITHUB_REPO.repo}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { message?: string })?.message ?? res.statusText;
    throw new Error(message);
  }
  return data as { content?: string; sha?: string };
}

export async function getSyncStateFromGitHub(token: string): Promise<{ state: CobwSyncState; sha?: string }> {
  try {
    const data = await githubFetch(`/contents/${COBW_SYNC_STATE_PATH}?ref=${GITHUB_REPO.branch}`, token);
    const content = base64ToUtf8((data.content ?? '').replace(/\n/g, ''));
    return { state: JSON.parse(content) as CobwSyncState, sha: data.sha };
  } catch {
    return {
      state: {
        schemaVersion: 1,
        registryUrl: '/cobw-registry.json',
        lastSyncedAt: null,
        ideas: {},
      },
    };
  }
}

export async function putSyncStateToGitHub(
  state: CobwSyncState,
  token: string,
  message: string,
  existingSha?: string,
): Promise<void> {
  let sha = existingSha;
  if (!sha) {
    try {
      const existing = await githubFetch(`/contents/${COBW_SYNC_STATE_PATH}?ref=${GITHUB_REPO.branch}`, token);
      sha = existing.sha;
    } catch {
      // new file
    }
  }

  const content = JSON.stringify(state, null, 2) + '\n';
  await githubFetch(`/contents/${COBW_SYNC_STATE_PATH}`, token, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: utf8ToBase64(content),
      branch: GITHUB_REPO.branch,
      ...(sha ? { sha } : {}),
    }),
  });
}
