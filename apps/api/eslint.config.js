// @ts-check
import baseConfig from '../../packages/config/eslint.config.js';

// Extract the @typescript-eslint plugin from baseConfig to avoid importing it directly
const tsPlugin = baseConfig.find(cfg => cfg.plugins && cfg.plugins['@typescript-eslint'])?.plugins['@typescript-eslint'];

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    // NestJS-specific overrides
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
];
