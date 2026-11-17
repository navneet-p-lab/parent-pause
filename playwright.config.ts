import { defineConfig, devices } from "@playwright/test";

const port = 3210;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./src/test/e2e",
  testMatch: "shell.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: `npm run start -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
    // Shell checks never send coaching requests. Override local fixture/key
    // settings so the documented key-free setup can also test production UI.
    env: { NEXT_TELEMETRY_DISABLED: "1", COACH_PROVIDER: "openai", OPENAI_API_KEY: "", OPENAI_MODEL: "",
      APP_ORIGIN: baseURL, COACH_CLIENT_KEY_HEADER: "" },
  },
});
