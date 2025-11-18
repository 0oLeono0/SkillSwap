import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '^.+\\.(jpg|jpeg|png|gif|webp|avif)$': '<rootDir>/tests/__mocks__/fileMock.ts',
    '^.+\\.svg(\\?react)?$': '<rootDir>/tests/__mocks__/fileMock.ts',
  },
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.test.json', useESM: true },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testMatch: ['<rootDir>/src/**/*.(test|spec).{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/?(*.)+(stories|mock).{ts,tsx}',
    '!src/**/index.{ts,tsx}',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};

export default config;

