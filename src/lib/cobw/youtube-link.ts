/** Parse YouTube watch / youtu.be / embed URLs into a video id. */
export function parseYoutubeVideoId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && id.length === 11 ? id : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v');
        return id && id.length === 11 ? id : null;
      }
      const embed = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embed) return embed[1];
      const shorts = url.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shorts) return shorts[1];
    }
  } catch {
    return null;
  }
  return null;
}

export function canonicalYoutubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function escapeYamlDoubleQuoted(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** Update or insert youtube_url / youtube_video_id in article frontmatter. */
export function patchArticleYoutubeFields(
  markdown: string,
  youtubeUrl: string | null,
  youtubeVideoId: string | null,
): string {
  const m = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error('Article is missing YAML frontmatter');

  let block = m[1];
  const setLine = (key: string, lineValue: string) => {
    const re = new RegExp(`^${key}:.*$`, 'm');
    const line = `${key}: ${lineValue}`;
    block = re.test(block) ? block.replace(re, line) : `${block}\n${line}`;
  };

  if (youtubeUrl && youtubeVideoId) {
    setLine('youtube_url', escapeYamlDoubleQuoted(youtubeUrl));
    setLine('youtube_video_id', escapeYamlDoubleQuoted(youtubeVideoId));
  } else {
    setLine('youtube_url', 'null');
    setLine('youtube_video_id', 'null');
  }

  const rest = markdown.slice(m[0].length);
  return `---\n${block}\n---${rest}`;
}
