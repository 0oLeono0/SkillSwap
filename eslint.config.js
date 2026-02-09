import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import storybook from 'eslint-plugin-storybook';

const storybookConfigs = storybook.configs?.['flat/recommended'] ?? [];

export default [
  {
    ignores: [
      'dist',
      'storybook-static',
      'backend/dist/**',
      'backend/scripts/**/*.d.ts',
      'backend/scripts/**/*.d.ts.map',
      'backend/scripts/**/*.js',
      'backend/scripts/**/*.js.map'
    ]
  },
  ...tseslint.configs.recommended,
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.vite.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ]
    }
  },
  {
    files: ['backend/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['backend/**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['backend/**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: [
      '**/__tests__/**/*.{ts,tsx,js,mjs,cjs}',
      '**/*.{test,spec}.{ts,tsx,js,mjs,cjs}',
      '**/__mocks__/**/*.{ts,tsx,js,mjs,cjs}'
    ],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    }
  },
  ...storybookConfigs
];
