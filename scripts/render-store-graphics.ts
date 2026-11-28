// Renders the Microsoft Edge Add-ons graphics into apps/extension/store/edge/. Run once, commit the PNGs:
//   node scripts/render-store-graphics.ts
// Playwright's Chromium screenshots two HTML snippets: the 300 × 300 logo from icon.svg, and the
// 1400 × 560 large promotional tile in the small tile's style (yellow, the mark, Schibsted Grotesk).
import fs from "node:fs";
import path from "node:path";
import { stdout } from "node:process";

import { chromium } from "@playwright/test";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "apps/extension/store/edge");
// The 128 icon's stroke: the mark reads the same at any larger size.
const svg = fs
  .readFileSync(path.join(root, "apps/extension/icon.svg"), "utf8")
  .replaceAll("STROKE", "4.5");
const font = fs
  .readFileSync(
    path.join(
      root,
      "apps/extension/node_modules/@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-800-normal.woff2",
    ),
  )
  .toString("base64");
const HEADLINE = "Plan your gallery wall at true size";

const tile = `<!doctype html><style>
@font-face { font-family: "Schibsted Grotesk"; font-weight: 800; src: url(data:font/woff2;base64,${font}); }
html, body { margin: 0; }
body { width: 1400px; height: 560px; background: #FFC21A; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 40px; }
svg { width: 192px; height: 192px; }
h1 { margin: 0; font: 800 68px/1 "Schibsted Grotesk"; color: #14181C; letter-spacing: -0.01em; }
</style>${svg}<h1>${HEADLINE}</h1>`;

const logo = `<!doctype html><style>html, body { margin: 0; background: transparent; }
svg { display: block; width: 300px; height: 300px; }</style>${svg}`;

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const [file, html, width, height] of [
  ["logo-300.png", logo, 300, 300],
  ["promo-large-1400x560.png", tile, 1400, 560],
] as const) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, file), omitBackground: true });
  stdout.write(`${path.join(out, file)}\n`);
}
await browser.close();
