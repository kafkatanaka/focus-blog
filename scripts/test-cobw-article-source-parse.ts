import assert from 'node:assert/strict';
import {
  normalizeCobwEvidenceStatusForGeneration,
  parseCobwArticleSourceMarkdown,
} from '../src/lib/cobw-article-source.ts';

const sample = `---
schema_version: 1
source: cobw
job_id: test-job-001
title: Sample Episode
closing_phrase: HOOK ≠ FACT
youtube:
  status: published
  video_id: dQw4w9WgXcQ
  url: https://www.youtube.com/watch?v=dQw4w9WgXcQ
created_at: 2026-09-23T20:52:00Z
---

# Editorial Summary

## Core Idea

Core idea text.

## Hidden Cost

Hidden cost text.

## Second-order Consequence

Second order.

## Counterintuitive Realization

Counterintuitive.

# Writer Plan

## Hook

Hook narration.

# Final Narration

Full narration paragraph one.

Full narration paragraph two.

# Evidence

## Claim 1

Status: verified

Claim:

Under the FLSA, exempt employees are not entitled to overtime pay.

Sources:

- U.S. Department of Labor
  - Publisher: USDOL
  - URL: https://www.dol.gov/example

## Claim 2

Status: unsupported

Claim:

This headline number always means a raise.

Sources:

- _No linked sources_

# Facts to Verify

- Check salary floor — USDOL

# YouTube Metadata

Status: published

Video ID: dQw4w9WgXcQ

URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ

# Production Notes

Editorial Quality: 88
`;

const parsed = parseCobwArticleSourceMarkdown(sample);
assert.equal(parsed.evidence.length, 2);
assert.equal(parsed.evidence[0]?.status, 'verified');
assert.match(parsed.evidence[0]?.claim ?? '', /FLSA/);
assert.equal(parsed.evidence[1]?.status, 'unsupported');
assert.equal(
  normalizeCobwEvidenceStatusForGeneration(parsed.evidence[0]!.status),
  'supported',
);
assert.equal(
  normalizeCobwEvidenceStatusForGeneration(parsed.evidence[1]!.status),
  'unsupported',
);

console.log('test-cobw-article-source-parse: ok');
