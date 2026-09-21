import { getRemoteRepoFile } from '../github-publish';
import { COBW_GITHUB, COBW_REGISTRY_GITHUB_PATH, COBW_REGISTRY_RAW_URL } from './constants';
import type { CobwRegistry } from './types';

export type RegistrySource =
  | { kind: 'github'; owner: string; repo: string; branch: string; path: string }
  | { kind: 'http'; url: string }
  | { kind: 'local'; path: string };

const GITHUB_SOURCE_RE =
  /^github:([^/]+)\/([^@]+)@([^:]+):(.+)$/i;

const RAW_GITHUB_RE =
  /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/i;

export function parseRegistrySource(input: string): RegistrySource {
  const trimmed = input.trim();
  const githubMatch = trimmed.match(GITHUB_SOURCE_RE);
  if (githubMatch) {
    return {
      kind: 'github',
      owner: githubMatch[1],
      repo: githubMatch[2],
      branch: githubMatch[3],
      path: githubMatch[4],
    };
  }

  const rawMatch = trimmed.match(RAW_GITHUB_RE);
  if (rawMatch) {
    return {
      kind: 'github',
      owner: rawMatch[1],
      repo: rawMatch[2],
      branch: rawMatch[3],
      path: rawMatch[4],
    };
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { kind: 'http', url: trimmed };
  }

  return { kind: 'local', path: trimmed.startsWith('/') ? trimmed : `/${trimmed}` };
}

export function defaultCobwRegistrySource(): RegistrySource {
  return {
    kind: 'github',
    owner: COBW_GITHUB.owner,
    repo: COBW_GITHUB.repo,
    branch: COBW_GITHUB.branch,
    path: COBW_REGISTRY_GITHUB_PATH,
  };
}

function parseRegistryJson(text: string): CobwRegistry {
  const registry = JSON.parse(text) as CobwRegistry;
  if (!registry?.ideas || !Array.isArray(registry.ideas)) {
    throw new Error('Invalid registry: missing ideas array');
  }
  return registry;
}

/**
 * Load COBW registry for `/admin/cobw`.
 * Private repos: pass a PAT with read access to the COBW repo (github: source or raw URL → Contents API).
 */
export async function fetchCobwRegistry(
  sourceInput: string,
  token: string,
  options?: { fallbackLocalPath?: string; siteOrigin?: string },
): Promise<CobwRegistry> {
  const source =
    sourceInput.trim() ? parseRegistrySource(sourceInput) : defaultCobwRegistrySource();

  if (source.kind === 'github') {
    if (!token) {
      throw new Error(
        'GitHub token required to read the private COBW registry. Save a PAT on /admin (repo scope, access to at_her_cafe).',
      );
    }
    const file = await getRemoteRepoFile(
      source.owner,
      source.repo,
      source.path,
      source.branch,
      token,
    );
    return parseRegistryJson(file.content);
  }

  if (source.kind === 'http') {
    const res = await fetch(source.url);
    if (res.ok) {
      return parseRegistryJson(await res.text());
    }
    // Private raw URLs return 404 without auth — retry via API when URL points at COBW export
    if (res.status === 404 && token && source.url === COBW_REGISTRY_RAW_URL) {
      const file = await getRemoteRepoFile(
        COBW_GITHUB.owner,
        COBW_GITHUB.repo,
        COBW_REGISTRY_GITHUB_PATH,
        COBW_GITHUB.branch,
        token,
      );
      return parseRegistryJson(file.content);
    }
    throw new Error(`Registry fetch failed: ${res.status}`);
  }

  const origin = options?.siteOrigin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  const url = new URL(source.path, origin).href;
  const res = await fetch(url);
  if (!res.ok && options?.fallbackLocalPath) {
    const fallback = new URL(options.fallbackLocalPath, origin).href;
    const res2 = await fetch(fallback);
    if (res2.ok) return parseRegistryJson(await res2.text());
  }
  if (!res.ok) throw new Error(`Registry fetch failed: ${res.status}`);
  return parseRegistryJson(await res.text());
}
