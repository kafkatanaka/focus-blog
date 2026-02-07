/**
 * Read pillar source MDs from pillar-sources/, apply fixLinks, write to src/pages with frontmatter.
 * Run: node scripts/write-pillars.mjs
 * Place source MDs in src/content/pillar-sources/ (see that folder's README.md).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fixLinks } from './pillar-link-fix.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'src/content/pillar-sources');

const PILLARS = [
  { src: 'sustainable-productivity-guide.md', out: 'src/pages/work/sustainable-productivity-guide.mdx', title: 'Sustainable Productivity for Knowledge Workers', description: 'Guide to productivity without burnout. Hub for Work category articles on career sustainability and leverage.' },
  { src: 'intentional-money-guide.md', out: 'src/pages/money/intentional-money-guide.mdx', title: 'Intentional Money: Financial Decision-Making for Knowledge Workers', description: 'Guide to financial stress, decision-making, and systems. Hub for Money category articles.' },
  { src: 'behavior-design-guide.md', out: 'src/pages/habits/behavior-design-guide.mdx', title: 'Behavior Design: Building Habits That Last', description: 'Guide to habit formation, environment design, and identity-based change. Hub for Habits category articles.' },
];

for (const p of PILLARS) {
  const inputPath = path.join(SOURCE_DIR, p.src);
  const outputPath = path.join(ROOT, p.out);
  const raw = fs.readFileSync(inputPath, 'utf8');
  const body = fixLinks(raw);
  const final = `---
layout: ../../layouts/FrameworkLayout.astro
title: "${(p.title || '').replace(/"/g, '\\"')}"
description: "${(p.description || '').replace(/"/g, '\\"')}"
---

${body}`;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, final, 'utf8');
  console.log('Wrote', p.out);
}
