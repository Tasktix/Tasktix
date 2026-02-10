/**
 * Tasktix: A powerful and flexible task-tracking tool for all.
 * Copyright (C) 2025 Nate Baird & other Tasktix contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import headers from 'eslint-plugin-headers';
import _import from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';
import vitest from '@vitest/eslint-plugin';

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  tseslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    plugins: { import: _import, headers, 'unused-imports': unusedImports },

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: { impliedStrict: true },
        project: ['./tsconfig.json', './cypress/tsconfig.json']
      }
    },

    settings: { react: { version: 'detect' } },

    rules: {
      'no-console': 'error',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',

      'headers/header-format': [
        'error',
        {
          source: 'string',
          style: 'jsdoc',
          content:
            'Tasktix: A powerful and flexible task-tracking tool for all.\nCopyright (C) {year} Nate Baird & other Tasktix contributors\n\nThis program is free software: you can redistribute it and/or modify\nit under the terms of the GNU Affero General Public License as published\nby the Free Software Foundation, either version 3 of the License, or\n(at your option) any later version.\n\nThis program is distributed in the hope that it will be useful,\nbut WITHOUT ANY WARRANTY; without even the implied warranty of\nMERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\nGNU Affero General Public License for more details.\n\nYou should have received a copy of the GNU Affero General Public License\nalong with this program.  If not, see <https://www.gnu.org/licenses/>.',

          variables: {
            year: '2025'
          },

          trailingNewlines: 2
        }
      ],

      'import/order': [
        'error',
        {
          groups: [
            'type',
            'builtin',
            'object',
            'external',
            'internal',
            'parent',
            'sibling',
            'index'
          ],

          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before'
            }
          ],

          'newlines-between': 'always'
        }
      ],

      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var']
        }
      ],
      '@typescript-eslint/no-unsafe-assignment': 'warn', // Creating problems for Jest mocks
      '@typescript-eslint/no-unsafe-member-access': 'warn', // Creating problems for Jest mocks
      '@typescript-eslint/no-unsafe-argument': 'warn', // Creating problems for Jest mocks
      '@typescript-eslint/no-unsafe-return': 'warn', // Creating problems for Jest mocks
      '@typescript-eslint/no-unsafe-call': 'warn', // Creating problems for Jest mocks
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_.*?$'
        }
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error'
    }
  },
  {
    files: ['app/api/**/*.ts', 'lib/database/**/*.ts'],
    rules: {
      'no-console': 'off'  // Allow  console.log statements when running on server only
    }
  },
  {
    files: ['**/*.tsx'],

    rules: {
      'react/prop-types': 'off', // Using TypeScript for type checking
      'react/self-closing-comp': 'error',

      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true
        }
      ]
    }
  },
  {
    files: ['**/*.cjs', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked]
  },
  {
    files: ['**/*.test.ts'],
    ...vitest.configs.recommended
  },
  {
    ...prettier,
    rules: { ...prettier.rules, 'prettier/prettier': 'error' }
  },
  globalIgnores([
    'coverage/**',
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts'
  ])
]);
