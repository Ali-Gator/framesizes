// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MODE_SCRIPT, modeOf } from "../mode";
import { ModeSwitch } from "../mode-switch";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ID = "abcdefghijklmnopabcdefghijklmnop";
const PATH = "/extensions/gallery-wall-layout-generator";
const win = globalThis as { chrome?: unknown };
const mode = () => document.documentElement.dataset.extMode;

let visibility: DocumentVisibilityState = "visible";
let host: HTMLDivElement;
let root: Root | undefined;

/** A fake extension answering each status message with the next `pinned` value (the last repeats). */
function fakeExtension(...pinned: boolean[]) {
  const send = vi.fn((_id: string, _message: unknown, reply: (answer: unknown) => void) => {
    const next = pinned.length > 1 ? pinned.shift() : pinned[0];
    reply({ installed: true, pinned: next, version: "0.1.0" });
  });
  win.chrome = { runtime: { sendMessage: send } };
  return send;
}

async function mount(url: string, extensionId = ID) {
  window.history.replaceState(null, "", url);
  const created = createRoot(host);
  root = created;
  await act(async () => created.render(<ModeSwitch extensionId={extensionId} />));
}

const wait = (ms: number) => act(async () => vi.advanceTimersByTimeAsync(ms));

beforeEach(() => {
  vi.useFakeTimers();
  visibility = "visible";
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => visibility });
  document.body.innerHTML = `
    <section id="pin"><h2 tabindex="-1">Pin it to your toolbar</h2></section>
    <div id="usage"><section><h2 tabindex="-1">What you can do in the side panel</h2></section></div>`;
  host = document.createElement("div");
  document.body.append(host);
});

afterEach(async () => {
  const mounted = root;
  if (mounted) await act(async () => mounted.unmount());
  root = undefined;
  delete win.chrome;
  vi.useRealTimers();
  window.history.replaceState(null, "", "/");
});

describe("modeOf and the pre-paint script", () => {
  const cases: [url: string, expected: string][] = [
    [`${PATH}?pinned=0`, "pin"],
    [`${PATH}?pinned=1`, "usage"],
    [PATH, "usage"],
    [`${PATH}#pin`, "pin"],
    [`${PATH}?pinned=0#usage`, "usage"],
    [`${PATH}?pinned=1#pin`, "pin"],
  ];

  /**
   * {@link openspec/specs/extension-site/spec.md#scenario-opened-after-install-with-the-button-not-pinned}
   * {@link openspec/specs/extension-site/spec.md#scenario-opened-after-install-with-the-button-pinned}
   * {@link openspec/specs/extension-site/spec.md#scenario-a-hash-beats-the-query}
   */
  it.each(cases)("reads %s as %s", (url, expected) => {
    window.history.replaceState(null, "", url);
    expect(modeOf(location.hash, location.search).mode).toBe(expected);
    delete document.documentElement.dataset.extMode;
    new Function(MODE_SCRIPT)();
    expect(mode()).toBe(expected);
  });
});

