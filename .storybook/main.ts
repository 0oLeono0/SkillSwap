import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const rootDir = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-backgrounds',
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': resolve(rootDir, '../src'),
      'react-native$': 'react-native-web',
    };
    return config;
  },
};

export default config;
