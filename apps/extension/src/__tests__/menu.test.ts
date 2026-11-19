import { describe, expect, it } from "vitest";

import { MENU_ID, type MenuApi, onMenuClick, registerMenu, type TryIo } from "../background";
import type { TryRecord } from "../store";

const BLOB = new Blob(["png"], { type: "image/png" });
const CROP = new Blob(["crop"], { type: "image/png" });
const PAGE = {
  text: "Poster. Sizes: 24 x 36 in, 18 x 24 in.",
  title: "Blue Hour Print",
  rect: { x: 10, y: 20, w: 300, h: 400, dpr: 2 },
};
const INFO = {
  menuItemId: MENU_ID,
  frameId: 0,
  srcUrl: "https://cdn.shop.example/print.jpg",
  pageUrl: "https://www.shop.example/p/blue-hour",
};
const TAB = { id: 7, windowId: 3, title: "Blue Hour – Shop" };

/** A fake `chrome` and I/O that record every call, in order. */
function fake({
  page = PAGE as typeof PAGE | Error,
  fetched = BLOB as Blob | null,
  cropped = CROP as Blob | null,
} = {}) {
  const calls: string[] = [];
  const saved: TryRecord[] = [];
  const api: MenuApi = {
    contextMenus: {
      removeAll: async () => void calls.push("removeAll"),
      create: (props) => void calls.push(`create ${JSON.stringify(props)}`),
    },
    scripting: {
      executeScript: (injection) => {
        calls.push(`inject ${injection.target.tabId} ${injection.target.frameIds?.join()}`);
        return page instanceof Error ? Promise.reject(page) : Promise.resolve([{ result: page }]);
      },
    },
    tabs: {
      captureVisibleTab: (windowId) => {
        calls.push(`capture ${windowId}`);
        return Promise.resolve("data:image/png;base64,AAAA");
      },
    },
    sidePanel: {
      open: ({ windowId }) => {
        calls.push(`open ${windowId}`);
        return Promise.resolve();
      },
    },
  };
  const io: TryIo = {
    fetchImage: async (url) => {
      calls.push(`fetch ${url}`);
      return fetched;
    },
    crop: async (_shot, rect) => {
      calls.push(`crop ${rect.w * rect.dpr}x${rect.h * rect.dpr}`);
      return cropped;
    },
    saveTry: async (record) => {
      saved.push(record);
    },
    ping: () => calls.push("ping"),
  };
  return { api, io, calls, saved };
}

/** {@link openspec/specs/gallery-wall-extension/spec.md#requirement-right-clicking-an-image-offers-try-on-my-wall} */
describe("the Try on my wall menu", () => {
  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-the-menu-item-on-an-image} */
  it("is one item on images on http and https pages, made again on every install", async () => {
    const { api, calls } = fake();
    await registerMenu(api);
    expect(calls).toEqual([
      "removeAll",
      `create ${JSON.stringify({
        id: "try-on-my-wall",
        title: "Try on my wall",
        contexts: ["image"],
        documentUrlPatterns: ["http://*/*", "https://*/*"],
      })}`,
    ]);
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-choosing-it-opens-the-panel-on-the-print} */
  it("opens the panel inside the click, before anything is awaited", async () => {
    const { api, io, calls } = fake();
    const done = onMenuClick(api, io, INFO, TAB);
    // Synchronously, before the first await settles: the read, the capture and the open.
    expect(calls).toEqual(["inject 7 0", "capture 3", "open 3"]);
    await done;
    expect(calls.slice(3)).toEqual([`fetch ${INFO.srcUrl}`, "ping"]);
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-try-keeps-only-what-the-panel-shows} */
  it("stores the picture, title, host and sizes, and no page text", async () => {
    const { api, io, saved } = fake();
    await onMenuClick(api, io, INFO, TAB);
    expect(saved).toHaveLength(1);
    const record = saved[0];
    expect(Object.keys(record ?? {}).sort()).toEqual(
      ["host", "id", "image", "sizes", "title", "v"].sort(),
    );
    expect(record).toMatchObject({
      v: 1,
      image: BLOB,
      title: "Blue Hour Print",
      host: "www.shop.example",
    });
    expect(record?.sizes.map((s) => s.label)).toEqual(["24 × 36 in", "18 × 24 in"]);
    expect(JSON.stringify(record)).not.toContain("Poster.");
  });

  it("crops the screenshot when the fetch fails, and keeps no picture when both fail", async () => {
    const crop = fake({ fetched: null });
    await onMenuClick(crop.api, crop.io, INFO, TAB);
    expect(crop.calls).toContain("crop 600x800");
    expect(crop.saved[0]?.image).toBe(CROP);

    const none = fake({ fetched: null, cropped: null });
    await onMenuClick(none.api, none.io, INFO, TAB);
    expect(none.saved[0]?.image).toBeNull();
  });

  it("captures nothing for an image in a subframe", async () => {
    const { api, io, calls, saved } = fake({ fetched: null });
    await onMenuClick(api, io, { ...INFO, frameId: 4 }, TAB);
    expect(calls).toContain("inject 7 4");
    expect(calls.some((c) => c.startsWith("capture") || c.startsWith("crop"))).toBe(false);
    expect(saved[0]?.image).toBeNull();
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-page-that-cannot-be-read} */
  it("still opens a try with no sizes and the tab's title when the page cannot be read", async () => {
    const { api, io, calls, saved } = fake({ page: new Error("Cannot access contents") });
    await onMenuClick(api, io, INFO, TAB);
    expect(calls).toContain("open 3");
    expect(saved[0]).toMatchObject({ sizes: [], title: "Blue Hour – Shop", image: BLOB });
  });

  it("ignores another menu item", async () => {
    const { api, io, calls } = fake();
    await onMenuClick(api, io, { ...INFO, menuItemId: "other" }, TAB);
    expect(calls).toEqual([]);
  });
});
