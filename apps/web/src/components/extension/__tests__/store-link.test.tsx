// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { withLive } from "@/components/site/__tests__/fixtures";
import { storeUrl } from "@/lib/extension";

import { StoreLink } from "../store-link";

const ID = "abcdefghijklmnopabcdefghijklmnop";
const parse = (html: string) => new DOMParser().parseFromString(html, "text/html");

describe("StoreLink", () => {
  /** {@link openspec/specs/extension-site/spec.md#scenario-the-store-link-once-live} */
  it("links to the store page in plain text once the extension page is live", () => {
    const doc = parse(renderToStaticMarkup(<StoreLink pages={withLive("X1")} extensionId={ID} />));
    const links = doc.querySelectorAll("a");
    expect(links).toHaveLength(1);
    const a = links[0];
    expect(a?.textContent).toBe("Get it from the Chrome Web Store");
    expect(a?.getAttribute("href")).toBe(storeUrl(ID));
    expect(a?.getAttribute("target")).toBe("_blank");
    expect(a?.getAttribute("rel")).toBe("noopener");
    expect(a?.getAttribute("class")).toBeNull();
    expect(doc.querySelector("[class*='fs-btn']")).toBeNull();
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-no-store-link-before-go-live} */
  it("renders nothing while the extension page is not live", () => {
    expect(renderToStaticMarkup(<StoreLink pages={withLive()} extensionId={ID} />)).toBe("");
    expect(renderToStaticMarkup(<StoreLink pages={withLive("X1")} extensionId="" />)).toBe("");
  });
});

describe("StoreLink for Edge", () => {
  const EDGE = "ponmlkjihgfedcbaponmlkjihgfedcba";

  /** {@link openspec/specs/extension-site/spec.md#scenario-edge-with-its-id} */
  it("adds Edge's link, hidden outside Edge, once Edge's id is set", () => {
    const doc = parse(
      renderToStaticMarkup(<StoreLink pages={withLive("X1")} extensionId={ID} edgeId={EDGE} />),
    );
    const edge = doc.querySelector(".st-edge a");
    expect(edge?.textContent).toBe("Get it from Microsoft Edge Add-ons");
    expect(edge?.getAttribute("href")).toBe(
      `https://microsoftedge.microsoft.com/addons/detail/${EDGE}`,
    );
    expect(edge?.getAttribute("target")).toBe("_blank");
    expect(edge?.getAttribute("rel")).toBe("noopener");
    expect(doc.querySelector(".st-chrome a")?.textContent).toBe("Get it from the Chrome Web Store");
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-edge-before-its-id} */
  it("has no Edge link before Edge's id", () => {
    const doc = parse(
      renderToStaticMarkup(<StoreLink pages={withLive("X1")} extensionId={ID} edgeId="" />),
    );
    expect(doc.querySelector(".st-edge")).toBeNull();
    expect(doc.querySelector('a[href^="https://microsoftedge.microsoft.com"]')).toBeNull();
    expect(doc.querySelector(".st-chrome a")).not.toBeNull();
  });
});
