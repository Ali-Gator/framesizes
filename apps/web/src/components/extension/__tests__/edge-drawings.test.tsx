// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { COPY } from "../copy";
import { MenuFigure } from "../figures";
import { PinPicture } from "../pin-picture";

const parse = (html: string) => new DOMParser().parseFromString(html, "text/html");
const texts = (root: ParentNode, sel: string) =>
  [...root.querySelectorAll(sel)].map((t) => [t.textContent, t.getAttribute("lang")]);

describe("the Edge pin picture", () => {
  /** {@link openspec/specs/extension-site/spec.md#scenario-the-edge-pin-pictures-labels} */
  it("draws Edge's menu with its English labels and both marks", () => {
    const doc = parse(renderToStaticMarkup(<PinPicture store="edge" label="Edge" />));
    const all = [...doc.querySelectorAll("text")].map((t) => t.textContent);
    expect(texts(doc, "text[lang]")).toEqual(
      expect.arrayContaining([
        ["Extensions", "en"],
        ["Manage Extensions", "en"],
        ["Get extensions for Microsoft Edge", "en"],
      ]),
    );
    expect(all).toEqual(expect.arrayContaining(["1", "2"]));
    expect(all.join(" ")).not.toMatch(/Show in toolbar|Manage extensions\b/);
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-the-edge-pin-picture-in-french} */
  it("keeps the labels English and the name French on the French page", () => {
    const fr = COPY.fr?.edge.pin.picture ?? "";
    const doc = parse(renderToStaticMarkup(<PinPicture store="edge" label={fr} />));
    const svg = doc.querySelector("svg");
    expect(svg?.getAttribute("role")).toBe("img");
    expect(svg?.getAttribute("aria-label")).toBe(fr);
    expect(fr).toMatch(/Edge/);
    expect(fr).toMatch(/1/);
    expect(fr).toMatch(/2/);
    expect(texts(doc, "text[lang]")).toEqual(expect.arrayContaining([["Extensions", "en"]]));
  });

  it("mirrors the browser on a right-to-left page but not its text", () => {
    const ltr = parse(renderToStaticMarkup(<PinPicture store="edge" label="x" />));
    const rtl = parse(renderToStaticMarkup(<PinPicture store="edge" label="x" dir="rtl" />));
    expect(ltr.querySelector("g[transform='translate(880 0) scale(-1 1)']")).toBeNull();
    expect(rtl.querySelector("g[transform='translate(880 0) scale(-1 1)']")).not.toBeNull();
    const title = (d: Document) =>
      [...d.querySelectorAll("text")].find((t) => t.textContent === "Extensions");
    expect(title(ltr)?.getAttribute("x")).toBe("356");
    expect(title(rtl)?.getAttribute("x")).toBe("524");
    expect(title(rtl)?.getAttribute("text-anchor")).toBe("end");
  });

  it("leaves Chrome's drawing as it was", () => {
    expect(renderToStaticMarkup(<PinPicture label="x" />)).toBe(
      renderToStaticMarkup(<PinPicture label="x" store="chrome" />),
    );
  });
});

describe("the right-click figure", () => {
  /** {@link openspec/specs/extension-site/spec.md#scenario-the-edge-right-click-figures-labels} */
  it("reads Edge's English items for Edge", () => {
    const doc = parse(renderToStaticMarkup(<MenuFigure label="x" store="edge" />));
    expect(texts(doc, ".ext-menu span")).toEqual([
      ["Copy image", "en"],
      ["Try on my wall", "en"],
      ["Inspect", "en"],
    ]);
    expect(doc.querySelector(".ext-menu-edge")).not.toBeNull();
  });

  it("keeps Chrome's items in the page's language", () => {
    const doc = parse(
      renderToStaticMarkup(
        <MenuFigure label="x" menu={{ copyImage: "Copier l'image", inspect: "Inspecter" }} />,
      ),
    );
    expect(texts(doc, ".ext-menu span").map(([t]) => t)).toEqual([
      "Copier l'image",
      "Try on my wall",
      "Inspecter",
    ]);
    expect(doc.querySelector(".ext-menu-edge")).toBeNull();
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-the-arabic-right-click-figure} */
  it("mirrors either store's figure only on a right-to-left page", () => {
    for (const store of ["chrome", "edge"] as const) {
      const rtl = parse(renderToStaticMarkup(<MenuFigure label="x" store={store} dir="rtl" />));
      const ltr = parse(renderToStaticMarkup(<MenuFigure label="x" store={store} />));
      expect(rtl.querySelector(".ext-fig-rtl .ext-menu[dir='ltr']")).not.toBeNull();
      expect(ltr.querySelector(".ext-fig-rtl")).toBeNull();
    }
  });
});
