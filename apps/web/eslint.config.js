// @ts-check
import baseConfig from '../../packages/config/eslint.config.js';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...baseConfig,
  {
    // Next.js-specific settings
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
