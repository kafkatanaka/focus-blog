/**
 * Fix internal links in pillar/framework MD content for Astro site.
 * - Articles are at /{slug} (no category prefix)
 * - Pillar pages stay at /category/pillar-slug (no trailing slash)
 * - Framework stays at /framework
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PILLAR_SLUGS = [
  'attention-management-guide',
  'sustainable-productivity-guide',
  'intentional-money-guide',
  'behavior-design-guide',
];

// Guide link path → actual blog slug (when different)
const SLUG_ALIASES = {
  'focus-cost-decision-fatigue': 'focus-cost-of-decision-fatigue',
  'focus-problems-decision-problems': 'focus-problems-are-decision-problems',
  'focus-requires-saying-no': 'focus-saying-no',
  'design-day-protects-attention': 'protect-attention-daily-design',
  'what-deep-work-requires': 'what-deep-work-actually-requires',
  'focus-friendly-workspace': 'focus-friendly-workspace-budget',
  'remote-work-changes-motivation': 'work-remote-changes-motivation',
  'focus-collaborative-environments': 'protect-focus-collaborative-environments',
  'focus-cost-slack-messages': 'focus-cost-of-constant-messages',
  'walking-meetings-improve-thinking': 'walking-meetings',
  'video-calls-more-draining': 'video-call-fatigue',
  'money-problems-attention-problems': 'money-problems-are-often-attention-problems',
  'sleep-and-focus': 'sleep-focus-relationship',
  'caffeine-affects-focus': 'caffeine-focus-science',
  'productivity-tools-make-focus-harder': 'productivity-tools-destroy-focus',
  'focus-tools-that-matter': 'focus-tools-that-actually-matter',
  'anxiety-masquerades-distraction': 'anxiety-masquerades-as-distraction',
  'focus-impact-chronic-stress': 'stress-focus-impact',
  'focus-chronic-pain-health': 'focus-with-chronic-pain',
  'focus-deteriorates-with-age': 'focus-aging',
  'focus-during-life-transitions': 'protect-focus-life-transitions',
  'best-focus-apps': 'best-focus-apps-ranked',
  'best-distraction-blocking-software': 'distraction-blocking-software',
  'best-time-blocking-apps': 'time-blocking-apps-comparison',
  'best-note-taking-apps': 'note-taking-apps-deep-work',
  'best-desk-setups': 'desk-setup-concentration',
  'best-books-focus-attention': 'best-focus-attention-books-beginners',
  'difference-busy-focused': 'busy-versus-focused',
  'busyness-career-trap': 'why-busyness-is-career-trap',
  'tradeoff-time-energy': 'trade-off-time-energy-work',
  'work-life-balance-unreachable': 'work-life-balance-unreachable',
  'rest-and-focus': 'rest-and-focus',
  'cost-not-taking-vacation': 'career-cost-not-taking-vacation',
  'sabbaticals-more-than-breaks': 'sabbatical-depth',
  'career-doesnt-break-you': 'career-that-doesnt-break-you',
  'job-feels-harder': 'why-your-job-feels-harder-than-it-should',
  'time-leave-job': 'recognize-time-to-leave-job',
  'promotions-feel-empty': 'promotion-emptiness',
  'recover-career-burnout': 'recover-from-career-burnout',
  'reliable-not-valuable': 'being-reliable-is-not-the-same-as-being-valuable',
  'visibility-over-impact': 'how-modern-work-rewards-visibility-over-impact',
  'cost-always-saying-yes': 'the-career-cost-of-always-saying-yes',
  'career-growth-leverage': 'career-growth-is-leverage',
  'boundaries-demanding-bosses': 'set-boundaries-demanding-bosses',
  'focus-problems-decision-problems': 'focus-problems-are-decision-problems',
  'financial-systems-reduce-willpower': 'financial-systems-reduce-willpower',
  'best-career-books': 'best-career-books-knowledge-workers',
  'best-project-management-tools': 'solo-project-management-tools-guide',
  'work-from-home-tools': 'wfh-tools-article',
  'money-stress-isnt-math': 'money-stress-isnt-about-math',
  'emotional-side-money': 'the-emotional-side-of-money-nobody-talks-about',
  'hidden-cost-financial-overthinking': 'hidden-cost-financial-overthinking',
  'money-decisions-drain-energy': 'money-decision-fatigue',
  'mental-load-managing-money': 'money-mental-load-managing',
  'good-habits-feel-harder': 'why-good-habits-feel-harder-than-bad-ones',
  'habits-fail-high-stress': 'how-habits-fail-in-stress',
  'habits-form-real-life': 'how-habits-really-form',
  '21-day-myth': 'the-science-behind-the-21-day-myth',
  'environment-beats-self-control': 'how-environment-beats-self-control',
  'discipline-vs-design': 'discipline-versus-design',
};

function fixLinks(content, options = {}) {
  const { keepCategoryPrefix = [] } = options; // pillar slugs to keep with category
  let out = content;

  // Remove trailing slashes from pillar and framework
  out = out.replace(/\/focus\/attention-management-guide\/?/g, '/focus/attention-management-guide');
  out = out.replace(/\/work\/sustainable-productivity-guide\/?/g, '/work/sustainable-productivity-guide');
  out = out.replace(/\/money\/intentional-money-guide\/?/g, '/money/intentional-money-guide');
  out = out.replace(/\/habits\/behavior-design-guide\/?/g, '/habits/behavior-design-guide');
  out = out.replace(/\/framework\/?/g, '/framework');

  // ](/category/slug/) → ](/slug) for articles (and apply aliases)
  for (const cat of ['focus', 'work', 'money', 'habits']) {
    const re = new RegExp(`\\]\\(/${cat}/([^)]+)/?\\)`, 'g');
    out = out.replace(re, (_, slug) => {
      if (PILLAR_SLUGS.includes(slug)) return `](/${cat}/${slug})`;
      const actual = SLUG_ALIASES[slug] || slug;
      return `](/${actual})`;
    });
  }

  return out;
}

const PILLAR_FRONTMATTER = {
  'attention-management-guide': {
    title: 'The Complete Guide to Attention Management',
    description: 'Comprehensive guide to focus and attention management for knowledge workers.',
  },
  'sustainable-productivity-guide': {
    title: 'Sustainable Productivity for Knowledge Workers',
    description: 'Guide to productivity without burnout. Hub for Work category articles on career sustainability and leverage.',
  },
  'intentional-money-guide': {
    title: 'Intentional Money: Financial Decision-Making for Knowledge Workers',
    description: 'Guide to financial stress, decision-making, and systems. Hub for Money category articles.',
  },
  'behavior-design-guide': {
    title: 'Behavior Design: Building Habits That Last',
    description: 'Guide to habit formation, environment design, and identity-based change. Hub for Habits category articles.',
  },
};

// Run from CLI: node scripts/pillar-link-fix.mjs < input.md > output.mdx
// Or: node scripts/pillar-link-fix.mjs input.md output.mdx [--frontmatter]
async function main() {
  if (process.argv[2] && process.argv[3]) {
    try {
      const inputPath = path.resolve(process.argv[2]);
      const outputPath = path.resolve(process.argv[3]);
      const addFrontmatter = process.argv[4] === '--frontmatter';
      let input = fs.readFileSync(inputPath, 'utf8');
      const out = fixLinks(input);
      const pillarSlug = path.basename(outputPath, '.mdx');
      const fm = addFrontmatter && PILLAR_FRONTMATTER[pillarSlug];
      const final = fm
        ? `---
layout: ../../layouts/FrameworkLayout.astro
title: "${(fm.title || '').replace(/"/g, '\\"')}"
description: "${(fm.description || '').replace(/"/g, '\\"')}"
---

${out}`
        : out;
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, final, 'utf8');
      console.log('Wrote', outputPath);
    } catch (e) {
      console.error('Error:', e.message);
      console.error(e.stack);
      process.exit(1);
    }
    return;
  }
  if (process.stdin.isTTY === false) {
    let input = '';
    process.stdin.setEncoding('utf8');
    for await (const chunk of process.stdin) input += chunk;
    process.stdout.write(fixLinks(input));
  } else {
    console.log('Usage: cat file.md | node scripts/pillar-link-fix.mjs > file.mdx');
    console.log('   or: node scripts/pillar-link-fix.mjs input.md output.mdx');
  }
}

main().catch((err) => {
  console.error(err.message || err);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});

export { fixLinks, SLUG_ALIASES };
