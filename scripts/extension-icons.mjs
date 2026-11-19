// Renders apps/extension/icon.svg to the four PNG icons the manifest names. Run once, commit the PNGs:
//   node scripts/extension-icons.mjs
// sharp comes from apps/web's Next install. Stroke widths follow board k of the T23 canvas.
import { Buffer } from "node:buffer";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { stdout } from "node:process";

const root = path.resolve(import.meta.dirname, "..");
// sharp is Next's dependency, so it resolves from next's own folder.
const fromWeb = createRequire(path.join(root, "apps/web/package.json"));
const sharp = createRequire(fromWeb.resolve("next/package.json"))("sharp");
const svg = fs.readFileSync(path.join(root, "apps/extension/icon.svg"), "utf8");
const STROKE = { 16: 6, 32: 5, 48: 4.5, 128: 4.5 };

// Chrome wants the 128 icon as 96 px art inside a 16 px transparent border; the rest go edge to edge.
const PAD = { 128: 16 };

for (const [px, stroke] of Object.entries(STROKE)) {
  const out = path.join(root, `apps/extension/public/icons/icon-${px}.png`);
  const pad = PAD[px] ?? 0;
  const art = Number(px) - 2 * pad;
  await sharp(Buffer.from(svg.replaceAll("STROKE", String(stroke))), {
    density: 72 * (art / 64) * 4,
  })
    .resize(art, art)
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(out);
  stdout.write(`${out}\n`);
}
