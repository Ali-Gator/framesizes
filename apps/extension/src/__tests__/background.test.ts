import { describe, expect, it } from "vitest";

import { type Api, onInstalled, onMessageExternal, onStartup } from "../background";

/** A fake `chrome` that records every call. */
function fake(pinned = false) {
  const calls: string[] = [];
  const api: Api = {
    sidePanel: {
      setPanelBehavior: async (b) => void calls.push(`panel ${b.openPanelOnActionClick}`),
    },
    action: { getUserSettings: async () => ({ isOnToolbar: pinned }) },
    tabs: { create: async ({ url }) => void calls.push(`tab ${url}`) },
    runtime: { getManifest: () => ({ version: "0.1.0" }) },
  };
  return { api, calls };
}

const HOW_TO = "https://framesizes.app/extensions/gallery-wall-layout-generator";
const SITE = { origin: "https://framesizes.app" };

describe("the service worker", () => {
  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-install-and-browser-start-set-the-panel-behaviour} */
  it("sets the panel to open on the toolbar button on install, update and start", async () => {
    for (const reason of ["install", "update", "chrome_update"]) {
      const { api, calls } = fake();
      await onInstalled(api, { reason });
      expect(calls[0]).toBe("panel true");
    }
    const { api, calls } = fake();
    await onStartup(api);
    expect(calls).toEqual(["panel true"]);
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-fresh-install-with-the-button-not-pinned} */
  it("opens one how-to tab with pinned=0 on a fresh install", async () => {
    const { api, calls } = fake(false);
    await onInstalled(api, { reason: "install" });
    expect(calls.filter((c) => c.startsWith("tab"))).toEqual([`tab ${HOW_TO}?pinned=0`]);
    const pinned = fake(true);
    await onInstalled(pinned.api, { reason: "install" });
    expect(pinned.calls).toContain(`tab ${HOW_TO}?pinned=1`);
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-an-update-opens-nothing} */
  it("opens no tab on an update", async () => {
    for (const reason of ["update", "chrome_update", "shared_module_update"]) {
      const { api, calls } = fake();
      await onInstalled(api, { reason });
      expect(calls.some((c) => c.startsWith("tab"))).toBe(false);
    }
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-the-how-to-page-asks-after-the-visitor-pins-the-button} */
  it("answers a status message from the site with the pinned state now", async () => {
    const { api } = fake(true);
    const answer = await new Promise((resolve) => {
      expect(onMessageExternal(api, { type: "status" }, SITE, resolve)).toBe(true);
    });
    expect(answer).toEqual({ installed: true, pinned: true, version: "0.1.0" });
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-an-unknown-message} */
  it("sends no reply to an unknown message or another origin", async () => {
    const { api } = fake();
    const replies: unknown[] = [];
    expect(onMessageExternal(api, { type: "hello" }, SITE, (a) => replies.push(a))).toBe(false);
    expect(onMessageExternal(api, null, SITE, (a) => replies.push(a))).toBe(false);
    expect(
      onMessageExternal(api, { type: "status" }, { origin: "https://evil.example" }, (a) =>
        replies.push(a),
      ),
    ).toBe(false);
    await Promise.resolve();
    expect(replies).toEqual([]);
  });
});
