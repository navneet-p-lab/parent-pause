import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test/presentational",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 2,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3211", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "npx vite --config vite.presentational.config.ts",
    url: "http://127.0.0.1:3211",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
