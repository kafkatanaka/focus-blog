import assert from 'node:assert/strict';
import {
  parseYoutubeVideoId,
  canonicalYoutubeUrl,
  patchArticleYoutubeFields,
} from '../../src/lib/cobw/youtube-link.ts';

assert.equal(parseYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
assert.equal(parseYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
assert.equal(parseYoutubeVideoId('dQw4w9WgXcQ'), 'dQw4w9WgXcQ');

const md = `---
title: "Test"
cobw_id: cobw_opp_001
youtube_url: null
youtube_video_id: null
---

Body
`;
const next = patchArticleYoutubeFields(md, canonicalYoutubeUrl('abc12345678'), 'abc12345678');
assert.match(next, /youtube_url: "https:\/\/www\.youtube\.com\/watch\?v=abc12345678"/);
assert.match(next, /youtube_video_id: "abc12345678"/);

console.log('youtube-link tests passed');
