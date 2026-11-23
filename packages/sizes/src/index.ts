/**
 * The size engine: the single source of every size the site shows.
 * @see openspec/specs/size-engine/spec.md
 */

/** {@link openspec/specs/size-engine/spec.md#requirement-a-size-is-written-in-one-of-three-fixed-forms} */
export { CM_PER_INCH, feetAndInches, toCm, toWholeCm, writeSize } from "./units";
/** {@link openspec/specs/size-engine/spec.md#requirement-inches-convert-to-centimetres-at-one-decimal} */
export type { Size, SizeForm, Unit } from "./units";
/** {@link openspec/specs/size-engine/spec.md#requirement-an-inch-length-is-written-to-the-nearest-eighth} */
export { inEighths, writeEighths } from "./units";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-typed-length-is-read-with-fractions} */
export { readLength } from "./units";

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

/** {@link openspec/specs/size-engine/spec.md#requirement-the-wall-tool-offers-seven-known-things-to-set-the-scale} */
export { KNOWN_IDS, KNOWN_THINGS, type KnownId, type KnownLength, type KnownThing } from "./wall";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-known-things-default-length-follows-the-visitors-unit} */
export { defaultLength } from "./wall";
/** {@link openspec/specs/size-engine/spec.md#requirement-two-marked-points-and-a-real-length-give-the-photos-scale} */
export { scaleFromMark, type Point } from "./wall";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-photos-size-and-a-frames-place-convert-between-inches-and-pixels} */
export { photoPointToWall, photoSize, rectToPhoto, type Photo } from "./wall";
/** {@link openspec/specs/size-engine/spec.md#requirement-the-demo-room-needs-no-marking} */
export { DEMO_ROOM, type Edges, type Wall } from "./wall";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-frames-distances-run-to-the-nearest-thing-in-line-with-it} */
export { frameDistances, type Distances, type Side } from "./wall";
/** {@link openspec/specs/size-engine/spec.md#requirement-setting-a-distance-moves-only-that-frame} */
export { setDistance } from "./wall";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-photos-known-edges-come-from-what-the-visitor-marks} */
export { photoEdges, type PhotoMarks } from "./wall";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-marked-sofa-or-bed-becomes-furniture-on-the-photo} */
export { markedFurniture } from "./wall";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-dragged-frame-snaps-to-the-edges-and-centres-around-it} */
export { SNAP, snapFrame, type SnapLines } from "./wall";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-new-frame-is-placed-beside-the-selected-one} */
export { PLACE_GAP, placeBeside } from "./wall";

/** {@link openspec/specs/size-engine/spec.md#requirement-the-actual-size-viewer-has-seven-sizes} */
export { ACTUAL_SIZES, oneDecimal, writeActual, type ActualSize } from "./screen";
/** {@link openspec/specs/size-engine/spec.md#requirement-the-things-that-check-a-scale-have-both-edges} */
export { CHECK_OBJECTS, type Edges as CheckEdges } from "./screen";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-screens-diagonal-gives-its-scale} */
export { scaleFromDiagonal } from "./screen";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-screens-scale-has-a-first-guess} */
export {
  guessDiagonal,
  guessScale,
  isPhoneScreen,
  isTabletScreen,
  type ScreenInfo,
} from "./screen";

/** {@link openspec/specs/size-engine/spec.md#requirement-a-measured-frame-size-is-matched-to-a-standard-size} */
export { identifyFrame, MEASURE_TOLERANCE, type Identified, type Measurement } from "./measure";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-front-opening-gives-the-frame-size} */
export { LIP } from "./measure";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-metric-frame-size-is-named-when-it-is-closer-than-the-us-size} */
export { METRIC_FRAMES } from "./measure";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-standard-frames-measurements-are-listed} */
export { frameMeasurements, type FrameMeasurements } from "./measure";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-measurement-with-no-answer-says-why} */
export { whyNoAnswer, type NoAnswer } from "./measure";

/** {@link openspec/specs/size-engine/spec.md#requirement-the-gallery-wall-planner-offers-five-templates} */
export { TEMPLATES, type Stack, type Template } from "./gallery";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-template-is-laid-out-with-one-gap-between-neighbours} */
export { GALLERY_GAP, layoutTemplate, type Layout } from "./gallery";
/** {@link openspec/specs/size-engine/spec.md#requirement-nail-marks-come-from-the-frames-hanger} */
export { nailMarks, type Hanger } from "./gallery";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-frame-with-no-nail-says-why} */
export { type NoNail } from "./gallery";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-gallery-group-is-measured-for-hanging} */
export { measureGroup, type GroupMeasure, type Nail } from "./gallery";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-whole-group-moves-as-one} */
export { groupDistances, setGroupDistance } from "./gallery";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-group-is-centred-on-the-wall} */
export { centreGroup } from "./gallery";

/** {@link openspec/specs/size-engine/spec.md#requirement-a-print-and-a-mat-width-give-the-mat-opening-and-the-frame-size} */
export { matSizes, type MatAnswer, type MatQuestion } from "./mat";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-print-names-the-frames-sold-with-a-pre-cut-mat-for-it} */
export { preCutFrames } from "./measure";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-frame-and-a-print-give-the-mat-border-on-each-side} */
export { matBorders } from "./mat";
/** {@link openspec/specs/size-engine/spec.md#requirement-the-calculator-offers-four-mat-widths-and-starts-at-2-inches} */
export { MAT_WIDTH, MAT_WIDTHS } from "./mat";
/** {@link openspec/specs/size-engine/spec.md#requirement-a-mat-question-that-gives-no-size-says-why} */
export { type NoMat, whyNoMat } from "./mat";
