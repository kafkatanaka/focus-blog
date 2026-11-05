import type { Root, Element, ElementContent, RootContent } from 'hast';

/**
 * Rehype plugin for article bodies:
 *  - a paragraph that is only one internal /jp/ link → "link card" (class="link-card")
 *
 * `<!-- CTA_SLOT: xxx -->` comments are left untouched here and replaced in
 * src/middleware.ts, so editing affiliate offers never depends on the markdown cache.
 */
export function rehypeEditorial() {
  return (tree: Root) => {
    walk(tree);
  };

  function walk(parent: Root | Element) {
    const children = parent.children as (RootContent | ElementContent)[];
    for (let i = 0; i < children.length; i++) {
      const node = children[i] as RootContent;

      if (node.type !== 'element') continue;

      if (node.tagName === 'p' && isLoneInternalLink(node)) {
        node.properties = { ...(node.properties ?? {}), className: ['link-card'] };
        const a = node.children.find((c) => c.type === 'element') as Element;
        const text = a.children;
        a.children = [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['link-card__label'] },
            children: [{ type: 'text', value: '関連記事' }],
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['link-card__title'] },
            children: text,
          },
        ];
        continue;
      }

      walk(node);
    }
  }
}

function isLoneInternalLink(p: Element): boolean {
  const meaningful = p.children.filter(
    (c) => !(c.type === 'text' && c.value.trim() === '')
  );
  if (meaningful.length !== 1) return false;
  const a = meaningful[0];
  if (a.type !== 'element' || a.tagName !== 'a') return false;
  const href = a.properties?.href;
  return typeof href === 'string' && href.startsWith('/jp/');
}
