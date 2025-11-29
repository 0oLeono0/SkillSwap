/* eslint-env node */

module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  overrides: [
    {
      files: ['tests/**/*.{ts,js}'],
      env: {
        jest: true,
      },
    },
  ],
};
