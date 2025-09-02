import { defineConfig, devices } from '@playwright/test';

// Use BASE_URL and APP_VERSION to target your running server and asset version.
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const APP_VERSION = process.env.APP_VERSION || '20250825-06';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `${BASE_URL}/index.html?v=${APP_VERSION}&nosw`,
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
