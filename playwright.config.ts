import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60 * 1000,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:19006',
    headless: true,
  },
});
