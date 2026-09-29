import assert from 'node:assert/strict';
import { relatedPostHref } from '../src/lib/related-post-links.ts';

const jaPool = [
  {
    slug: 'should-i-change-jobs',
    data: { locale: 'ja' as const, category: 'work' as const },
  },
  {
    slug: 'focus-dividend-framework-ja',
    data: { locale: 'ja' as const, category: 'framework' as const },
  },
];

assert.equal(
  relatedPostHref('should-i-change-jobs', jaPool),
  '/jp/work/should-i-change-jobs'
);
assert.equal(
  relatedPostHref('focus-dividend-framework-ja', jaPool),
  '/jp/framework/focus-dividend-framework-ja'
);
assert.equal(relatedPostHref('missing', jaPool), '/missing');
assert.equal(relatedPostHref('orphan', undefined), '/orphan');

console.log('✓ JP related post href tests passed');
