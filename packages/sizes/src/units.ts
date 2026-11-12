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

/** A length in inches as feet and inches: `8 ft`, `5 ft 9 in`. */
export function feetAndInches(inches: number): string {
  const feet = Math.floor(inches / 12);
  const rest = inches - feet * 12;
  return rest ? `${feet} ft ${rest} in` : `${feet} ft`;
}
