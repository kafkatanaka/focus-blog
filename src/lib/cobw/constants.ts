/** Canonical COBW (The Cost of Being Wrong) GitHub repository. */
export const COBW_GITHUB = {
  owner: 'kafkatanaka',
  repo: 'at_her_cafe',
  branch: 'main',
  url: 'https://github.com/kafkatanaka/at_her_cafe',
} as const;

/** Path to exported registry inside at_her_cafe. */
export const COBW_REGISTRY_GITHUB_PATH = 'public/cobw-registry.json';

/** Public raw URL — works only if at_her_cafe is public. */
export const COBW_REGISTRY_RAW_URL =
  `https://raw.githubusercontent.com/${COBW_GITHUB.owner}/${COBW_GITHUB.repo}/${COBW_GITHUB.branch}/${COBW_REGISTRY_GITHUB_PATH}`;

/** Same-site fallback when developing offline (mirror in focus-blog). */
export const COBW_REGISTRY_LOCAL_PATH = '/cobw-registry.json';

/**
 * Default registry source for `/admin/cobw` (both repos private).
 * Resolved via GitHub Contents API + the PAT saved on /admin.
 */
export const COBW_REGISTRY_DEFAULT_SOURCE =
  `github:${COBW_GITHUB.owner}/${COBW_GITHUB.repo}@${COBW_GITHUB.branch}:${COBW_REGISTRY_GITHUB_PATH}`;

export const COBW_REGISTRY_DEFAULT_URL = COBW_REGISTRY_DEFAULT_SOURCE;

/** Source YAML path inside at_her_cafe (after export layout is added). */
export const COBW_IDEAS_SOURCE_PATH = 'data/cobw-ideas.yaml';
