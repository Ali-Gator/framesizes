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
    expect(renderToStaticMarkup(<StoreLink />)).toBe("");
  });
});
