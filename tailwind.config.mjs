/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cosmic: {
          bg: '#000814',
          accent: '#001d3d',
          glow: '#003566',
        }
      },
    },
  },
  plugins: [],
}