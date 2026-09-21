import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Dynamic import of TS would need tsx; duplicate minimal test logic by importing built sync via string eval
// Use node --experimental-strip-types if available, else inline test copies of sync functions.

const { syncCobwRegistry, emptySyncState, applyVideoPublishedWebhook, assertUniqueCobwIds } =
  await import('../../src/lib/cobw/sync.ts');

const registry = JSON.parse(
  readFileSync(path.join(ROOT, 'public/cobw-registry.json'), 'utf8'),
);

assertUniqueCobwIds(registry);
assert.equal(registry.ideas.length, 30, 'expected 30 ideas in registry');

let state = emptySyncState();
state = syncCobwRegistry(state, registry, '2026-09-22T00:00:00Z');
assert.equal(Object.keys(state.ideas).length, 30);

const first = state.ideas.cobw_001;
assert.equal(first.sourceTitle, 'Why Smart People Keep Going Broke');
assert.equal(first.articleStatus, 'not_created');

state = syncCobwRegistry(
  {
    ...state,
    ideas: {
      ...state.ideas,
      cobw_001: {
        ...state.ideas.cobw_001,
        articleStatus: 'published',
        articleSlug: 'smart-people-broke',
        articleTitle: 'Custom title',
        articleUrl: 'https://focus-dividend.com/smart-people-broke',
      },
    },
  },
  {
    ...registry,
    ideas: registry.ideas.map((row) =>
      row.cobw_id === 'cobw_001' ? { ...row, title: 'Renamed title from COBW' } : row,
    ),
  },
  '2026-09-22T01:00:00Z',
);

assert.equal(state.ideas.cobw_001.sourceTitle, 'Renamed title from COBW');
assert.equal(state.ideas.cobw_001.articleTitle, 'Custom title');
assert.equal(state.ideas.cobw_001.articleStatus, 'published');

state = syncCobwRegistry(state, registry, '2026-09-22T02:00:00Z');
assert.equal(Object.keys(state.ideas).length, 30, 'second sync must not duplicate rows');

let pruneState = syncCobwRegistry(emptySyncState(), registry);
pruneState = {
  ...pruneState,
  ideas: {
    ...pruneState.ideas,
    cobw_legacy_dev: {
      cobwId: 'cobw_legacy_dev',
      sourceTitle: 'Dev only',
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
      lastSyncedAt: null,
    },
  },
};
pruneState = syncCobwRegistry(pruneState, registry);
assert.equal(pruneState.ideas.cobw_legacy_dev, undefined, 'prune dev-only ids not in registry');

let webhookState = emptySyncState();
webhookState = applyVideoPublishedWebhook(webhookState, {
  cobw_id: 'cobw_099',
  youtube_video_id: 'xyz',
  youtube_url: 'https://www.youtube.com/watch?v=xyz',
});
assert.equal(webhookState.ideas.cobw_099.youtubeUrl.includes('xyz'), true);

webhookState = applyVideoPublishedWebhook(webhookState, {
  cobw_id: 'cobw_099',
  youtube_video_id: 'xyz',
  youtube_url: 'https://www.youtube.com/watch?v=xyz',
});
assert.equal(Object.keys(webhookState.ideas).length, 1, 'webhook must be idempotent');

console.log('cobw sync tests passed');
