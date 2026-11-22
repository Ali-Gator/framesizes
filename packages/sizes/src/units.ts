/** A width and a height in inches, width first. */
export interface Size {
  w: number;
  h: number;
}

export type Unit = "in" | "cm";

/** How a size is written: `8x10` in headings and sentences, `8 × 10 in` / `20.3 × 25.4 cm` in tables and drawings. */
export type SizeForm = "search" | Unit;

export const CM_PER_INCH = 2.54;

/**
 * Inches to centimetres, one decimal; a whole number prints without a trailing zero.
 * {@link openspec/specs/size-engine/spec.md#requirement-inches-convert-to-centimetres-at-one-decimal}
 */
export function toCm(inches: number): number {
  return Math.round(inches * CM_PER_INCH * 10) / 10;
}

/** Inches to whole centimetres, for measures in sentences. */
export function toWholeCm(inches: number): number {
  return Math.round(inches * CM_PER_INCH);
}

/**
 * {@link openspec/specs/size-engine/spec.md#requirement-a-size-is-written-in-one-of-three-fixed-forms}
 */
export function writeSize({ w, h }: Size, form: SizeForm): string {
  if (form === "search") return `${w}x${h}`;
  if (form === "cm") return `${toCm(w)} × ${toCm(h)} cm`;
  return `${w} × ${h} in`;
}

const EIGHTHS = ["", "⅛", "¼", "⅜", "½", "⅝", "¾", "⅞"] as const;

/**
 * A length in inches to the nearest eighth: `7½`, `¼`, `10`.
 * {@link openspec/specs/size-engine/spec.md#requirement-an-inch-length-is-written-to-the-nearest-eighth}
 */
export function inEighths(inches: number): string {
  const eighths = Math.round(inches * 8);
  const whole = Math.floor(eighths / 8);
  const glyph = EIGHTHS[eighths - whole * 8];
  return whole && glyph ? `${whole}${glyph}` : glyph || String(whole);
}

/** A size in inches to the nearest eighth: `7½ × 9½ in`. */
export function writeEighths({ w, h }: Size): string {
  return `${inEighths(w)} × ${inEighths(h)} in`;
}

const GLYPH = /^(?:(\d+) ?)?([⅛¼⅜½⅝¾⅞])$/;
const FRACTION = /^(?:(\d+)(?: +|-))?(\d+)\/(\d+)$/;
const DECIMAL = /^\d+(?:[.,]\d+)?$/;

/**
 * A typed length: `8`, `8.125`, `8,5`, `3/4`, `8 1/8`, `8-1/8`, `8⅛`. `undefined` for anything else,
 * a minus sign or a division by 0.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-typed-length-is-read-with-fractions}
 */
export function readLength(text: string): number | undefined {
  const t = text.trim();
  if (DECIMAL.test(t)) return Number(t.replace(",", "."));
  const glyph = GLYPH.exec(t);
  if (glyph)
    return Number(glyph[1] ?? 0) + (EIGHTHS as readonly string[]).indexOf(glyph[2] ?? "") / 8;
  const fraction = FRACTION.exec(t);
  if (!fraction || Number(fraction[3]) === 0) return undefined;
  return Number(fraction[1] ?? 0) + Number(fraction[2]) / Number(fraction[3]);
}

/** A length in inches as feet and inches: `8 ft`, `5 ft 9 in`. */
export function feetAndInches(inches: number): string {
  const feet = Math.floor(inches / 12);
  const rest = inches - feet * 12;
  return rest ? `${feet} ft ${rest} in` : `${feet} ft`;
}
