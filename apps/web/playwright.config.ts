import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for web E2E tests.
 * Tests run against the local dev server (port 3001).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Dev server must already be running (via ./start.sh)
  // webServer is omitted intentionally to avoid conflicts with the running server
});
