/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  darkMode: "selector",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        accent: "hsl(var(--theme-accent) / <alpha-value>)",
        "accent-2": "hsl(var(--theme-accent-2) / <alpha-value>)",
        bgColor: "hsl(var(--theme-bg) / <alpha-value>)",
        link: "hsl(var(--theme-link) / <alpha-value>)",
        quote: "hsl(var(--theme-quote) / <alpha-value>)",
        textColor: "hsl(var(--theme-text) / <alpha-value>)",
        header: "hsl(var(--theme-header) / <alpha-value>)",
        "header-2": "hsl(var(--theme-header-2) / <alpha-value>)",
      },
      animation: {
        flip: "flip 6s infinite steps(2, end)",
        rotate: "rotate 3s linear infinite both",
        shimmer: "shimmer 8s infinite",
      },
      keyframes: {
        flip: {
          to: {
            transform: "rotate(360deg)",
          },
        },
        rotate: {
          to: {
            transform: "rotate(90deg)",
          },
        },
        shimmer: {
          "0%, 90%, 100%": {
            "background-position": "calc(-100% - var(--shimmer-width)) 0",
          },
          "30%, 60%": {
            "background-position": "calc(100% + var(--shimmer-width)) 0",
          },
        },
      },
      scale: ["group-a-hover"],
      fontFamily: {
        sans: ['"Montserrat"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    function ({ addVariant }) {
      addVariant("group-a-hover", ".group-a:hover &");
    },
  ],
};
