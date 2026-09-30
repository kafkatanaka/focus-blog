import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        /** UI fallbacks only; JA/EN body copy uses font-serif (Noto Serif JP on /jp). */
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      maxWidth: {
        readable: '42.5rem', // 680px
        editorial: '72rem', // 1152px — media home grid
      },
    },
  },
  plugins: [typography],
};
