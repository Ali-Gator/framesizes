/**
 * The size engine: the single source of every size the site shows.
 * @see openspec/specs/size-engine/spec.md
 */

/** {@link openspec/specs/size-engine/spec.md#requirement-a-size-is-written-in-one-of-three-fixed-forms} */
export { CM_PER_INCH, feetAndInches, toCm, toWholeCm, writeSize } from "./units";
/** {@link openspec/specs/size-engine/spec.md#requirement-inches-convert-to-centimetres-at-one-decimal} */
export type { Size, SizeForm, Unit } from "./units";

/** {@link openspec/specs/size-engine/spec.md#requirement-the-catalog-lists-the-us-ready-made-frame-sizes} */
export { CATALOG, commonFrames, findFrame, framesFor, nextSizeUp } from "./frames";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-size-can-be-listed-and-found-in-any-orientation} */
export type { Frame, Orientation } from "./frames";
/** {@link openspec/specs/size-engine/spec.md#requirement-frame-anatomy-is-computed-from-the-frame-and-the-image} */
export { frameAnatomy, MAT_OVERLAP, MOULDING, type Anatomy } from "./frames";
/** {@link openspec/specs/size-engine/spec.md#requirement-the-catalog-says-when-and-against-what-it-was-checked} */
export { CHECK } from "./frames";

/** {@link openspec/specs/size-engine/spec.md#requirement-the-wall-scene-places-a-frame-at-true-scale-beside-a-reference} */
export {
  ABOVE_SOFA,
  CENTRE_LINE,
  DOOR,
  PERSON_HEIGHT,
  REFERENCE_IDS,
  REFERENCES,
  SOFA,
  WALL_HEIGHT,
  wallScene,
  type Rect,
  type ReferenceId,
  type WallScene,
} from "./scene";
/** {@link openspec/specs/size-engine/spec.md#requirement-the-reference-is-described-in-the-visitors-unit} */
export { referenceSentence } from "./scene";
