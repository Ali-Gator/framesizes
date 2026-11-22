import { findFrame } from "./frames";
import { CM_PER_INCH, type Size, type Unit } from "./units";

/*
 * The actual size viewer's sizes and a screen's scale. A scale is CSS pixels per inch.
 */

const MM_PER_INCH = 25.4;

/** A size the actual size viewer offers, upright: `id` names it in sentences, `label` on its button. */
export interface ActualSize extends Size {
  id: string;
  label: string;
}

function catalog(id: string): ActualSize {
  const frame = findFrame(id);
  if (!frame) throw new Error(`${id} is not in the catalog`);
  return { id, label: id.replace("x", "×"), w: frame.w, h: frame.h };
}

const fromMm = (id: string, w: number, h: number): ActualSize => ({
  id,
  label: id,
  w: w / MM_PER_INCH,
  h: h / MM_PER_INCH,
});

/**
 * {@link openspec/specs/size-engine/spec.md#requirement-the-actual-size-viewer-has-seven-sizes}
 */
export const ACTUAL_SIZES: readonly ActualSize[] = [
  ...["4x6", "5x7", "8x10", "11x14", "16x20"].map(catalog),
  fromMm("A4", 210, 297),
  fromMm("A3", 297, 420),
];

/** One decimal, a whole number bare: 8, 8.3, 5.6. */
export const oneDecimal = (n: number): string => {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
};

/**
 * A viewer size in the visitor's unit: inches to one decimal with whole numbers bare
 * ("8 × 10 in", "8.3 × 11.7 in"), centimetres always to one decimal ("21.0 × 29.7 cm").
 * {@link openspec/specs/size-engine/spec.md#scenario-the-a-series-sizes-in-both-units}
 */
export function writeActual({ w, h }: Size, unit: Unit): string {
  if (unit === "cm") {
    return `${(w * CM_PER_INCH).toFixed(1)} × ${(h * CM_PER_INCH).toFixed(1)} cm`;
  }
  return `${oneDecimal(w)} × ${oneDecimal(h)} in`;
}

/** A thing's two edges in inches. */
export interface Edges {
  short: number;
  long: number;
}

/**
 * The things a visitor holds to the screen to check its scale.
 * {@link openspec/specs/size-engine/spec.md#requirement-the-things-that-check-a-scale-have-both-edges}
 */
export const CHECK_OBJECTS = {
  card: { short: 53.98 / MM_PER_INCH, long: 85.6 / MM_PER_INCH },
  letter: { short: 8.5, long: 11 },
  a4: { short: 210 / MM_PER_INCH, long: 297 / MM_PER_INCH },
} as const satisfies Record<string, Edges>;

const positive = (n: number) => Number.isFinite(n) && n > 0;

/**
 * CSS pixels per inch from a screen's CSS size and its diagonal in inches, or `null`.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-screens-diagonal-gives-its-scale}
 */
export function scaleFromDiagonal(w: number, h: number, diagonal: number): number | null {
  if (!positive(w) || !positive(h) || !positive(diagonal)) return null;
  return Math.hypot(w, h) / diagonal;
}

/** A screen's CSS size and whether its pointer is coarse (touch). */
export interface ScreenInfo {
  w: number;
  h: number;
  coarse: boolean;
}

/** A phone's screen: its shorter side is at most 500 CSS px. */
export const isPhoneScreen = ({ w, h }: Size) => Math.min(w, h) <= 500;

/** A tablet's screen: not a phone's, a coarse pointer, and a shorter side of at most 1,100 CSS px. */
export const isTabletScreen = (screen: ScreenInfo) =>
  !isPhoneScreen(screen) && screen.coarse && Math.min(screen.w, screen.h) <= 1100;

/**
 * The diagonal to assume before any check.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-screens-scale-has-a-first-guess}
 */
export function guessDiagonal(screen: ScreenInfo): number {
  if (isPhoneScreen(screen)) return 6.1;
  if (isTabletScreen(screen)) return 11;
  if (Math.hypot(screen.w, screen.h) < 2200) return 14;
  return 23;
}

/** The scale of the guessed diagonal; a screen with no size falls back to 96 px per inch, CSS's own inch. */
export function guessScale(screen: ScreenInfo): number {
  return scaleFromDiagonal(screen.w, screen.h, guessDiagonal(screen)) ?? 96;
}
