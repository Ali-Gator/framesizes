import posthog from "posthog-js";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("posthog-js", () => ({ default: { init: vi.fn() } }));

type Event = { event: string; properties: Record<string, unknown> } | null;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.mocked(posthog.init).mockClear();
});

/** Imports the module afresh with a dummy token, returning the config `posthog.init` got. */
async function startAnalytics() {
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_test_dummy");
  vi.resetModules();
  await import("../instrumentation-client");
  expect(posthog.init).toHaveBeenCalledOnce();
  return vi.mocked(posthog.init).mock.lastCall?.[1];
}

describe("instrumentation-client", () => {
  /** {@link openspec/specs/site-shell/spec.md#scenario-analytics-events-ask-for-no-location} */
  it("starts cookieless and asks PostHog for no location on every event", async () => {
    const config = await startAnalytics();
    expect(config?.cookieless_mode).toBe("always");

    const beforeSend = config?.before_send as (e: Event) => Event;
    expect(beforeSend).toBeTypeOf("function");
    expect(beforeSend({ event: "$pageview", properties: { $current_url: "/x" } })).toEqual({
      event: "$pageview",
      properties: { $current_url: "/x", $geoip_disable: true },
    });
    expect(beforeSend(null)).toBeNull();
  });
});
