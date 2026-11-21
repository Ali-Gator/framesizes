// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { companyLinks, footerGroups } from "@/lib/site-map";

import { SiteFooter } from "../site-footer";
import { withLive } from "./fixtures";

/** {@link openspec/specs/site-shell/spec.md#scenario-one-page-is-live} */
describe("SiteFooter", () => {
  it("groups the live pages by hub and carries the nominal-size note", () => {
    const html = renderToStaticMarkup(<SiteFooter groups={footerGroups(withLive("F1"))} />);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const nav = doc.querySelector('nav[aria-label="Footer"]');
    expect([...(nav?.querySelectorAll("h2") ?? [])].map((h) => h.textContent)).toEqual(["Frames"]);
    expect(
      [...(nav?.querySelectorAll("a") ?? [])].map((a) => [a.textContent, a.getAttribute("href")]),
    ).toEqual([["Frame size chart", "/"]]);
    expect(doc.querySelector("footer")?.textContent).toContain(
      "Sizes are nominal. Measure your frame's opening before you order a print.",
    );
  });

  it("leaves out hubs with no live page", () => {
    const groups = footerGroups(withLive("F1", "Q1"));
    expect(groups.map((g) => g.name)).toEqual(["Frames", "Print quality"]);
  });
});

/** {@link openspec/specs/site-shell/spec.md#scenario-the-company-row} */
describe("SiteFooter's company row", () => {
  it("names the operator and its address and links the company pages in order", () => {
    const pages = withLive("F1", "A1", "A2", "A3", "A4", "A5");
    const html = renderToStaticMarkup(
      <SiteFooter groups={footerGroups(pages)} company={companyLinks(pages)} />,
    );
    const doc = new DOMParser().parseFromString(html, "text/html");
    const hubs = doc.querySelector('nav[aria-label="Footer"]');
    expect([...(hubs?.querySelectorAll("h2") ?? [])].map((h) => h.textContent)).toEqual(["Frames"]);
    const text = doc.querySelector("footer")?.textContent ?? "";
    expect(text).toContain("Soft Divisions Limited");
    expect(text).toContain("B, G/F, 322 Shanghai Street, Yau Ma Tei, Kowloon, Hong Kong");
    const company = doc.querySelector('nav[aria-label="Company"]');
    expect(
      [...(company?.querySelectorAll("a") ?? [])].map((a) => [
        a.textContent,
        a.getAttribute("href"),
      ]),
    ).toEqual([
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Privacy policy", "/privacy-policy"],
      ["Terms of use", "/terms-of-use"],
      ["Refund policy", "/refund-policy"],
    ]);
  });
});
