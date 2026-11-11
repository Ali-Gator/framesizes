import { MOULDING } from "./frames";
import { feetAndInches, toWholeCm, type Size, type Unit } from "./units";

/** A rectangle in inches: `x` from the scene's centre line (left edge), `y` above the floor (bottom edge). */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The drawn wall, floor to ceiling: a typical US 8 ft ceiling. */
export const WALL_HEIGHT = 96;
/** A three-seat sofa: width and the height of its back. */
export const SOFA = { width: 84, back: 34 } as const;
/** The gap between the sofa's back and a frame's outside bottom edge. */
export const ABOVE_SOFA = 8;
/** The average US adult man's height (5 ft 9 in). */
export const PERSON_HEIGHT = 69;
/** A standard interior door. */
export const DOOR = { width: 30, height: 80 } as const;
/** The gallery centre line: a frame's centre above the floor. */
export const CENTRE_LINE = 57;

export type ReferenceId = "sofa" | "person" | "door";
export const REFERENCE_IDS: readonly ReferenceId[] = ["sofa", "person", "door"];

interface Reference {
  /** How the drawing's name refers to it. */
  name: string;
  /** Frame centre, inches right of the scene's centre line. */
  frameX: number;
  /** Hung centred at the centre line, or above the reference. */
  centred: boolean;
  /** The silhouette's bounding box, as the scene draws it. */
  box: Rect;
}

/** Placement follows the design system's ScalePreview; boxes enclose the drawn silhouettes. */
export const REFERENCES: Record<ReferenceId, Reference> = {
  sofa: {
    name: "a three-seat sofa",
    frameX: 0,
    centred: false,
    box: { x: -SOFA.width / 2, y: 0, w: SOFA.width, h: SOFA.back },
  },
  person: {
    name: "a person",
    frameX: 10,
    centred: true,
    box: { x: -56.6, y: 0, w: 21.2, h: PERSON_HEIGHT },
  },
  door: {
    name: "a door",
    frameX: 14,
    centred: true,
    // The leaf starts 62 in left of the centre line; the casing adds 2.5 in on each side and on top.
    box: { x: -64.5, y: 0, w: DOOR.width + 5, h: DOOR.height + 2.5 },
  },
};

export interface WallScene {
  frame: { outside: Rect; art: Rect };
  ghost: Rect | null;
  reference: { id: ReferenceId; box: Rect };
  /** The centre line's height when the frame hangs on it. */
  centreLine: number | null;
}

/**
 * A frame, and optionally a second one, at true scale beside a reference, in inches.
 * {@link openspec/specs/size-engine/spec.md#requirement-the-wall-scene-places-a-frame-at-true-scale-beside-a-reference}
 */
export function wallScene({
  frame,
  ghost,
  reference,
  moulding = MOULDING,
}: {
  frame: Size;
  ghost?: Size | null;
  reference: ReferenceId;
  moulding?: number;
}): WallScene {
  const ref = REFERENCES[reference];
  const hang = (size: Size): Rect => {
    const w = size.w + 2 * moulding;
    const h = size.h + 2 * moulding;
    const y = ref.centred ? CENTRE_LINE - h / 2 : SOFA.back + ABOVE_SOFA;
    return { x: ref.frameX - w / 2, y, w, h };
  };
  const outside = hang(frame);
  return {
    frame: {
      outside,
      art: { x: outside.x + moulding, y: outside.y + moulding, w: frame.w, h: frame.h },
    },
    ghost: ghost ? hang(ghost) : null,
    reference: { id: reference, box: ref.box },
    centreLine: ref.centred ? CENTRE_LINE : null,
  };
}

/**
 * The reference in one sentence, every measure from the constants above.
 * {@link openspec/specs/size-engine/spec.md#requirement-the-reference-is-described-in-the-visitors-unit}
 */
export function referenceSentence(reference: ReferenceId, unit: Unit): string {
  const len = (inches: number) => (unit === "cm" ? `${toWholeCm(inches)} cm` : `${inches} in`);
  const tall = (inches: number) =>
    unit === "cm" ? `${toWholeCm(inches)} cm` : feetAndInches(inches);
  if (reference === "sofa") return `Hung ${len(ABOVE_SOFA)} above a sofa ${len(SOFA.width)} wide`;
  const height = reference === "person" ? PERSON_HEIGHT : DOOR.height;
  return `Centred ${len(CENTRE_LINE)} from the floor, next to ${REFERENCES[reference].name} ${tall(height)} tall`;
}
