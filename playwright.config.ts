import { defineConfig, devices } from '@playwright/test';

const isProduction = process.env.TEST_MODE === 'production';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: isProduction ? 'http://localhost:4173' : 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    ...(isProduction
      ? []
      : [
          {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
          },
        ]),
  ],
  webServer: {
    command: isProduction
      ? 'npm run build && npx vite preview --host 127.0.0.1 --port 4173'
      : 'npm run dev -- --host 127.0.0.1 --port 3000',
    url: isProduction ? 'http://127.0.0.1:4173' : 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
});
