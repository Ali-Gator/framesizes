/*
 * The print sizes in a shop page's text: W × H in inches, centimetres or millimetres.
 * Pure, so the worker and the tests share it.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-sizes-come-from-the-page-text}
 */

export interface FoundSize {
  /** Width and height in exact inches, as written (not turned). */
  w: number;
  h: number;
  /** The unit the page wrote it in. */
  unit: "in" | "cm" | "mm";
  /** "24 × 36 in", "60 × 90 cm": the numbers as written. */
  label: string;
}

/** The most sizes a try lists. */
export const MAX_SIZES = 8;
const MIN_SIDE = 3;
const MAX_SIDE = 120;

const NUM = String.raw`(\d+(?:[.,]\d+)?)`;
const UNIT = String.raw`(inches|inch|in(?![a-z])|cm(?![a-z])|mm(?![a-z])|"|″)`;
/*
 * Each number is bounded on both sides by a non-digit, so "24 x 36 px" never backtracks into
 * "24 × 3" and slips past the pixel check.
 */
const SIZE = new RegExp(
  String.raw`(?<!\d|\d[.,])${NUM}\s*${UNIT}?\s*(?:[x×]|\bby\b)\s*${NUM}(?!\d|[.,]\d)(?:\s*${UNIT})?`,
  "gi",
);
const PIXELS = /^\s*(?:px|pixels?)(?![a-z])/i;
const PER_INCH = { in: 1, cm: 2.54, mm: 25.4 } as const;

const unitOf = (mark: string | undefined): FoundSize["unit"] | null => {
  if (!mark) return null;
  const m = mark.toLowerCase();
  return m === "cm" || m === "mm" ? m : "in";
};

/** Each print size in the text once, either way round, in page order, up to eight. */
export function findSizes(text: string): FoundSize[] {
  const found: FoundSize[] = [];
  const seen = new Set<string>();
  for (const match of text.matchAll(SIZE)) {
    if (found.length >= MAX_SIZES) break;
    const [whole, a = "", unitA, b = "", unitB] = match;
    if (PIXELS.test(text.slice((match.index ?? 0) + whole.length))) continue;
    const unit = unitOf(unitA) ?? unitOf(unitB) ?? "in";
    const w = Number(a.replace(",", ".")) / PER_INCH[unit];
    const h = Number(b.replace(",", ".")) / PER_INCH[unit];
    if ([w, h].some((side) => !(side >= MIN_SIDE && side <= MAX_SIDE))) continue;
    const key = [w, h]
      .map((side) => Math.round(side * 100))
      .sort((x, y) => x - y)
      .join("x");
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({ w, h, unit, label: `${a} × ${b} ${unit}` });
  }
  return found;
}
