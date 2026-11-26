import type { PixelRect, Size } from "@framesizes/sizes";

import type { Scene } from "./scene";

/*
 * The PNG: the view on screen drawn again on a canvas at the engine's export size, from the same
 * geometry and the same nodes' computed colours. Nothing leaves the page.
 */

const SHAPE_STYLES = ["fill", "stroke", "stroke-width", "opacity"] as const;
const STOP_STYLES = ["stop-color", "stop-opacity"] as const;

/**
 * The room's SVG as a standalone image: each node's computed paint written inline, since CSS
 * variables do not resolve in an SVG loaded as an image.
 */
function roomImage(svg: SVGSVGElement, w: number, h: number): string {
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
  copy.setAttribute("width", String(w));
  copy.setAttribute("height", String(h));
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
 * cannot make one.
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
  if (!svg || !art || !frame) return null;
  const canvas = document.createElement("canvas");
  canvas.width = px.w;
  canvas.height = px.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const k = px.w / s.view.w;
  const x = (inches: number) => (inches - s.view.x) * k;
  const y = (inches: number) => (inches - s.view.y) * k;
  const rect = (r: { x: number; y: number; w: number; h: number }) =>
    [x(r.x), y(r.y), r.w * k, r.h * k] as const;
  // The screen's CSS px per inch, to scale the frame's shadow as it looks there.
  const screen = stage.getBoundingClientRect().width / s.view.w || k;
  const ratio = k / screen;

  const roomUrl = roomImage(svg, Math.round(144 * k), Math.round(96 * k));
  try {
    ctx.drawImage(await load(roomUrl), x(0), y(0), 144 * k, 96 * k);
  } finally {
    URL.revokeObjectURL(roomUrl);
  }

  ctx.save();
  ctx.shadowColor = "rgba(20, 24, 28, 0.18)";
  ctx.shadowBlur = 14 * ratio;
  ctx.shadowOffsetY = 6 * ratio;
  ctx.fillStyle = getComputedStyle(frame).backgroundColor;
  ctx.fillRect(...rect(s.outside));
  ctx.restore();

  const mat = stage.querySelector<HTMLElement>(".mk-mat");
  if (s.mat && mat) {
    ctx.fillStyle = getComputedStyle(mat).backgroundColor;
    ctx.fillRect(...rect(s.mat));
  }

  ctx.drawImage(art, crop.x, crop.y, crop.w, crop.h, ...rect(s.opening));

  const bevel = stage.querySelector<HTMLElement>(".mk-bev");
  if (bevel) {
    ctx.strokeStyle = getComputedStyle(bevel).borderTopColor;
    ctx.lineWidth = Math.max(1, ratio);
    ctx.strokeRect(...rect(s.opening));
  }

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

/** Saves a PNG blob under a name with a temporary link. */
export function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
