import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        /** Editorial accent: deep green-teal (links, labels, CTA). */
        accent: {
          50: '#eef6f3',
          100: '#d5ebe3',
          200: '#a9d5c6',
          500: '#2f7d68',
          600: '#1f6a56',
          700: '#175544',
          800: '#123f33',
        },
        /** Warm paper tone for boxes and section backgrounds. */
        paper: {
          DEFAULT: '#faf8f4',
          dark: '#f2eee6',
        },
        ink: '#1b1f23',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        /** UI / headings. JA adds Noto Sans JP on /jp. */
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Hiragino Kaku Gothic ProN',
          'Noto Sans JP',
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
