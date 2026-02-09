import type { Root, Element } from 'hast';

const BOOK_IMAGES_PATH = '/images/books/';

/**
 * Rehype plugin: add class "book-cover" to img whose src contains /images/books/
 * so we can target them with CSS without relying on attribute selectors
 * (which may not apply correctly to slot content in Astro).
 */
export function rehypeBookCoverClass() {
  return (tree: Root) => {
    visit(tree);
  };

  function visit(node: Root | Element): void {
    if (node.type === 'element') {
      const el = node;
      if (el.tagName === 'img') {
        const src = el.properties?.src;
        if (typeof src === 'string' && src.includes(BOOK_IMAGES_PATH)) {
          el.properties = el.properties ?? {};
          const classes = ['book-cover'];
          const existingClass = el.properties.className ?? el.properties.class;
          if (Array.isArray(existingClass)) {
            classes.unshift(...existingClass);
          } else if (existingClass && typeof existingClass === 'string') {
            classes.unshift(existingClass);
          }
          el.properties.className = classes;
          el.properties.class = classes;
        }
      }
      for (const child of el.children) {
        if (child.type === 'element') visit(child);
      }
      return;
    }
    if (node.type === 'root') {
      for (const child of node.children) {
        if (child.type === 'element') visit(child);
      }
    }
  }
}
