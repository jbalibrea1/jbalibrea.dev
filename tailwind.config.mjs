/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  darkMode: 'selector',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        accent: 'rgb(var(--theme-accent))',
        'accent-2': 'rgb(var(--theme-accent-2))',
        bgColor: 'rgb(var(--theme-bg))',
        'bgColor-2': 'rgb(var(--theme-bg-2))',
        link: 'rgb(var(--theme-link))',
        quote: 'rgb(var(--theme-quote))',
        textColor: 'rgb(var(--theme-text))',
        header: 'rgb(var(--theme-header))',
        'header-2': 'rgb(var(--theme-header-2))',
      },
      animation: {
        flip: 'flip 6s infinite steps(2, end)',
        rotate: 'rotate 3s linear infinite both',
        shimmer: 'shimmer 8s infinite',
      },
      keyframes: {
        flip: {
          to: {
            transform: 'rotate(360deg)',
          },
        },
        rotate: {
          to: {
            transform: 'rotate(90deg)',
          },
        },
        shimmer: {
          '0%, 90%, 100%': {
            'background-position': 'calc(-100% - var(--shimmer-width)) 0',
          },
          '30%, 60%': {
            'background-position': 'calc(100% + var(--shimmer-width)) 0',
          },
        },
      },
      scale: ['group-a-hover'],
      fontFamily: {
        sans: ['"Montserrat"', '"Poppins"', ...defaultTheme.fontFamily.sans],
        poppins: ["'Poppins'", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function ({ addVariant }) {
      addVariant('group-a-hover', '.group-a:hover &');
      addVariant('readed', '&.readed'); // Habilita `readed:text-input`
      addVariant('highlight', '&.highlight'); // Para `highlight:text-primary`
      addVariant('highlight-bg', '&.highlight-bg');
      addVariant('readed', '&.readed');
    },
  ],
};
