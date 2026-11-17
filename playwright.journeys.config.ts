import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test/e2e/journeys",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 2,
  timeout: 45_000,
  outputDir: "test-results/journeys",
  reporter: process.env.CI ? [["github"], ["html", { outputFolder: "playwright-report/journeys", open: "never" }]] : "list",
  use: { baseURL: "http://127.0.0.1:3212", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "node --import tsx --import ./src/test/e2e/fixtures/register.mjs src/test/e2e/fixtures/server.ts",
    url: "http://127.0.0.1:3212/__e2e_ready",
    reuseExistingServer: false,
    timeout: 90_000,
    env: { NODE_ENV: "development", COACH_PROVIDER: "fixtures", APP_ORIGIN: "http://127.0.0.1:3212",
      COACH_CLIENT_KEY_HEADER: "x-e2e-client", OPENAI_API_KEY: "", OPENAI_MODEL: "", NEXT_TELEMETRY_DISABLED: "1" },
  },
});
