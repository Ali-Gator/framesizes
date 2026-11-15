import { CM_PER_INCH, frameAnatomy, type Size, type Unit } from "@framesizes/sizes";

/*
 * The frame visualizer's page-only display rules: how a distance rounds, reads and writes in the
 * visitor's unit, when a mark is too short to trust, and how many frames the wall holds.
 * Every length in and out is in inches; only the text is in the visitor's unit.
 */

/** The most frames the page holds; the gallery wall planner takes more. */
export const MAX_FRAMES = 6;

/** Below this many photo pixels, a 2 px slip at each end moves every size by more than 3%. */
export const SHORT_MARK_PX = 134;

/**
 * The worst-case error of a mark `px` long when each end may be 2 px off, as a fraction.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-a-mark-too-short-to-trust-is-flagged}
 */
export const markError = (px: number): number => 4 / px;

const QUARTERS = ["", "¼", "½", "¾"] as const;

/**
 * A distance rounded in the visitor's unit: to the nearest ¼ in, or to whole centimetres.
 * Returns the number in that unit.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-every-number-shows-in-the-visitors-unit}
 */
export function roundDistance(inches: number, unit: Unit): number {
  return unit === "cm" ? Math.round(inches * CM_PER_INCH) : Math.round(inches * 4) / 4;
}

/** The rounded number alone, as a field shows it: "8¼", "½", "20", "-2½". */
export function writeNumber(inches: number, unit: Unit): string {
  const value = roundDistance(inches, unit);
  if (unit === "cm") return String(value);
  const size = Math.abs(value);
  const whole = Math.floor(size);
  const quarter = QUARTERS[Math.round((size - whole) * 4)] ?? "";
  const text = whole === 0 && quarter ? quarter : `${whole}${quarter}`;
  return value < 0 ? `-${text}` : text;
}

/**
 * The wall a frame covers: its outside size, moulding included, from the size engine.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-the-wall-table-lists-the-space-six-sizes-take}
 */
export const outsideSize = (frame: Size): Size => frameAnatomy({ frame, image: frame }).outside;

/** A distance with its unit: "8¼ in", "20 cm". */
export function writeDistance(inches: number, unit: Unit): string {
  return `${writeNumber(inches, unit)} ${unit}`;
}

const VULGAR: Record<string, number> = { "¼": 0.25, "½": 0.5, "¾": 0.75 };

/**
 * What the visitor typed, in their unit, as inches: "8.25", "8,25", "8 1/4", "8¼", "1/2"; `null`
 * for anything that is not a non-negative length.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-setting-a-distance-moves-the-selected-frame}
 */
export function parseLength(text: string, unit: Unit): number | null {
  const t = text.trim().replace(",", ".");
  const match =
    /^(\d+(?:\.\d+)?)?\s*([¼½¾])?$/.exec(t) ?? /^(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(t) ?? null;
  if (!match || !t) return null;
  let value: number;
  if (match.length === 3) {
    value = Number(match[1] ?? 0) + (match[2] ? (VULGAR[match[2]] ?? 0) : 0);
  } else {
    const denominator = Number(match[3]);
    if (denominator === 0) return null;
    value = Number(match[1] ?? 0) + Number(match[2]) / denominator;
  }
  if (!Number.isFinite(value)) return null;
  return unit === "cm" ? value / CM_PER_INCH : value;
}

/**
 * The distance one less or more step away, in inches: from the shown value, ¼ in or 1 cm.
 * {@link openspec/specs/frames-on-wall/spec.md#scenario-the-more-button}
 */
export function stepDistance(inches: number, direction: 1 | -1, unit: Unit): number {
  const shown = roundDistance(inches, unit);
  return unit === "cm" ? (shown + direction) / CM_PER_INCH : shown + direction * 0.25;
}
