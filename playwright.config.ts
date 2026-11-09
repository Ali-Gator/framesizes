import { defineConfig } from "@playwright/test";

// CI builds and serves the app (`pnpm build && pnpm start`); locally, `pnpm dev` compiles on demand.
const PREBUILT = !!process.env.CI;
// Its own port, never a developer's live server.
const PORT = 3100;

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
  webServer: {
    command: PREBUILT ? "pnpm build && pnpm start" : "pnpm dev",
    port: PORT,
    reuseExistingServer: false,
    timeout: PREBUILT ? 300_000 : 60_000,
    stdout: PREBUILT ? "pipe" : "ignore",
    env: { PORT: String(PORT) },
  },
});
