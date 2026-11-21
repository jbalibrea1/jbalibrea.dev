import eslintPluginAstro from 'eslint-plugin-astro';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['worker/**', 'dist/**', '.astro/**', 'public/**'] },

  // Reglas de TypeScript solo para .ts/.tsx (los .astro usan su propio parser)
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),

  // Hooks de React en los componentes de las islas
  {
    files: ['**/*.{jsx,tsx}'],
    ...reactHooks.configs.flat.recommended,
  },

  ...eslintPluginAstro.configs['jsx-a11y-recommended'],
  {
    rules: {
      'no-console': 'error',
    },
  },
];
