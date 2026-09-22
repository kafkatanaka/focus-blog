/**
 * Fetch cobw-ideas.yaml from kafkatanaka/at_her_cafe and refresh local registry mirror.
 *
 * Requires GITHUB_TOKEN with repo access to the private COBW repo.
 *
 *   GITHUB_TOKEN=ghp_... npm run cobw:pull-from-cobw
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OWNER = 'kafkatanaka';
const REPO = 'at_her_cafe';
const BRANCH = 'main';

const CANDIDATE_PATHS = [
  'data/cobw-ideas.yaml',
  'data/cobw-ideas.yml',
  'cobw/data/cobw-ideas.yaml',
  'ideas/cobw-ideas.yaml',
];

const OUT_YAML = path.join(ROOT, 'vendor/cobw/data/cobw-ideas.yaml');

const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
if (!token) {
  console.error('Set GITHUB_TOKEN (repo scope, access to at_her_cafe).');
  process.exit(1);
}

async function fetchFile(filePath) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${res.status} for ${filePath}: ${body}`);
  }
  const data = await res.json();
  const content = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8');
  return content;
}

let yaml = null;
let foundPath = null;
for (const candidate of CANDIDATE_PATHS) {
  yaml = await fetchFile(candidate);
  if (yaml) {
    foundPath = candidate;
    break;
  }
}

if (!yaml) {
  console.error(
    `No ideas file found in ${OWNER}/${REPO}. Tried:\n${CANDIDATE_PATHS.map((p) => `  - ${p}`).join('\n')}\n` +
      'Add export layout from vendor/cobw/for-at-her-cafe/ to the COBW repo.',
  );
  process.exit(1);
}

fs.mkdirSync(path.dirname(OUT_YAML), { recursive: true });
fs.writeFileSync(OUT_YAML, yaml);
console.log(`Pulled ${foundPath} → ${path.relative(ROOT, OUT_YAML)}`);

const exportRun = spawnSync('node', ['scripts/cobw/export-registry.mjs'], {
  cwd: ROOT,
  stdio: 'inherit',
});
process.exit(exportRun.status ?? 1);
