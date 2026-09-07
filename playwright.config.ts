import { defineConfig, devices } from '@playwright/test';

const PORT = 4200;
const baseURL = `http://localhost:${PORT}`;

/**
 * End-to-end + accessibility tests. Runs against `ng serve` (dev config, so the
 * service worker is disabled and each spec gets a clean IndexedDB context).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
