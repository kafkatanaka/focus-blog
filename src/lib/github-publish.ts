/** GitHub Contents API helpers for the admin UI (browser-side). */

export const GITHUB_REPO = {
  owner: 'kafkatanaka',
  repo: 'focus-blog',
  branch: 'main',
} as const;

export const GITHUB_TOKEN_KEY = 'focus-blog-github-token';

export function utf8ToBase64(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

export function base64ToUtf8(base64: string): string {
  return decodeURIComponent(escape(atob(base64)));
}

export async function githubFetchRepo(
  owner: string,
  repo: string,
  apiPath: string,
  token: string,
  init: RequestInit = {},
) {
  const url = `https://api.github.com/repos/${owner}/${repo}${apiPath}`;
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
  return data;
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
    const message = data?.message ?? res.statusText;
    throw new Error(message);
  }
  return data;
}

export async function getRepoFile(path: string, token: string) {
  const data = await githubFetch(`/contents/${path}?ref=${GITHUB_REPO.branch}`, token);
  return {
    content: base64ToUtf8(data.content.replace(/\n/g, '')),
    sha: data.sha as string,
  };
}

/** Read a file from any GitHub repo (private repos need a PAT with access). */
export async function getRemoteRepoFile(
  owner: string,
  repo: string,
  path: string,
  branch: string,
  token: string,
) {
  const data = await githubFetchRepo(
    owner,
    repo,
    `/contents/${path}?ref=${branch}`,
    token,
  ) as { content: string; sha: string };
  return {
    content: base64ToUtf8(data.content.replace(/\n/g, '')),
    sha: data.sha,
  };
}

export async function putRepoFile(
  path: string,
  content: string,
  message: string,
  token: string,
  existingSha?: string,
) {
  let sha = existingSha;
  if (!sha) {
    try {
      const existing = await getRepoFile(path, token);
      sha = existing.sha;
    } catch {
      // new file
    }
  }

  return githubFetch(`/contents/${path}`, token, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: utf8ToBase64(content),
      branch: GITHUB_REPO.branch,
      ...(sha ? { sha } : {}),
    }),
  });
}