describe("ModeSwitch", () => {
  /** {@link openspec/specs/extension-site/spec.md#scenario-the-visitor-pins-the-button} */
  it("switches to usage within 2 seconds of a pinned reply and stops asking", async () => {
    const send = fakeExtension(false, true);
    await mount(`${PATH}?pinned=0`);
    expect(mode()).toBe("pin");
    expect(send).toHaveBeenCalledTimes(1);
    await wait(2000);
    expect(send).toHaveBeenCalledTimes(2);
    expect(mode()).toBe("usage");
    await wait(10_000);
    expect(send).toHaveBeenCalledTimes(2);
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-the-visitor-asked-for-the-pin-steps} */
  it("keeps a mode picked by the hash", async () => {
    const send = fakeExtension(true);
    await mount(`${PATH}#pin`);
    await wait(4000);
    expect(mode()).toBe("pin");
    expect(send).not.toHaveBeenCalled();
  });

  /** {@link openspec/specs/extension-site/spec.md#requirement-pin-mode-switches-itself-once-the-button-is-pinned} */
  it("asks nothing without a store id", async () => {
    const send = fakeExtension(true);
    await mount(`${PATH}?pinned=0`, "");
    await wait(6000);
    expect(mode()).toBe("pin");
    expect(send).not.toHaveBeenCalled();
  });

  /** {@link openspec/specs/extension-site/spec.md#requirement-pin-mode-switches-itself-once-the-button-is-pinned} */
  it("asks nothing while the tab is hidden, then resumes", async () => {
    visibility = "hidden";
    const send = fakeExtension(true);
    await mount(`${PATH}?pinned=0`);
    await wait(6000);
    expect(send).not.toHaveBeenCalled();
    expect(mode()).toBe("pin");
    visibility = "visible";
    await wait(2000);
    expect(send).toHaveBeenCalledTimes(1);
    expect(mode()).toBe("usage");
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-from-usage-mode-to-the-pin-steps} */
  it("moves focus to the pin heading when the hash turns to #pin", async () => {
    await mount(`${PATH}?pinned=1`);
    expect(mode()).toBe("usage");
    window.history.pushState(null, "", `${PATH}?pinned=1#pin`);
    await act(async () => window.dispatchEvent(new HashChangeEvent("hashchange")));
    expect(mode()).toBe("pin");
    expect(document.activeElement?.textContent).toBe("Pin it to your toolbar");
    window.history.pushState(null, "", `${PATH}?pinned=1#usage`);
    await act(async () => window.dispatchEvent(new HashChangeEvent("hashchange")));
    expect(mode()).toBe("usage");
    expect(document.activeElement?.textContent).toBe("What you can do in the side panel");
  });

  /** {@link openspec/specs/extension-site/spec.md#requirement-pin-mode-switches-itself-once-the-button-is-pinned} */
  it("polls again when Back clears the hash and the query says pin", async () => {
    const send = fakeExtension(false);
    await mount(`${PATH}?pinned=0`);
    window.history.pushState(null, "", `${PATH}?pinned=0#usage`);
    await act(async () => window.dispatchEvent(new HashChangeEvent("hashchange")));
    expect(mode()).toBe("usage");
    await wait(4000);
    expect(send).toHaveBeenCalledTimes(1);
    const focused = document.activeElement;
    window.history.pushState(null, "", `${PATH}?pinned=0`);
    await act(async () => window.dispatchEvent(new HashChangeEvent("hashchange")));
    expect(mode()).toBe("pin");
    expect(document.activeElement).toBe(focused);
    expect(send).toHaveBeenCalledTimes(2);
    fakeExtension(true);
    await wait(2000);
    expect(mode()).toBe("usage");
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-the-visitor-pins-the-button} */
  it("carries focus from the pin section to the usage heading when it switches itself", async () => {
    fakeExtension(false, true);
    document.querySelector<HTMLElement>("#pin h2")?.focus();
    await mount(`${PATH}?pinned=0`);
    await wait(2000);
    expect(mode()).toBe("usage");
    expect(document.activeElement?.textContent).toBe("What you can do in the side panel");
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-the-address-after-the-self-switch} */
  it("drops pinned from the address when it switches itself, without a history entry", async () => {
    fakeExtension(false, true);
    await mount(`${PATH}?pinned=0&utm_source=store`);
    const entries = history.length;
    await wait(2000);
    expect(mode()).toBe("usage");
    expect(location.search).toBe("?utm_source=store");
    expect(history.length).toBe(entries);
  });

  it("clears the mode when it leaves the page", async () => {
    await mount(`${PATH}?pinned=0`, "");
    expect(mode()).toBe("pin");
    const mounted = root;
    root = undefined;
    await act(async () => mounted?.unmount());
    expect(mode()).toBeUndefined();
  });
});
