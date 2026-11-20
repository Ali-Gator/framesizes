// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { askExtension, EXTENSION_ID, STORE_URL, storeUrl } from "../extension";
import { page } from "../site-map";

const ID = "abcdefghijklmnopabcdefghijklmnop";

type Reply = (answer?: unknown) => void;
type Chrome = { runtime?: { sendMessage?: unknown; lastError?: { message: string } } };
const win = globalThis as { chrome?: Chrome };

/** A fake `chrome.runtime` whose `sendMessage` answers through `respond`. */
function fakeChrome(respond: (reply: Reply, runtime: NonNullable<Chrome["runtime"]>) => void) {
  const runtime: NonNullable<Chrome["runtime"]> = {};
  const sendMessage = vi.fn((_id: string, _message: unknown, reply: Reply) =>
    respond(reply, runtime),
  );
  runtime.sendMessage = sendMessage;
  win.chrome = { runtime };
  return sendMessage;
}

afterEach(() => {
  delete win.chrome;
  vi.useRealTimers();
});

/** {@link openspec/specs/extension-site/spec.md#scenario-the-go-live-gate} */
describe("the go-live gate", () => {
  it("has the extension page live exactly when the store id is set", () => {
    expect(page("X1").live).toBe(EXTENSION_ID !== "");
  });

  it("takes only a 32-letter id from a to p", () => {
    if (EXTENSION_ID !== "") expect(EXTENSION_ID).toMatch(/^[a-p]{32}$/);
    expect(STORE_URL).toBe(storeUrl(EXTENSION_ID));
    expect(storeUrl(ID)).toBe(`https://chromewebstore.google.com/detail/${ID}`);
  });
});

describe("askExtension", () => {
  /** {@link openspec/specs/extension-site/spec.md#scenario-the-extension-replies} */
  it("resolves to installed with the pinned value the extension sends", async () => {
    const send = fakeChrome((reply) => reply({ installed: true, pinned: false, version: "0.1.0" }));
    await expect(askExtension(ID)).resolves.toEqual({ installed: true, pinned: false });
    expect(send).toHaveBeenCalledWith(ID, { type: "status" }, expect.any(Function));
    fakeChrome((reply) => reply({ installed: true, pinned: true, version: "0.1.0" }));
    await expect(askExtension(ID)).resolves.toEqual({ installed: true, pinned: true });
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-no-extension} */
  describe("without an extension that answers", () => {
    beforeEach(() => vi.useFakeTimers());

    it("is not installed when the browser has no chrome", async () => {
      await expect(askExtension(ID)).resolves.toEqual({ installed: false });
    });

    it("is not installed when chrome has no sendMessage", async () => {
      win.chrome = { runtime: {} };
      await expect(askExtension(ID)).resolves.toEqual({ installed: false });
      win.chrome = {};
      await expect(askExtension(ID)).resolves.toEqual({ installed: false });
    });

    it("is not installed when the call throws", async () => {
      fakeChrome(() => {
        throw new Error("Invalid extension id");
      });
      await expect(askExtension(ID)).resolves.toEqual({ installed: false });
    });

    it("is not installed when the call sets lastError", async () => {
      fakeChrome((reply, runtime) => {
        runtime.lastError = { message: "Could not establish connection." };
        reply(undefined);
        delete runtime.lastError;
      });
      await expect(askExtension(ID)).resolves.toEqual({ installed: false });
    });

    it("is not installed on a malformed reply", async () => {
      for (const answer of [undefined, null, "yes", { installed: true }, { pinned: "no" }]) {
        fakeChrome((reply) => reply(answer));
        await expect(askExtension(ID)).resolves.toEqual({ installed: false });
      }
    });

    it("is not installed when no reply comes within 1 second", async () => {
      fakeChrome(() => {});
      const answer = askExtension(ID);
      await vi.advanceTimersByTimeAsync(999);
      let settled = false;
      void answer.then(() => (settled = true));
      await Promise.resolve();
      expect(settled).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      await expect(answer).resolves.toEqual({ installed: false });
    });

    it("sends nothing for an empty id", async () => {
      const send = fakeChrome((reply) => reply({ installed: true, pinned: true }));
      await expect(askExtension("")).resolves.toEqual({ installed: false });
      expect(send).not.toHaveBeenCalled();
    });
  });
});
