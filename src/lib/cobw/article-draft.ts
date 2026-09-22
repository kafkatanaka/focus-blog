import type { CobwLocalIdea, CobwSharedEvidence } from './types';

const SERIES = 'cost-of-being-wrong';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

function escapeYaml(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function paragraphFromPremise(premise: string, title: string): string {
  const trimmed = premise.trim();
  if (trimmed.length > 40) {
    return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
  }
  return `Most people assume they already understand ${title.toLowerCase()}. The expensive part is discovering—quietly—that the story you were using no longer matches reality.`;
}

function buildSections(idea: CobwLocalIdea): string {
  const hook = paragraphFromPremise(idea.sourcePremise, idea.sourceTitle);
  const category = idea.sourceCategory;

  return `${hook}

**The mistake is rarely stupidity. It is a confident model that stopped matching how ${category} actually works for knowledge workers.**

## What looks obvious (and isn't)

People reach for willpower, more information, or a better app. Those tools help at the margins, but they do not fix a structural mismatch between incentives, environment, and the outcome you are chasing.

When the default setup rewards the wrong behavior, "trying harder" mostly increases frustration without moving the needle.

## The mechanism

${idea.sourceTitle} usually comes from a chain of small decisions that each felt reasonable in isolation:

1. A shortcut that saved time today
2. A social signal that felt necessary
3. A rule of thumb that used to be true
4. A story about yourself that made the next step feel inevitable

None of these steps requires bad intent. That is why the cost stays hidden until it compounds.

## A concrete example

Imagine a month where income is stable, obligations are fixed, and every surprise expense gets absorbed by flexibility you do not actually have. On paper you are "fine." In practice you are one scheduling conflict away from reactive choices.

That gap—between looking okay and being resilient—is where ${idea.sourceTitle.toLowerCase()} lives.

## Evidence and patterns

Research on decision fatigue, lifestyle creep, and attention residue all point in the same direction: the system beats the hero moment. When environments nudge you toward short-term relief, long-term outcomes drift unless you redesign the defaults.

${formatEvidenceBlock([])}

## Why smart people miss it

High performers are especially vulnerable because they are used to winning with effort. If effort stops working, the reflex is to apply more effort—not to question the frame.

## Practical implications

You do not need a perfect plan. You need a smaller set of defaults that survive a bad week:

- Name the one variable that actually moves the outcome (not the one that feels productive)
- Remove a single recurring friction point instead of adding a new ritual
- Build a reversible experiment before making it part of your identity

## Conclusion

${idea.sourceTitle} is less about a dramatic failure than about tolerated drift. Catch the drift early, and the fix is boring—in a good way.

## Sources

_Add primary sources during review. COBW evidence packs can be merged here without copying video narration verbatim._
`;
}

export function formatEvidenceBlock(evidence: CobwSharedEvidence[]): string {
  if (!evidence.length) {
    return '_Evidence pack not attached yet—run Article Evidence Agent or import from COBW when available._';
  }
  return evidence
    .map((e) => `- **${e.title}**${e.publisher ? ` (${e.publisher})` : ''}: ${e.claim} [${e.url}](${e.url})`)
    .join('\n');
}

export function buildCobwArticleMarkdown(
  idea: CobwLocalIdea,
  options?: { draft?: boolean; evidence?: CobwSharedEvidence[] },
): { slug: string; markdown: string } {
  const draft = options?.draft ?? true;
  const articleTitle = idea.articleTitle ?? idea.sourceTitle;
  const seoTitle = idea.seoTitle ?? articleTitle;
  const description = idea.sourcePremise.trim().slice(0, 155);
  const slug = idea.articleSlug ?? `cobw-${slugify(idea.sourceTitle)}`;
  const pubDate = new Date();
  const pubIso = `${pubDate.getUTCFullYear()}-${String(pubDate.getUTCMonth() + 1).padStart(2, '0')}-01T00:00:00Z`;

  const youtubeUrl = idea.youtubeUrl ?? null;
  const youtubeId = idea.youtubeVideoId ?? null;

  const body = buildSections(idea).replace(
    formatEvidenceBlock([]),
    formatEvidenceBlock(options?.evidence ?? []),
  );

  const fm = [
    '---',
    `title: "${escapeYaml(articleTitle)}"`,
    `description: "${escapeYaml(description)}"`,
    `pubDate: ${pubIso}`,
    `category: ${idea.sourceCategory}`,
    'tags:',
    '  - decision-fatigue',
    '  - attention-management',
    '  - knowledge-worker',
    `draft: ${draft}`,
    'ads: true',
    'source_type: cobw',
    `cobw_id: ${idea.cobwId}`,
    `series: ${SERIES}`,
    `source_title: "${escapeYaml(idea.sourceTitle)}"`,
    `seo_title: "${escapeYaml(seoTitle)}"`,
    `youtube_url: ${youtubeUrl ? `"${escapeYaml(youtubeUrl)}"` : 'null'}`,
    `youtube_video_id: ${youtubeId ? `"${escapeYaml(youtubeId)}"` : 'null'}`,
    '---',
  ].join('\n');

  return { slug, markdown: `${fm}\n\n${body}\n` };
}

export function buildCobwWriterPrompt(idea: CobwLocalIdea, evidence: CobwSharedEvidence[] = []): string {
  return `Write a 1,200–2,000 word Focus Dividend article for COBW idea ${idea.cobwId}.

Source title: ${idea.sourceTitle}
Premise: ${idea.sourcePremise}
Category: ${idea.sourceCategory}
Series: ${SERIES}

Do NOT copy video narration. Write as a standalone article with intro, mechanism, example, evidence, why people get it wrong, practical implication, conclusion, and Sources.

Evidence (normalize, do not invent URLs):
${evidence.length ? formatEvidenceBlock(evidence) : '(none yet)'}
`;
}
