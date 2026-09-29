/**
 * Lightweight frontmatter parser for Node scripts (matches analyze-articles.mjs).
 */
export function parseFrontmatter(content) {
  const m = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!m) return { fm: {}, body: content };
  const block = m[1];
  const body = m[2];
  const fm = {};

  const pickQuoted = (re) => {
    const match = block.match(re);
    if (!match) return undefined;
    return (match[1] ?? match[2] ?? match[3] ?? '').trim();
  };

  fm.title = pickQuoted(/^title:\s*(?:"([^"]*)"|'([^']*)'|(.+?))\s*$/m) ?? '';
  fm.description = pickQuoted(/^description:\s*(?:"([^"]*)"|'([^']*)'|(.+?))\s*$/m) ?? '';
  const catM = block.match(/^category:\s*(\S+)\s*$/m);
  if (catM) fm.category = catM[1];

  fm.pubDate = pickQuoted(/^pubDate:\s*(?:"([^"]*)"|'([^']*)'|(.+?))\s*$/m);
  fm.updatedDate = pickQuoted(/^updatedDate:\s*(?:"([^"]*)"|'([^']*)'|(.+?))\s*$/m);

  fm.draft = /draft:\s*true/.test(block);
  fm.ads = !/ads:\s*false/.test(block);

  const scalar = (key) => pickQuoted(new RegExp(`^${key}:\\s*(?:"([^"]*)"|'([^']*)'|(.+?))\\s*$`, 'm'));
  fm.articleType = scalar('articleType');
  fm.cluster = scalar('cluster');
  fm.hubId = scalar('hubId');
  fm.consolidationStatus = scalar('consolidationStatus');
  fm.duplicateGroup = scalar('duplicateGroup');
  fm.locale = scalar('locale');
  fm.isHub = /isHub:\s*true/.test(block);
  if (/indexable:\s*false/.test(block)) fm.indexable = false;
  if (/indexable:\s*true/.test(block)) fm.indexable = true;
  if (/inSitemap:\s*false/.test(block)) fm.inSitemap = false;
  if (/inSitemap:\s*true/.test(block)) fm.inSitemap = true;

  const tagsM = block.match(/^tags:\s*\n((?:\s+-\s*.+\n?)+)/m);
  fm.tags = tagsM
    ? tagsM[1]
        .split('\n')
        .map((l) => l.replace(/^\s*-\s*/, '').trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    : [];

  const relatedM = block.match(/^relatedArticleIds:\s*\n((?:\s+-\s*.+\n?)+)/m);
  fm.relatedArticleIds = relatedM
    ? relatedM[1]
        .split('\n')
        .map((l) => l.replace(/^\s*-\s*/, '').trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    : undefined;

  return { fm, body };
}

export function countWords(text) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_`[\]()>-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}
