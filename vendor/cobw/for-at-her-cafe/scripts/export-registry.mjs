/**
 * COBW repo — build consumer-safe registry for Focus Dividend.
 * Place at: at_her_cafe/scripts/export-registry.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'data/cobw-ideas.yaml');
const OUT = path.join(ROOT, 'public/cobw-registry.json');

function mapYoutubeStatus(raw) {
  const s = raw?.status ?? 'not_started';
  if (['not_started', 'in_progress', 'rendered', 'published'].includes(s)) return s;
  return 'not_started';
}

function exportIdea(idea) {
  const yt = idea.youtube ?? {};
  return {
    cobw_id: idea.id,
    title: idea.title,
    category: idea.category,
    premise: (idea.premise ?? '').trim(),
    idea_status: idea.status ?? 'active',
    youtube_status: mapYoutubeStatus(yt),
    youtube_video_id: yt.video_id ?? null,
    youtube_url: yt.url ?? null,
    youtube_published_at: yt.published_at ?? null,
  };
}

const doc = yaml.load(fs.readFileSync(SOURCE, 'utf8'));
const ideas = (doc.ideas ?? []).map(exportIdea);

const seen = new Set();
for (const row of ideas) {
  if (seen.has(row.cobw_id)) throw new Error(`Duplicate cobw_id: ${row.cobw_id}`);
  seen.add(row.cobw_id);
}

const registry = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  ideas,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2) + '\n');
console.log(`Wrote ${ideas.length} ideas → public/cobw-registry.json`);
