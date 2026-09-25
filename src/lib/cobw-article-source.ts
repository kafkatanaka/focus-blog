import { parse as parseYaml } from 'yaml';

/** Matches at_her_cafe `cobw-article-source.ts` schema_version 1. */
export const COBW_ARTICLE_SOURCE_SCHEMA_VERSION = 1;

export interface CobwArticleSourceYoutube {
  url?: string | null;
  video_id?: string | null;
  title?: string | null;
  description?: string | null;
}

export interface CobwArticleSourceFrontmatter {
  schema_version: number;
  source: 'cobw';
  job_id: string;
  title: string;
  closing_phrase?: string | null;
  youtube?: CobwArticleSourceYoutube | null;
  created_at?: string | null;
}

export interface CobwEvidenceItem {
  id: string;
  title: string;
  status: string;
  claim: string;
  notes: string;
  raw: string;
}

export interface CobwFactToVerify {
  text: string;
}

export interface CobwArticleSource {
  frontmatter: CobwArticleSourceFrontmatter;
  editorialSummary: Record<string, string>;
  writerPlan: string;
  finalNarration: string;
  evidence: CobwEvidenceItem[];
  factsToVerify: CobwFactToVerify[];
  youtubeMetadata: Record<string, string>;
  productionNotes: string;
  rawMarkdown: string;
}

const REQUIRED_SECTIONS = [
  'Editorial Summary',
  'Writer Plan',
  'Final Narration',
  'Evidence',
  'Facts to Verify',
  'YouTube Metadata',
] as const;

export class CobwArticleSourceParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CobwArticleSourceParseError';
  }
}

function splitFrontmatter(markdown: string): { yaml: string; body: string } {
  const normalized = markdown.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    throw new CobwArticleSourceParseError('Markdown must start with YAML frontmatter (---)');
  }
  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) {
    throw new CobwArticleSourceParseError('Unclosed YAML frontmatter');
  }
  return {
    yaml: normalized.slice(4, end),
    body: normalized.slice(end + 5),
  };
}

function splitH1Sections(body: string): Map<string, string> {
  const sections = new Map<string, string>();
  const lines = body.split('\n');
  let current: string | null = null;
  const buf: string[] = [];

  const flush = () => {
    if (current !== null) {
      sections.set(current, buf.join('\n').trim());
    }
  };

  for (const line of lines) {
    const m = line.match(/^#\s+(.+?)\s*$/);
    if (m) {
      flush();
      current = m[1].trim();
      buf.length = 0;
    } else if (current !== null) {
      buf.push(line);
    }
  }
  flush();
  return sections;
}

function parseH2Subsections(sectionBody: string): Record<string, string> {
  const out: Record<string, string> = {};
  const lines = sectionBody.split('\n');
  let current: string | null = null;
  const buf: string[] = [];

  const flush = () => {
    if (current !== null) {
      out[current] = buf.join('\n').trim();
    }
  };

  for (const line of lines) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      flush();
      current = m[1].trim();
      buf.length = 0;
    } else if (current !== null) {
      buf.push(line);
    }
  }
  flush();
  return out;
}

function parseKeyValueBlock(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Za-z][A-Za-z0-9 _-]+):\s*(.+)$/);
    if (m) {
      out[m[1].trim()] = m[2].trim();
    }
  }
  return out;
}

