import fs from 'node:fs';
import path from 'node:path';
import {
  CobwArticleSourceParseError,
  cobwSourcePreview,
  normalizeCobwEvidenceStatusForGeneration,
  parseCobwArticleSourceMarkdown,
} from '../src/lib/cobw-article-source.ts';

function usage(): void {
  console.log(`Usage: npm run verify:cobw-article-source -- <path-to-article-source.md>

Prints a human-readable parse report (evidence status + treat_as) to stdout.
No browser or DevTools required.`);
}

const fileArg = process.argv[2];
if (!fileArg || fileArg === '-h' || fileArg === '--help') {
  usage();
  process.exit(fileArg ? 0 : 1);
}

const abs = path.resolve(fileArg);
if (!fs.existsSync(abs)) {
  console.error(`File not found: ${abs}`);
  process.exit(1);
}

const markdown = fs.readFileSync(abs, 'utf8');

try {
  const source = parseCobwArticleSourceMarkdown(markdown);
  const preview = cobwSourcePreview(source);

  console.log('COBW Article Source — parse report');
  console.log('==================================');
  console.log(`File:     ${abs}`);
  console.log(`Title:    ${preview.title}`);
  console.log(`job_id:   ${preview.jobId}`);
  console.log(`Evidence: ${preview.evidenceCount} item(s)`);
  console.log(`Facts to verify: ${preview.factsToVerifyCount}`);
  console.log(`YouTube:  ${preview.youtubeOk ? 'ok' : 'missing'} ${preview.youtubeVideoId ?? ''}`);
  console.log('');

  if (!source.evidence.length) {
    console.log('(no evidence items parsed)');
  } else {
    for (const [i, item] of source.evidence.entries()) {
      const treatAs = normalizeCobwEvidenceStatusForGeneration(item.status);
      console.log(`--- Evidence ${i + 1}: ${item.title} ---`);
      console.log(`  status:    ${item.status}`);
      console.log(`  treat_as:  ${treatAs}`);
      console.log(`  claim:     ${item.claim.replace(/\s+/g, ' ').trim()}`);
      console.log('');
    }
  }

  console.log('Parse OK.');
} catch (err) {
  if (err instanceof CobwArticleSourceParseError) {
    console.error(`Parse error: ${err.message}`);
  } else {
    console.error(err);
  }
  process.exit(1);
}
