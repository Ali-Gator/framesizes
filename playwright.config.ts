import { defineConfig } from "@playwright/test";

// CI builds and serves the app (`pnpm build && pnpm start`); locally, `pnpm dev` compiles on demand.
const PREBUILT = !!process.env.CI;
// Its own ports, never a developer's live server.
const PORT = 3100;
// The same app built with a dummy analytics token, for e2e/analytics.spec.ts; `/ingest` is stubbed there.
const ANALYTICS_PORT = 3101;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: PREBUILT,
  retries: PREBUILT ? 0 : 1,
  workers: PREBUILT ? undefined : 2,
  reporter: PREBUILT ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: PREBUILT ? "retain-on-failure" : "off",
  },
  webServer: [
    {
      command: PREBUILT ? "pnpm build && pnpm start" : "pnpm dev",
      port: PORT,
      reuseExistingServer: false,
      timeout: PREBUILT ? 300_000 : 60_000,
      stdout: PREBUILT ? "pipe" : "ignore",
      // Empty, not unset: an empty value wins over apps/web/.env.local, so tests never send real events.
      env: { PORT: String(PORT), NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: "" },
    },
    {
      command: PREBUILT ? "pnpm build && pnpm start" : "pnpm dev",
      port: ANALYTICS_PORT,
      reuseExistingServer: false,
      timeout: PREBUILT ? 300_000 : 60_000,
      stdout: PREBUILT ? "pipe" : "ignore",
      env: {
        PORT: String(ANALYTICS_PORT),
        NEXT_DIST_DIR: ".next-analytics",
        NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: "phc_e2e_dummy",
      },
    },
  ],
});
