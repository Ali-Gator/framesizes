// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LanguagePicker } from "../language-picker";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const X1 = "/extensions/gallery-wall-layout-generator";
let pathname: string | null = X1;
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

let host: HTMLDivElement;
let root: Root | undefined;

// jsdom has no modal dialogs: open and close toggle `open` and fire `close`, as browsers do.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

async function mount(path: string | null, url = path ?? "/") {
  pathname = path;
  window.history.replaceState(null, "", url);
  const created = createRoot(host);
  root = created;
  await act(async () => created.render(<LanguagePicker />));
}

const trigger = () => host.querySelector<HTMLButtonElement>("button[aria-haspopup=dialog]");
const dialog = () => host.querySelector("dialog");
const links = () => [...host.querySelectorAll<HTMLAnchorElement>("dialog a")];
const shownNames = () =>
  links()
    .filter((a) => !a.closest("li")?.hidden)
    .map((a) => a.querySelector(".lp-name")?.textContent);

async function open() {
  await act(async () => trigger()?.click());
}

async function type(text: string) {
  const input = host.querySelector<HTMLInputElement>("dialog input");
  if (!input) throw new Error("no search field");
  // React tracks the value; set it through the native setter so onChange fires.
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  await act(async () => {
    setter?.call(input, text);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
});

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  host.remove();
});

describe("LanguagePicker", () => {
  /** {@link openspec/specs/localization/spec.md#scenario-opening-the-picker-on-the-russian-version} */
  it("opens a modal list of 28 links with Русский current and Deutsch pointing to its version", async () => {
    await mount(`/ru${X1}`);
    await open();
    expect(dialog()?.hasAttribute("open")).toBe(true);
    expect(trigger()?.getAttribute("aria-expanded")).toBe("true");
    expect(links()).toHaveLength(28);
    const current = links().filter((a) => a.getAttribute("aria-current") === "page");
    expect(current.map((a) => a.textContent)).toEqual(["Русский"]);
    const deutsch = links().find((a) => a.textContent === "Deutsch");
    expect(deutsch?.getAttribute("href")).toBe(`/de${X1}`);
    expect(deutsch?.getAttribute("hreflang")).toBe("de");
    expect(deutsch?.querySelector("[lang=de]")).not.toBeNull();
    expect(document.activeElement).toBe(host.querySelector("dialog input"));
  });

  /** {@link openspec/specs/localization/spec.md#scenario-closing-the-picker} */
  it("closes from the close button and gives focus back to the language button", async () => {
    await mount(`/ru${X1}`);
    await open();
    await act(async () => host.querySelector<HTMLButtonElement>(".lp-x")?.click());
    expect(dialog()?.hasAttribute("open")).toBe(false);
    expect(trigger()?.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger());
  });

  /** {@link openspec/specs/localization/spec.md#scenario-switching-from-the-pin-steps} */
  it("keeps ?pinned=0#pin on the link the visitor picks", async () => {
    await mount(X1, `${X1}?pinned=0#pin`);
    await open();
    const deutsch = links().find((a) => a.textContent === "Deutsch");
    // Stop jsdom's navigation; the href is what the browser would open.
    const stop = (event: Event) => event.preventDefault();
    window.addEventListener("click", stop);
    await act(async () => deutsch?.click());
    window.removeEventListener("click", stop);
    expect(deutsch?.getAttribute("href")).toBe(`/de${X1}?pinned=0#pin`);
  });

  /** {@link openspec/specs/localization/spec.md#scenario-searching-in-english-and-in-russian} */
  it("finds Русский by its English name and by its native name in capitals", async () => {
    await mount(`/ru${X1}`);
    await open();
    await type("russian");
    expect(shownNames()).toEqual(["Русский"]);
    await type("РУССКИЙ");
    expect(shownNames()).toEqual(["Русский"]);
  });

  /** {@link openspec/specs/localization/spec.md#scenario-diacritics-are-ignored} */
  it("ignores diacritics", async () => {
    await mount(X1);
    await open();
    await type("espanol");
    expect(shownNames()).toContain("Español");
  });

  /** {@link openspec/specs/localization/spec.md#scenario-both-portuguese-entries-match} */
  it("shows exactly the two Portuguese entries for 'port'", async () => {
    await mount(X1);
    await open();
    await type("port");
    expect(shownNames()).toEqual(["PortuguêsPortugal", "PortuguêsBrasil"]);
  });

  /** {@link openspec/specs/localization/spec.md#scenario-no-match} */
  it("shows no entry and the no-match line for an unknown language", async () => {
    await mount(X1);
    await open();
    expect(host.querySelector("[role=status]")?.textContent).toBe("");
    await type("klingon");
    expect(shownNames()).toEqual([]);
    expect(host.querySelector("[role=status]")?.textContent).toContain("No language found");
  });

  /** {@link openspec/specs/site-shell/spec.md#scenario-the-extension-pages-header} */
  it("names the button with the current language and adds no heading", () => {
    pathname = X1;
    const doc = new DOMParser().parseFromString(
      renderToStaticMarkup(<LanguagePicker />),
      "text/html",
    );
    expect(doc.querySelector("button[aria-haspopup=dialog]")?.textContent).toContain("English");
    expect(doc.querySelectorAll("a")).toHaveLength(28);
    expect(doc.querySelector("h1, h2, h3, h4, h5, h6")).toBeNull();
  });

  /** {@link openspec/specs/site-shell/spec.md#scenario-a-page-without-translations} */
  it("renders nothing on a page without translations or with no path", () => {
    pathname = "/";
    expect(renderToStaticMarkup(<LanguagePicker />)).toBe("");
    pathname = null;
    expect(renderToStaticMarkup(<LanguagePicker />)).toBe("");
    pathname = `/en${X1}`;
    expect(renderToStaticMarkup(<LanguagePicker />)).toBe("");
  });
});
