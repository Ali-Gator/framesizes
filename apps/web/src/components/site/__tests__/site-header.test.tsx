// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { navHubs } from "@/lib/site-map";

import { SiteHeader } from "../site-header";
import { withLive } from "./fixtures";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

const render = (...live: string[]) => {
  const html = renderToStaticMarkup(<SiteHeader hubs={navHubs(withLive(...live))} />);
  return new DOMParser().parseFromString(html, "text/html");
};

describe("SiteHeader", () => {
  /** {@link openspec/specs/site-shell/spec.md#scenario-several-hubs-are-live} */
  it("lists the live hubs in order and marks the current one", () => {
    const doc = render("F1", "P1");
    const links = [...doc.querySelectorAll("nav a")];
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Frames", "/"],
      ["Posters", "/poster-sizes"],
    ]);
    expect(links.map((a) => a.getAttribute("aria-current"))).toEqual(["page", null]);
  });

  /** {@link openspec/specs/site-shell/spec.md#scenario-only-one-hub-is-live} */
  it("shows no hub links and no menu button with one live hub", () => {
    const doc = render("F1");
    expect(doc.querySelector("nav")).toBeNull();
    expect(doc.querySelector("button[aria-controls]")).toBeNull();
  });

  /** {@link openspec/specs/site-shell/spec.md#scenario-the-menu-is-closed-on-first-render} */
  it("renders the links and a closed menu button on the server", () => {
    const doc = render("F1", "P1");
    const button = doc.querySelector('button[aria-label="Menu"]');
    expect(button?.getAttribute("aria-expanded")).toBe("false");
    const list = doc.getElementById(button?.getAttribute("aria-controls") ?? "");
    expect(list?.querySelectorAll("a")).toHaveLength(2);
  });

  /** {@link openspec/specs/site-shell/spec.md#scenario-the-home-page-is-opened} */
  it("links the logo to the home page", () => {
    const home = render("F1").querySelector('header a[aria-label="framesizes.app home"]');
    expect(home?.getAttribute("href")).toBe("/");
  });
});
