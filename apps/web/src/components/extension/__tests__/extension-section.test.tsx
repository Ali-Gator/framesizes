// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { withLive } from "@/components/site/__tests__/fixtures";
import { storeUrl } from "@/lib/extension";

import { ExtensionSection } from "../extension-section";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ID = "abcdefghijklmnopabcdefghijklmnop";
const LIVE = withLive("G1", "F2", "X1");
const win = globalThis as { chrome?: unknown };
const parse = (html: string) => new DOMParser().parseFromString(html, "text/html");
const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();

let root: Root | undefined;

afterEach(async () => {
  const mounted = root;
  if (mounted) await act(async () => mounted.unmount());
  root = undefined;
  delete win.chrome;
  document.body.innerHTML = "";
});

describe("ExtensionSection", () => {
  /** {@link openspec/specs/extension-site/spec.md#scenario-the-section-while-the-extension-page-is-live} */
  it("shows the heading and an Add to Chrome link to the store page", () => {
    const doc = parse(
      renderToStaticMarkup(<ExtensionSection pages={LIVE} extensionId={ID} edgeId="" />),
    );
    const section = doc.querySelector("section");
    expect(section?.querySelectorAll("h2")).toHaveLength(1);
    expect(text(section?.querySelector("h2"))).toBe("Plan on any shop's page");
    expect(text(section)).toContain("Chrome extension");
    const add = [...doc.querySelectorAll("a")].find((a) => text(a) === "Add to Chrome");
    expect(add?.getAttribute("href")).toBe(storeUrl(ID));
    expect(add?.getAttribute("target")).toBe("_blank");
    expect(add?.getAttribute("rel")).toBe("noopener");
    expect(section?.querySelector('[role="img"]')?.getAttribute("aria-label")).toBeTruthy();
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-no-section-before-go-live} */
  it("renders nothing while the extension page is not live", () => {
    expect(
      renderToStaticMarkup(<ExtensionSection pages={withLive("G1", "F2")} extensionId={ID} />),
    ).toBe("");
    expect(renderToStaticMarkup(<ExtensionSection pages={LIVE} extensionId="" />)).toBe("");
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-the-section-on-a-phone} */
  it("holds the link and the phone line, and the CSS shows the line on a touch phone", () => {
    const doc = parse(
      renderToStaticMarkup(<ExtensionSection pages={LIVE} extensionId={ID} edgeId="" />),
    );
    expect(doc.querySelector(".ext-sec-add a")).not.toBeNull();
    expect(text(doc.querySelector(".ext-sec-phone"))).toBe(
      "Chrome on phones doesn't run extensions. Open this page on a computer to add it.",
    );
    const css = readFileSync(join(__dirname, "../../../app/widgets.css"), "utf8").replace(
      /\s+/g,
      " ",
    );
    expect(css).toContain(
      "@media (hover: none) and (pointer: coarse) { .ext-sec-add { display: none; } .ext-sec-phone { display: block; } }",
    );
    expect(css).toContain(".ext-sec-phone { display: none; }");
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-a-visitor-who-has-the-extension} */
  it("swaps the link for the You have it line in the same cell once the extension answers", async () => {
    win.chrome = {
      runtime: {
        sendMessage: (_id: string, _m: unknown, reply: (a: unknown) => void) =>
          reply({ installed: true, pinned: false, version: "0.1.0" }),
      },
    };
    const host = document.createElement("div");
    document.body.append(host);
    host.innerHTML = renderToStaticMarkup(
      <ExtensionSection pages={LIVE} extensionId={ID} edgeId="" />,
    );
    const before = host.querySelector(".ext-sec-cta");
    expect(before?.children).toHaveLength(2);
    expect((before?.children[1] as HTMLElement).style.visibility).toBe("hidden");

    const mount = document.createElement("div");
    document.body.append(mount);
    const created = createRoot(mount);
    root = created;
    await act(async () =>
      created.render(<ExtensionSection pages={LIVE} extensionId={ID} edgeId="" />),
    );
    const cta = mount.querySelector(".ext-sec-cta");
    const [get, have] = [...(cta?.children ?? [])] as HTMLElement[];
    expect(text(have)).toBe(
      "You have it. Click its button in Chrome's toolbar to open the side panel.",
    );
    // Both stay in the cell, so it keeps the taller line's height: hidden, not removed.
    expect(have?.style.visibility).toBe("");
    expect(get?.style.visibility).toBe("hidden");
    expect(get?.style.display).toBe("");
    expect(get?.querySelector("a")?.textContent).toBe("Add to Chrome");
  });
});

describe("ExtensionSection for Edge", () => {
  const EDGE = "ponmlkjihgfedcbaponmlkjihgfedcba";
  const edgeText = (doc: Document) => [...doc.querySelectorAll(".st-edge")].map((el) => text(el));

  /**
   * {@link openspec/specs/extension-site/spec.md#scenario-the-section-in-edge}
   * {@link openspec/specs/extension-site/spec.md#scenario-edge-on-a-phone}
   */
  it("holds Edge's lines beside Chrome's once Edge's id is set", () => {
    const doc = parse(
      renderToStaticMarkup(<ExtensionSection pages={LIVE} extensionId={ID} edgeId={EDGE} />),
    );
    expect(edgeText(doc)).toEqual([
      "Edge extension",
      "Edge's side panel",
      "Add to Edge",
      "Opens Microsoft Edge Add-ons",
      "This extension runs in Edge on a computer. Open this page on a computer to add it.",
      "You have it. Click its button in Edge's toolbar to open the side panel.",
    ]);
    const add = doc.querySelector(".st-edge a");
    expect(add?.getAttribute("href")).toBe(
      `https://microsoftedge.microsoft.com/addons/detail/${EDGE}`,
    );
    expect(add?.getAttribute("target")).toBe("_blank");
    expect(add?.getAttribute("rel")).toBe("noopener");
    expect(doc.querySelectorAll(".st-chrome")).toHaveLength(6);
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-edge-before-its-id} */
  it("builds no Edge line before Edge's id, leaving Chrome's markup as it was", () => {
    const withoutEdge = renderToStaticMarkup(
      <ExtensionSection pages={LIVE} extensionId={ID} edgeId="" />,
    );
    expect(withoutEdge).not.toContain("st-edge");
    expect(withoutEdge).not.toContain("st-chrome");
    expect(withoutEdge).not.toContain("microsoftedge.microsoft.com");
    expect(text(parse(withoutEdge).querySelector(".ext-sec-text p:nth-of-type(2)"))).toBe(
      "Gallery Wall Layout Generator puts the gallery wall planner in Chrome's side panel, so you can right-click a print on any shop and see it on your wall at true size.",
    );
  });
});
