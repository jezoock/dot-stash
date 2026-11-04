// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['dist/', 'www/', 'loader/', '.stencil/', 'components/components.d.ts'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // `h` is the JSX factory: it must be imported even though the source never calls it.
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^h$' }],
    },
  },
  {
    // Unit tests run by Jest through `stencil test --spec` (the others import the Vitest functions they use).
    files: ['components/core/**/*.spec.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.jest },
    },
  },
  {
    // The configuration files and the build scripts, run by Node.
    files: ['*.mjs', '*.mts', 'scripts/**/*.mjs', 'stencil.config.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
);
