/*
 * What the worker reads from a shop page on the "Try on my wall" click, and the picture it keeps.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-page-is-read-only-on-the-click}
 */

/** The image's box in CSS pixels, with the page's device pixel ratio. */
export interface ImageRect {
  x: number;
  y: number;
  w: number;
  h: number;
  dpr: number;
}

export interface PageRead {
  text: string;
  title: string;
  /** The picture's URL: the clicked image's, or the one found inside a clicked link. */
  url: string | null;
  rect: ImageRect | null;
  /** The image's natural size: its shape, whatever part of it is on screen. */
  shape: { w: number; h: number } | null;
}

/**
 * Injected into the clicked frame by `scripting.executeScript`, which sends only the function's
 * source: it must use nothing from this module. Returns the page text (cut at 100,000 characters),
 * the product title (the first `h1`, else `og:title`, else the document's, cut at 80) and the
 * picture with its box: the clicked image, or with only `linkUrl`, the largest `<img>` or CSS
 * background image in the largest link to it.
 * {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-print-drawn-as-a-links-background}
 */
export function readPage(srcUrl: string, linkUrl = ""): PageRead {
  const clean = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();
  const text = (document.body?.innerText ?? "").slice(0, 100000);
  const title = (
    clean(document.querySelector("h1")?.textContent) ||
    clean(document.querySelector('meta[property="og:title"]')?.getAttribute("content")) ||
    clean(document.title)
  ).slice(0, 80);
  let found: Element | undefined;
  let url: string | null = null;
  if (srcUrl) {
    found = Array.from(document.images).find(
      (img) => img.currentSrc === srcUrl || img.src === srcUrl,
    );
    url = srcUrl;
  } else if (linkUrl) {
    const area = (el: Element) => {
      const b = el.getBoundingClientRect();
      return b.width * b.height;
    };
    // A malformed address on the page must not stop the read.
    const abs = (href: string) => {
      try {
        return new URL(href, document.baseURI).href;
      } catch {
        return "";
      }
    };
    // `href` resolved by hand: on an SVG `<a>` it is an SVGAnimatedString, not the address.
    const link = Array.from(document.querySelectorAll("a"))
      .filter((a) => abs(a.getAttribute("href") ?? "") === linkUrl)
      .sort((a, b) => area(b) - area(a))[0];
    // The largest picture in the link, so an arrow icon or a "Sale" badge never wins over the print.
    let best = 0;
    for (const el of link ? [link, ...Array.from(link.querySelectorAll("*"))] : []) {
      const bg = /url\(\s*(['"]?)(.*?)\1\s*\)/.exec(getComputedStyle(el).backgroundImage);
      const src =
        el instanceof HTMLImageElement
          ? el.currentSrc || el.src
          : (bg?.[2] ?? "").replace(/\\(.)/g, "$1");
      if (src && abs(src) && area(el) > best) {
        best = area(el);
        found = el;
        url = abs(src);
      }
    }
  }
  const box = found?.getBoundingClientRect();
  const rect =
    box && box.width > 0 && box.height > 0
      ? { x: box.x, y: box.y, w: box.width, h: box.height, dpr: window.devicePixelRatio || 1 }
      : null;
  // A background's natural size is unknown: the panel takes the loaded picture's.
  const shape =
    found instanceof HTMLImageElement && found.naturalWidth > 0 && found.naturalHeight > 0
      ? { w: found.naturalWidth, h: found.naturalHeight }
      : null;
  return { text, title, url, rect, shape };
}

/** The right-clicked image's bytes: `http`, `https` and `data:` only, and only an image. */
export async function fetchImage(url: string): Promise<Blob | null> {
  if (!/^(https?:|data:)/i.test(url)) return null;
  try {
    const response = await fetch(url, { credentials: "omit" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return blob.type.startsWith("image/") ? blob : null;
  } catch {
    return null;
  }
}

/**
 * The image cut from the tab's screenshot: its visible part at screen resolution, as a PNG.
 * `ponytail:` screen resolution only; a host permission would let the fetch work everywhere.
 */
export async function cropShot(shot: string, rect: ImageRect): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(await (await fetch(shot)).blob());
    const x = Math.max(0, Math.round(rect.x * rect.dpr));
    const y = Math.max(0, Math.round(rect.y * rect.dpr));
    const w = Math.min(bitmap.width, Math.round((rect.x + rect.w) * rect.dpr)) - x;
    const h = Math.min(bitmap.height, Math.round((rect.y + rect.h) * rect.dpr)) - y;
    if (w < 1 || h < 1) return null;
    const canvas = new OffscreenCanvas(w, h);
    canvas.getContext("2d")?.drawImage(bitmap, x, y, w, h, 0, 0, w, h);
    bitmap.close();
    return await canvas.convertToBlob({ type: "image/png" });
  } catch {
    return null;
  }
}
