// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";

import { readPage } from "../read-page";

const LINK = "https://www.shop.example/p/blue-hour";

/** jsdom has no layout: give an element the box the page would. */
function box(el: Element | null, x: number, y: number, w: number, h: number) {
  if (!el) throw new Error("no element");
  el.getBoundingClientRect = () =>
    ({ x, y, width: w, height: h, top: y, left: x, right: x + w, bottom: y + h }) as DOMRect;
}

afterEach(() => {
  document.body.innerHTML = "";
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#requirement-right-clicking-an-image-offers-try-on-my-wall} */
describe("reading the page for a clicked link", () => {
  it("takes the image inside the largest link to the URL, with its box", () => {
    document.body.innerHTML = `
      <a href="${LINK}" id="small"><img id="thumb" src="https://cdn.shop.example/thumb.jpg"></a>
      <a href="${LINK}" id="big"><img id="print" src="https://cdn.shop.example/print.jpg"></a>
      <a href="https://www.shop.example/other"><img src="https://cdn.shop.example/other.jpg"></a>`;
    box(document.getElementById("small"), 0, 0, 50, 50);
    box(document.getElementById("thumb"), 0, 0, 50, 50);
    box(document.getElementById("big"), 10, 100, 300, 400);
    box(document.getElementById("print"), 10, 100, 300, 400);
    const page = readPage("", LINK);
    expect(page.url).toBe("https://cdn.shop.example/print.jpg");
    expect(page.rect).toMatchObject({ x: 10, y: 100, w: 300, h: 400 });
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-print-drawn-as-a-links-background} */
  it("takes a background image drawn on an element inside the link, with that element's box", () => {
    document.body.innerHTML = `
      <a href="${LINK}" id="link"><div id="print"
        style="background-image: url('https://cdn.shop.example/print.jpg')"></div><span>Blue Hour</span></a>`;
    box(document.getElementById("link"), 0, 0, 320, 480);
    box(document.getElementById("print"), 10, 20, 300, 400);
    const page = readPage("", LINK);
    expect(page.url).toBe("https://cdn.shop.example/print.jpg");
    expect(page.rect).toMatchObject({ x: 10, y: 20, w: 300, h: 400 });
    expect(page.shape).toBeNull();
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-print-drawn-as-a-links-background} */
  it("takes a background image drawn on the link itself", () => {
    document.body.innerHTML = `<a href="${LINK}" id="link"
      style="background-image: url(https://cdn.shop.example/print.jpg)">Blue Hour</a>`;
    box(document.getElementById("link"), 5, 6, 200, 300);
    const page = readPage("", LINK);
    expect(page.url).toBe("https://cdn.shop.example/print.jpg");
    expect(page.rect).toMatchObject({ x: 5, y: 6, w: 200, h: 300 });
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-print-drawn-as-a-links-background} */
  it("takes the largest picture in the link, not an icon or badge before it", () => {
    document.body.innerHTML = `
      <a href="${LINK}" id="link" style="background-image: url(https://cdn.shop.example/arrow.svg)">
        <img id="badge" src="https://cdn.shop.example/sale.png">
        <img id="hidden" src="https://cdn.shop.example/hidden.jpg">
        <div id="print" style="background-image: url('https://cdn.shop.example/print.jpg')"></div>
      </a>`;
    box(document.getElementById("link"), 0, 0, 16, 16);
    box(document.getElementById("badge"), 0, 0, 40, 20);
    box(document.getElementById("hidden"), 0, 0, 0, 0);
    box(document.getElementById("print"), 10, 20, 300, 400);
    const page = readPage("", LINK);
    expect(page.url).toBe("https://cdn.shop.example/print.jpg");
    expect(page.rect).toMatchObject({ x: 10, y: 20, w: 300, h: 400 });
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-print-drawn-as-a-links-background} */
  it("finds an SVG link by its resolved address", () => {
    document.body.innerHTML = `
      <a href="http://[broken">x</a>
      <svg><a href="/p/blue-hour" id="svg"><image href="x.png"></image></a></svg>
      <div id="print" style="background-image: url('https://cdn.shop.example/print.jpg')"></div>`;
    const base = document.createElement("base");
    base.href = "https://www.shop.example/";
    document.head.append(base);
    const svgLink = document.getElementById("svg");
    svgLink?.append(document.getElementById("print") as Element);
    box(svgLink, 0, 0, 300, 400);
    box(document.getElementById("print"), 0, 0, 300, 400);
    expect(readPage("", LINK).url).toBe("https://cdn.shop.example/print.jpg");
    base.remove();
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-print-drawn-as-a-links-background} */
  it("undoes CSS escapes in a background image's address", () => {
    document.body.innerHTML = `<a href="${LINK}" id="link">x</a>`;
    box(document.getElementById("link"), 0, 0, 200, 300);
    const link = document.getElementById("link") as HTMLElement;
    // jsdom does not serialise escapes; set the computed form Chrome returns.
    const real = window.getComputedStyle;
    window.getComputedStyle = ((el: Element) =>
      el === link
        ? ({ backgroundImage: 'url("https://cdn.shop.example/a\\"b.jpg")' } as CSSStyleDeclaration)
        : real(el)) as typeof window.getComputedStyle;
    try {
      expect(readPage("", LINK).url).toBe("https://cdn.shop.example/a%22b.jpg");
    } finally {
      window.getComputedStyle = real;
    }
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-link-with-no-picture} */
  it("finds no picture in a text link, and still reads the title", () => {
    document.body.innerHTML = `<h1>Blue Hour Print</h1><a href="${LINK}" id="link">See the print</a>`;
    box(document.getElementById("link"), 0, 0, 100, 20);
    const page = readPage("", LINK);
    expect(page).toMatchObject({ url: null, rect: null, shape: null, title: "Blue Hour Print" });
  });
});
