import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  outputDir: "test-results/playwright",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "test-results/.auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: [/auth\.setup\.ts/, /admin\.spec\.ts/],
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 7"],
        storageState: "test-results/.auth/user.json",
      },
      dependencies: ["setup"],
      testMatch: /responsive\.spec\.ts/,
    },
    {
      name: "admin-chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "test-results/.auth/admin.json",
      },
      dependencies: ["setup"],
      testMatch: /admin\.spec\.ts/,
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "test-results/.auth/user.json",
      },
      dependencies: ["setup"],
      testMatch: /public\.spec\.ts/,
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        storageState: "test-results/.auth/user.json",
      },
      dependencies: ["setup"],
      testMatch: /public\.spec\.ts/,
    },
  ],
});
