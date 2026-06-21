// @ts-check
import baseConfig from '../../packages/config/eslint.config.js';

const tsPlugin = baseConfig.find(cfg => cfg.plugins && cfg.plugins['@typescript-eslint'])?.plugins['@typescript-eslint'];

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    // Next.js-specific settings
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
