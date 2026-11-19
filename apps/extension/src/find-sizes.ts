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
/** A print's side, in inches: smaller or larger is not a print size. */
export const MIN_SIDE = 3;
export const MAX_SIDE = 120;

const NUM = String.raw`(\d+(?:[.,]\d+)?)`;
const UNIT = String.raw`(inches|inch|in(?![a-z])|cm(?![a-z])|mm(?![a-z])|"|″)`;
/*
 * Each number is bounded on both sides by a non-digit, so "24 x 36 px" never backtracks into
 * "24 × 3" and slips past the pixel check.
 */
const BY = String.raw`\s*(?:[x×]|\bby\b)\s*`;
/** A third number, a canvas's depth ("60 × 90 × 3 cm"), is read past so the unit still applies. */
const DEPTH = String.raw`(?:${BY}\d+(?:[.,]\d+)?(?!\d|[.,]\d))?`;
const SIZE = new RegExp(
  String.raw`(?<!\d|\d[.,])${NUM}\s*${UNIT}?${BY}${NUM}(?!\d|[.,]\d)${DEPTH}(?:\s*${UNIT})?`,
  "gi",
);
/** A size in a unit no print is sold in here: pixels, feet, metres. */
const OTHER_UNIT = /^\s*(?:px|pixels?|ft|feet|foot|'|m|meters?|metres?)(?![a-z])/i;
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
    if (OTHER_UNIT.test(text.slice((match.index ?? 0) + whole.length))) continue;
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
