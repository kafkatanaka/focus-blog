import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const blogDir = fileURLToPath(new URL('../src/content/blog/', import.meta.url));

/** Editorial IDs → live /jp/... paths (only published articles). */
const HREF_BY_ID = {
  'jp-money-001': '/jp/money/understand-money-anxiety',
  'jp-money-002': '/jp/money/three-numbers-to-review-your-budget',
  'jp-money-003': '/jp/money/before-you-start-investing',
  'jp-money-004': '/jp/money/what-can-you-ask-a-financial-planner',
  'jp-money-005': '/jp/money/increase-income-or-cut-expenses',
  'jp-money-006': '/jp/money/how-beginners-choose-a-brokerage',
  'jp-work-005': '/jp/work/salary-or-work-style',
};

const pendingRe =
  /<!-- INTERNAL_LINK_PENDING: ([\w-]+) -->\n→ (.+)/g;

let changedFiles = 0;
for (const name of fs.readdirSync(blogDir)) {
  if (!name.endsWith('.md')) continue;
  const filePath = path.join(blogDir, name);
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = original.replace(pendingRe, (full, id, title) => {
    const href = HREF_BY_ID[id];
    if (!href) return full;
    return `[${title.trim()}](${href})`;
  });
  if (updated !== original) {
    fs.writeFileSync(filePath, updated);
    changedFiles += 1;
  }
}

console.log(`Updated ${changedFiles} file(s).`);
