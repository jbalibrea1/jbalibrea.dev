import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  { ignores: ['worker/**', 'dist/**', '.astro/**'] },
  ...eslintPluginAstro.configs['jsx-a11y-recommended'],
  {
    rules: {
      'no-console': 'error',
    },
  },
];
