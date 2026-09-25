import {
  AFFILIATE_DISCLOSURE_HTML,
  ARTICLE_RULES,
  buildFrontmatter,
  type ArticleCategory,
} from './article-rules';
import type { CobwArticleSource } from './cobw-article-source';
import { extractYoutubeVideoId } from './cobw-article-source';
import type { CobwGeneratedDraft } from './cobw-article-import';

export const OPENAI_API_KEY_STORAGE = 'focus-blog-openai-api-key';

export const COBW_VIDEO_PLACEHOLDER = '<!-- COBW_VIDEO -->';

const YOUTUBE_EMBED_HTML = (videoId: string) =>
  `<div class="aspect-video my-8">\n<iframe class="h-full w-full rounded-lg" src="https://www.youtube.com/embed/${videoId}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>\n</div>`;

function editorialBlock(source: CobwArticleSource): string {
  const lines = Object.entries(source.editorialSummary)
    .map(([k, v]) => `### ${k}\n${v.trim()}`)
    .join('\n\n');
  return lines || '(no editorial subsections)';
}

function evidenceBlock(source: CobwArticleSource): string {
  if (!source.evidence.length) return '(no evidence items)';
  return source.evidence
    .map((e) => `- [${e.status}] **${e.title}**: ${e.claim}\n${e.notes}`)
    .join('\n\n');
}

export function buildCobwWriterSystemPrompt(): string {
  return `You are a senior writer for The Focus Dividend (focus-dividend.com), an English blog for knowledge workers.

Write a standalone web article derived from a COBW (Cost of Being Wrong) episode export. The article must NOT read like a transcript or scene-by-scene retelling of the video narration.

Priority of truth (highest first):
1. Evidence section (only treat "supported" claims as external facts)
2. Final Narration (tone and angle, not structure to copy)
3. Editorial Summary fields

Rules:
- Target 1,200–1,800 words in the body (no YAML frontmatter in your JSON).
- Do NOT mirror the narration's scene structure or paragraph order.
- Do NOT present "unsupported" evidence claims as verified external facts.
- Include a "## Sources" section listing evidence-backed links where available.
- Body must NOT start with # H1 (title comes from metadata).
- Open with 2–4 short hook paragraphs, then insert the exact line ${COBW_VIDEO_PLACEHOLDER} on its own line, then continue the article.
- Use clear H2/H3 headings appropriate for a blog post.
- End with a concise takeaway; align with the closing phrase when provided.

Respond with JSON only (no markdown fences) matching:
{
  "title": "35-60 char H1 title",
  "seo_title": "optional alternate SEO title",
  "description": "120-160 char meta description",
  "category": "focus|work|money|habits",
  "tags": ["symptom-tag", "method-tag", "attribute-tag"],
  "body": "markdown body with ${COBW_VIDEO_PLACEHOLDER}"
}`;
}

export function buildCobwWriterUserPrompt(source: CobwArticleSource): string {
  const fm = source.frontmatter;
  return `COBW job_id: ${fm.job_id}
Source title: ${fm.title}
Closing phrase: ${fm.closing_phrase ?? '(none)'}

# Editorial Summary
${editorialBlock(source)}

# Writer Plan
${source.writerPlan.trim() || '(empty)'}

# Final Narration (do not copy structure)
${source.finalNarration.trim()}

# Evidence
${evidenceBlock(source)}

# Facts to Verify (editor must review — do not assert as fact)
${source.factsToVerify.map((f) => `- ${f.text}`).join('\n') || '(none)'}

# YouTube Metadata
${JSON.stringify(source.youtubeMetadata, null, 2)}
`;
}

export function injectCobwYoutubeEmbed(body: string, videoId: string | null): string {
  if (!videoId) {
    return body.replace(new RegExp(`\\s*${COBW_VIDEO_PLACEHOLDER}\\s*`, 'g'), '\n\n');
  }
  const embed = YOUTUBE_EMBED_HTML(videoId);
  if (body.includes(COBW_VIDEO_PLACEHOLDER)) {
    return body.replace(COBW_VIDEO_PLACEHOLDER, embed);
  }
  const paragraphs = body.split(/\n\n+/);
  const insertAt = Math.min(4, paragraphs.length);
  paragraphs.splice(insertAt, 0, embed);
  return paragraphs.join('\n\n');
}

