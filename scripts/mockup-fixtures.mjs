// Writes F7's e2e fixtures: flat grey PNGs of known sizes, a PDF and a PNG that does not decode.
// Run once with `node scripts/mockup-fixtures.mjs`; the files are committed under e2e/fixtures/.
import { Buffer } from "node:buffer";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

const DIR = join(import.meta.dirname, "../e2e/fixtures");

const TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "ascii");
  const sum = Buffer.alloc(4);
  sum.writeUInt32BE(crc(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, sum]);
}
/** A flat grey 8-bit greyscale PNG. */
function png(width, height) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 0; // greyscale
  const row = Buffer.alloc(width + 1, 0x9a);
  row[0] = 0; // filter: none
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const [w, h] of [
  [2000, 3000],
  [3000, 2000],
  [3000, 4000],
])
  writeFileSync(join(DIR, `art-${w}x${h}.png`), png(w, h));
// A PNG's signature and then nothing a decoder can read.
writeFileSync(
  join(DIR, "art-broken.png"),
  Buffer.concat([png(1, 1).subarray(0, 8), Buffer.alloc(52, 0x55)]),
);
writeFileSync(
  join(DIR, "not-an-image.pdf"),
  "%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n",
);
