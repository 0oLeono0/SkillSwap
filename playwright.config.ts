import { defineConfig } from 'playwright/test';

const ciFlag =
  typeof globalThis === 'object' &&
  globalThis !== null &&
  'process' in globalThis
    ? Boolean(
        (
          globalThis as {
            process?: { env?: { CI?: string } };
          }
        ).process?.env?.CI
      )
    : false;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 7_000
  },
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !ciFlag,
    timeout: 120_000
  }
});
