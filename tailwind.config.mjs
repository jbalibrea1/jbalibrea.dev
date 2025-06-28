/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  darkMode: 'selector',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        accent: 'oklch(var(--theme-accent) / <alpha-value>)',
        accentBg: 'oklch(var(--theme-accent-bg) / <alpha-value>)',
        'accent-2': 'oklch(var(--theme-accent-2) / <alpha-value>)',
        bgColor: 'oklch(var(--theme-bg) / <alpha-value>)',
        'bgColor-2': 'oklch(var(--theme-bg-2) / <alpha-value>)',
        link: 'oklch(var(--theme-link) / <alpha-value>)',
        quote: 'oklch(var(--theme-quote) / <alpha-value>)',
        textColor: 'oklch(var(--theme-text) / <alpha-value>)',
        header: 'oklch(var(--theme-header) / <alpha-value>)',
        'header-2': 'oklch(var(--theme-header-2) / <alpha-value>)',
        muted: 'oklch(var(--theme-muted) / <alpha-value>)',
        mutedfg: 'oklch(var(--theme-mutedfg) / <alpha-value>)',
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
        // Satoshi, Inter, Montserrat
        sans: ['"Satoshi"', '"Inter"', ...defaultTheme.fontFamily.sans],
        //Funnel display, Montserrat, parkinsans
        title: [
          '"Funnel Display"',
          '"Parkinsans"',
          ...defaultTheme.fontFamily.serif,
        ],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function ({ addVariant, addBase, theme }) {
      addBase({
        'h2,h3,h4,h5,h6': {
          scrollMarginTop: '3rem',
          fontWeight: '500',
        },
        'h1>a,h2>a,h3>a,h4>a,h5>a,h6>a': {
          marginInlineStart: '0.75rem',
          transition: 'opacity 0.2s ease',
          opacity: '1',
        },
        'h1>a:focus,h2>a:focus,h3>a:focus,h4>a:focus,h5>a:focus,h6>a:focus': {
          opacity: '1',
        },
        'h1:hover>a,h2:hover>a,h3:hover>a,h4:hover>a,h5:hover>a,h6:hover>a': {
          opacity: '1',
        },
        'h1:target>a,h2:target>a,h3:target>a,h4:target>a,h5:target>a,h6:target>a':
          {
            opacity: '1',
          },

        'blockquote:not([class*="admonition-"])': {
          position: 'relative',
          overflow: 'hidden',
          'border-width': '1px',
          'border-left': 'inherit',
          'border-radius': '10px',
          'padding-inline': '1.6rem',
          'border-color': theme('colors.muted'),
          'box-shadow': '0 5px 0 ' + theme('colors.muted'),
        },
        'blockquote:not([class*="admonition-"])::after': {
          color: theme('colors.mutedfg'),
          position: 'absolute',
          content: '"”"',
          top: '-0.9rem',
          right: '-0.2rem',
          'font-size': '10rem',
          transform: 'rotate(-15deg)',
          opacity: '0.1',
        },
        'code:not(pre code)': {
          'white-space': 'pre-wrap!important',
          'overflow-wrap': 'anywhere!important',
        },
      });
      addVariant('group-a-hover', '.group-a:hover &');
      addVariant('readed', '&.readed'); // Habilita `readed:text-input`
      addVariant('highlight', '&.highlight'); // Para `highlight:text-primary`
      addVariant('highlight-bg', '&.highlight-bg');
      addVariant('readed', '&.readed');
    },
  ],
};
