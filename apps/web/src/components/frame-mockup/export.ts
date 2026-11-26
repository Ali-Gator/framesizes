import type { PixelRect, Size } from "@framesizes/sizes";

import type { Box, Scene } from "./scene";

/*
 * The PNG: the view on screen drawn again on a canvas at the engine's export size, from the same
 * geometry and the same nodes' computed colours. Nothing leaves the page.
 */

const SHAPE_STYLES = ["fill", "stroke", "stroke-width", "opacity"] as const;
const STOP_STYLES = ["stop-color", "stop-opacity"] as const;

/**
 * The room's SVG cut to the view, `px` pixels: each node's computed paint written inline, since
 * CSS variables do not resolve in an SVG loaded as an image. Cutting it to the view keeps the
 * image at the PNG's own size, however small the close-up.
 */
function roomImage(svg: SVGSVGElement, view: Box, px: Size): string {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  const from = [svg, ...svg.querySelectorAll("*")];
  const to = [copy, ...copy.querySelectorAll("*")];
  from.forEach((node, i) => {
    const target = to[i];
    if (!target) return;
    const css = getComputedStyle(node);
    const names = node.tagName.toLowerCase() === "stop" ? STOP_STYLES : SHAPE_STYLES;
    target.setAttribute("style", names.map((n) => `${n}:${css.getPropertyValue(n)}`).join(";"));
  });
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  copy.setAttribute("viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`);
  copy.setAttribute("width", String(px.w));
  copy.setAttribute("height", String(px.h));
  const xml = new XMLSerializer().serializeToString(copy);
  return URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" }));
}

async function load(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

/**
 * Draws the mockup the stage shows, `px` pixels, and gives the PNG; `null` when the browser
 * cannot make one. Every colour is read before the first wait, so a change made meanwhile cannot
 * mix into this PNG.
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-png-saves-the-view-on-screen}
 */
export async function makePng(
  stage: HTMLElement,
  s: Scene,
  crop: PixelRect,
  px: Size,
): Promise<Blob | null> {
  const svg = stage.querySelector<SVGSVGElement>("svg[data-room]");
  const art = stage.querySelector<HTMLImageElement>(".mk-art");
  const frame = stage.querySelector<HTMLElement>(".mk-fr");
  const mat = stage.querySelector<HTMLElement>(".mk-mat");
  const bevel = stage.querySelector<HTMLElement>(".mk-bev");
  if (!svg || !art || !frame) return null;
  const frameCss = getComputedStyle(frame);
  const paint = {
    frame: frameCss.backgroundColor,
    frameLine: frameCss.getPropertyValue("--fin-line").trim(),
    mat: mat ? getComputedStyle(mat).backgroundColor : "",
    matLine: mat ? getComputedStyle(mat).getPropertyValue("--mat-line").trim() : "",
    bevel: bevel ? getComputedStyle(bevel).borderTopColor : "",
  };
  // The screen's CSS px per inch, to scale shadows and 1 px lines as they look there.
  const k = px.w / s.view.w;
  const screen = stage.getBoundingClientRect().width / s.view.w || k;
  const ratio = k / screen;
  const roomUrl = roomImage(svg, s.view, px);

  const canvas = document.createElement("canvas");
  canvas.width = px.w;
  canvas.height = px.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(roomUrl);
    return null;
  }
  const rect = (r: Box) => [(r.x - s.view.x) * k, (r.y - s.view.y) * k, r.w * k, r.h * k] as const;
  /** A line `ratio` px wide just inside a box, as an inset box-shadow draws it. */
  const inset = (r: Box, color: string) => {
    if (!color) return;
    const [x, y, w, h] = rect(r);
    const line = Math.max(1, ratio);
    ctx.strokeStyle = color;
    ctx.lineWidth = line;
    ctx.strokeRect(x + line / 2, y + line / 2, w - line, h - line);
  };

  try {
    ctx.drawImage(await load(roomUrl), 0, 0, px.w, px.h);
  } finally {
    URL.revokeObjectURL(roomUrl);
  }

  ctx.save();
  ctx.shadowColor = "rgba(20, 24, 28, 0.18)";
  ctx.shadowBlur = 14 * ratio;
  ctx.shadowOffsetY = 6 * ratio;
  ctx.fillStyle = paint.frame;
  ctx.fillRect(...rect(s.outside));
  ctx.restore();
  inset(s.outside, paint.frameLine);

  if (s.mat && paint.mat) {
    ctx.fillStyle = paint.mat;
    ctx.fillRect(...rect(s.mat));
    inset(s.mat, paint.matLine);
  }

  ctx.drawImage(art, crop.x, crop.y, crop.w, crop.h, ...rect(s.opening));
  if (s.mat) inset(s.opening, paint.bevel);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

/** How long a saved PNG's URL lives: a browser may read it after the click returns (iOS Safari). */
const KEEP_MS = 60_000;

/** Saves a PNG blob under a name with a temporary link. */
export function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), KEEP_MS);
}
