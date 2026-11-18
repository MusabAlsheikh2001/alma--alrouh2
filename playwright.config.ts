import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests',
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4351',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx ng serve --host 127.0.0.1 --port 4351',
    url: 'http://127.0.0.1:4351',
    reuseExistingServer: false,
    timeout: 60000,
  },
});
