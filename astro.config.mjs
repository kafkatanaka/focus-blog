import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath } from 'node:url';
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export default defineConfig({
  site: 'https://focus.matomeyo.me',
  trailingSlash: 'never', // canonical を末尾スラッシュなしに統一
  integrations: [
    mdx(),
    sitemap({
      // Search Console がクロールする URL をサイトと一致させる（末尾スラッシュなし）
      serialize(item) {
        const url = item.url.endsWith('/') ? item.url.replace(/\/$/, '') : item.url;
        return { ...item, url };
      },
    }),
    tailwind(),
    // /sitemap.xml で sitemap-index を参照できるようにする（Search Console は sitemap.xml を登録することが多い）
    {
      name: 'copy-sitemap-xml',
      hooks: {
        'astro:build:done': ({ dir }) => {
          const outDir = fileURLToPath(dir);
          const src = join(outDir, 'sitemap-index.xml');
          const dest = join(outDir, 'sitemap.xml');
          if (existsSync(src)) copyFileSync(src, dest);
        },
      },
    },
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
