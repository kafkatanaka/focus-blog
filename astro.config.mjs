import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import { rehypeBookCoverClass } from './src/lib/rehype-book-cover-class.ts';
import { rehypeEditorial } from './src/lib/rehype-editorial.ts';

export default defineConfig({
  site: 'https://focus-dividend.com',
  trailingSlash: 'never', // canonical を末尾スラッシュなしに統一
  integrations: [
    mdx(),
    tailwind(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
    rehypePlugins: [rehypeBookCoverClass, rehypeEditorial],
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