export function resolveYoutubeVideoId(source: CobwArticleSource): string | null {
  const fromFm =
    source.frontmatter.youtube?.video_id?.trim() ||
    extractYoutubeVideoId(source.frontmatter.youtube?.url);
  if (fromFm) return fromFm;
  const metaUrl =
    source.youtubeMetadata.URL ??
    source.youtubeMetadata.Url ??
    source.youtubeMetadata.url;
  return extractYoutubeVideoId(metaUrl);
}

function parseTags(tags: unknown): [string, string, string] {
  if (!Array.isArray(tags) || tags.length < 3) {
    return ['decision-fatigue', 'attention-management', 'knowledge-worker'];
  }
  return [String(tags[0]), String(tags[1]), String(tags[2])];
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

export interface GenerateCobwArticleResult {
  draft: CobwGeneratedDraft;
  raw: unknown;
}

export async function generateCobwArticleFromSource(
  source: CobwArticleSource,
  apiKey: string,
): Promise<GenerateCobwArticleResult> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildCobwWriterSystemPrompt() },
        { role: 'user', content: buildCobwWriterUserPrompt(source) },
      ],
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error?.message ?? res.statusText;
    throw new Error(message);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('Empty response from OpenAI');
  }

  const parsed = JSON.parse(content) as Record<string, unknown>;
  const title = String(parsed.title ?? source.frontmatter.title).trim();
  const seoTitle = String(parsed.seo_title ?? title).trim();
  const description = String(parsed.description ?? '').trim();
  const category = String(parsed.category ?? 'focus') as ArticleCategory;
  const tags = parseTags(parsed.tags);
  let body = String(parsed.body ?? '').trim();
  const videoId = resolveYoutubeVideoId(source);
  body = injectCobwYoutubeEmbed(body, videoId);

  const draft: CobwGeneratedDraft = {
    title,
    seoTitle,
    description: description.slice(0, ARTICLE_RULES.description.max),
    slug: `cobw-${slugify(seoTitle || title)}`,
    category: ['focus', 'work', 'money', 'habits'].includes(category) ? category : 'focus',
    tags,
    body,
    generatedAt: new Date().toISOString(),
  };

  return { draft, raw: parsed };
}

export function buildCobwPublishedMarkdown(
  draft: CobwGeneratedDraft,
  source: CobwArticleSource,
  options?: { draft?: boolean; pubDate?: string },
): string {
  const pubDate =
    options?.pubDate ??
    `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}-01T00:00:00Z`;
  const videoId = resolveYoutubeVideoId(source);
  const youtubeUrl = source.frontmatter.youtube?.url ?? null;

  const baseFm = buildFrontmatter({
    title: draft.title,
    description: draft.description,
    pubDate,
    category: draft.category,
    tags: [...draft.tags],
    draft: options?.draft ?? false,
    ads: true,
  });

  const extra = [
    'source_type: cobw',
    `cobw_job_id: ${source.frontmatter.job_id}`,
    `source_title: "${source.frontmatter.title.replace(/"/g, '\\"')}"`,
    `seo_title: "${draft.seoTitle.replace(/"/g, '\\"')}"`,
    `youtube_url: ${youtubeUrl ? `"${youtubeUrl.replace(/"/g, '\\"')}"` : 'null'}`,
    `youtube_video_id: ${videoId ? `"${videoId}"` : 'null'}`,
  ].join('\n');

  const frontmatter = baseFm.replace(/\n---$/, `\n${extra}\n---`);
  return `${frontmatter}\n\n${draft.body.trim()}\n`;
}

export { YOUTUBE_EMBED_HTML, AFFILIATE_DISCLOSURE_HTML };