function parseEvidenceSection(sectionBody: string): CobwEvidenceItem[] {
  const items: CobwEvidenceItem[] = [];
  const chunks = sectionBody.split(/\n(?=###\s+)/);

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const lines = trimmed.split('\n');
    const heading = lines[0].match(/^###\s+(.+)$/);
    const title = heading ? heading[1].trim() : `Evidence ${items.length + 1}`;
    const bodyLines = heading ? lines.slice(1) : lines;
    const body = bodyLines.join('\n').trim();
    const kv = parseKeyValueBlock(body);

    const status =
      kv.Status ??
      kv.status ??
      (body.match(/\bStatus:\s*(\S+)/i)?.[1] ?? 'unknown');

    const claim =
      kv.Claim ??
      kv.claim ??
      body.replace(/^Status:.*$/gim, '').trim().split('\n')[0]?.trim() ??
      title;

    items.push({
      id: `evidence-${items.length + 1}`,
      title,
      status: String(status),
      claim: String(claim),
      notes: body,
      raw: trimmed,
    });
  }

  if (!items.length && sectionBody.trim()) {
    items.push({
      id: 'evidence-1',
      title: 'Evidence',
      status: 'unknown',
      claim: sectionBody.trim().slice(0, 200),
      notes: sectionBody.trim(),
      raw: sectionBody.trim(),
    });
  }

  return items;
}

function parseFactsList(sectionBody: string): CobwFactToVerify[] {
  const facts: CobwFactToVerify[] = [];
  for (const line of sectionBody.split('\n')) {
    const m = line.match(/^\s*[-*]\s+(.+)$/);
    if (m && m[1].trim()) {
      facts.push({ text: m[1].trim() });
      continue;
    }
    const numbered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (numbered && numbered[1].trim()) {
      facts.push({ text: numbered[1].trim() });
    }
  }
  return facts;
}

function normalizeFrontmatter(data: unknown): CobwArticleSourceFrontmatter {
  if (!data || typeof data !== 'object') {
    throw new CobwArticleSourceParseError('Frontmatter must be a YAML object');
  }
  const fm = data as Record<string, unknown>;
  const schemaVersion = Number(fm.schema_version);
  if (schemaVersion !== COBW_ARTICLE_SOURCE_SCHEMA_VERSION) {
    throw new CobwArticleSourceParseError(
      `Unsupported schema_version ${String(fm.schema_version)} (expected ${COBW_ARTICLE_SOURCE_SCHEMA_VERSION})`,
    );
  }
  if (fm.source !== 'cobw') {
    throw new CobwArticleSourceParseError(`Expected source: cobw, got ${String(fm.source)}`);
  }
  const jobId = String(fm.job_id ?? '').trim();
  const title = String(fm.title ?? '').trim();
  if (!jobId) throw new CobwArticleSourceParseError('frontmatter.job_id is required');
  if (!title) throw new CobwArticleSourceParseError('frontmatter.title is required');

  let youtube: CobwArticleSourceYoutube | null = null;
  if (fm.youtube && typeof fm.youtube === 'object') {
    const y = fm.youtube as Record<string, unknown>;
    youtube = {
      url: y.url != null ? String(y.url) : null,
      video_id: y.video_id != null ? String(y.video_id) : null,
      title: y.title != null ? String(y.title) : null,
      description: y.description != null ? String(y.description) : null,
    };
  }

  return {
    schema_version: schemaVersion,
    source: 'cobw',
    job_id: jobId,
    title,
    closing_phrase: fm.closing_phrase != null ? String(fm.closing_phrase) : null,
    youtube,
    created_at: fm.created_at != null ? String(fm.created_at) : null,
  };
}

export function parseCobwArticleSourceMarkdown(markdown: string): CobwArticleSource {
  const { yaml, body } = splitFrontmatter(markdown);
  const parsedYaml = parseYaml(yaml);
  const frontmatter = normalizeFrontmatter(parsedYaml);
  const sections = splitH1Sections(body);

  for (const name of REQUIRED_SECTIONS) {
    if (!sections.has(name)) {
      throw new CobwArticleSourceParseError(`Missing required section: # ${name}`);
    }
  }

  const editorialSummary = parseH2Subsections(sections.get('Editorial Summary') ?? '');
  const writerPlan = sections.get('Writer Plan') ?? '';
  const finalNarration = sections.get('Final Narration') ?? '';
  const evidence = parseEvidenceSection(sections.get('Evidence') ?? '');
  const factsToVerify = parseFactsList(sections.get('Facts to Verify') ?? '');
  const youtubeMetadata = parseKeyValueBlock(sections.get('YouTube Metadata') ?? '');
  const productionNotes = sections.get('Production Notes') ?? '';

  return {
    frontmatter,
    editorialSummary,
    writerPlan,
    finalNarration,
    evidence,
    factsToVerify,
    youtubeMetadata,
    productionNotes,
    rawMarkdown: markdown,
  };
}

export function countNarrationWords(narration: string): number {
  return narration
    .replace(/[#*_`>\[\]()]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

export function extractYoutubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) return m[1];
  }
  return null;
}

export function cobwSourcePreview(source: CobwArticleSource) {
  const yt = source.frontmatter.youtube;
  const videoId =
    yt?.video_id?.trim() ||
    extractYoutubeVideoId(yt?.url) ||
    extractYoutubeVideoId(youtubeMetadataUrl(source));

  return {
    title: source.frontmatter.title,
    jobId: source.frontmatter.job_id,
    narrationWordCount: countNarrationWords(source.finalNarration),
    evidenceCount: source.evidence.length,
    factsToVerifyCount: source.factsToVerify.length,
    evidenceReviewRequired: source.factsToVerify.length > 0,
    closingPhrase: source.frontmatter.closing_phrase ?? '',
    youtubeOk: Boolean(videoId),
    youtubeVideoId: videoId,
    youtubeUrl: yt?.url ?? youtubeMetadataUrl(source),
  };
}

function youtubeMetadataUrl(source: CobwArticleSource): string | null {
  return (
    source.youtubeMetadata.URL ??
    source.youtubeMetadata.Url ??
    source.youtubeMetadata.url ??
    null
  );
}
