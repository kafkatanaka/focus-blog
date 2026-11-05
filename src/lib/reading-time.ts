/** Rough reading time from raw Markdown. JA ≈ 500 chars/min, EN ≈ 230 words/min. */
export function readingMinutes(body: string, locale: 'en' | 'ja'): number {
  const text = body
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|-]/g, ' ');
  const n =
    locale === 'ja'
      ? text.replace(/\s/g, '').length / 500
      : text.split(/\s+/).filter(Boolean).length / 230;
  return Math.max(1, Math.round(n));
}
