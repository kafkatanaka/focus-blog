/** Canonical COBW (The Cost of Being Wrong) GitHub repository. */
export const COBW_GITHUB = {
  owner: 'kafkatanaka',
  repo: 'at_her_cafe',
  branch: 'main',
  url: 'https://github.com/kafkatanaka/at_her_cafe',
} as const;

/** Consumer-safe registry JSON published from the COBW repo. */
export const COBW_REGISTRY_RAW_URL =
  `https://raw.githubusercontent.com/${COBW_GITHUB.owner}/${COBW_GITHUB.repo}/${COBW_GITHUB.branch}/public/cobw-registry.json`;

/** Same-site fallback when COBW export is not reachable (local dev / mirror). */
export const COBW_REGISTRY_LOCAL_PATH = '/cobw-registry.json';

/**
 * Default registry URL for `/admin/cobw`.
 * Prefer COBW export; falls back to bundled mirror in this repo.
 */
export const COBW_REGISTRY_DEFAULT_URL = COBW_REGISTRY_RAW_URL;

/** Source YAML path inside at_her_cafe (after export layout is added). */
export const COBW_IDEAS_SOURCE_PATH = 'data/cobw-ideas.yaml';
