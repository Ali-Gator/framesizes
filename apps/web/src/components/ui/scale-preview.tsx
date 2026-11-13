import {
  REFERENCES,
  referenceSentence,
  toCm,
  wallScene,
  writeSize,
  type Rect,
  type ReferenceId,
  type Size,
  type Unit,
} from "@framesizes/sizes";
import type { ReactNode } from "react";

/**
 * Stage geometry from the design system: 720 × 384 units, 3.5 units per inch, floor at 352.
 * The scale is fixed, never zoom-to-fit: small frames must look small.
 */
export const STAGE = { width: 720, height: 384, floor: 352, perInch: 3.5 } as const;
const MID = STAGE.width / 2;

/** Inches (x from the centre line, y above the floor) to stage units. */
const sx = (x: number) => MID + x * STAGE.perInch;
const sy = (y: number) => STAGE.floor - y * STAGE.perInch;
const su = (n: number) => n * STAGE.perInch;

/** A rect given in inches by its left edge, its top above the floor, width and height. */
function InRect({
  className,
  x,
  top,
  w,
  h,
  r = 0,
}: {
  className: string;
  x: number;
  top: number;
  w: number;
  h: number;
  r?: number;
}) {
  return (
    <rect className={className} x={sx(x)} y={sy(top)} width={su(w)} height={su(h)} rx={su(r)} />
  );
}

function InLine({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line className="furn-line" x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)} />;
}

/** The reference silhouettes, ported from the design system; offsets in inches from the centre line. */
const SILHOUETTES: Record<ReferenceId, ReactNode> = {
  sofa: (() => {
    const o = -42;
    return (
      <>
        <InRect className="furn" x={o + 5} top={4} w={2.5} h={4} r={0.5} />
        <InRect className="furn" x={o + 76.5} top={4} w={2.5} h={4} r={0.5} />
        <InRect className="furn" x={o + 7} top={34} w={70} h={22} r={4} />
        <InRect className="furn" x={o} top={25} w={11} h={21.5} r={4} />
        <InRect className="furn" x={o + 73} top={25} w={11} h={21.5} r={4} />
        <InRect className="furn" x={o + 4} top={17} w={76} h={13.5} r={2} />
        <InLine x1={o + 42} y1={32} x2={o + 42} y2={10} />
        <InLine x1={o + 11} y1={17} x2={o + 73} y2={17} />
        <InLine x1={o + 11} y1={10} x2={o + 73} y2={10} />
      </>
    );
  })(),
  person: (() => {
    const c = -46;
    return (
      <>
        <ellipse className="furn" cx={sx(c)} cy={sy(64.6)} rx={su(3.6)} ry={su(4.4)} />
        <InRect className="furn" x={c - 6.5} top={58.5} w={13} h={26} r={3.5} />
        <InRect className="furn" x={c - 10.6} top={57.5} w={3.3} h={27} r={1.65} />
        <InRect className="furn" x={c + 7.3} top={57.5} w={3.3} h={27} r={1.65} />
        <InRect className="furn" x={c - 6.2} top={34} w={5.9} h={34} r={2.2} />
        <InRect className="furn" x={c + 0.3} top={34} w={5.9} h={34} r={2.2} />
      </>
    );
  })(),
  door: (() => {
    const o = -62;
    return (
      <>
        <InRect className="furn-soft" x={o - 2.5} top={82.5} w={35} h={82.5} />
        <InRect className="furn" x={o} top={80} w={30} h={80} />
        <InRect className="furn-line" x={o + 4.5} top={74} w={21} h={30} r={0.5} />
        <InRect className="furn-line" x={o + 4.5} top={38} w={21} h={30} r={0.5} />
        <circle className="knob" cx={sx(o + 25.8)} cy={sy(36)} r={su(1.2)} />
      </>
    );
  })(),
};

/** Stage units of an inches rect. */
const box = (r: Rect) => ({ x: sx(r.x), y: sy(r.y + r.h), width: su(r.w), height: su(r.h) });

/** The size, its unit close to the number, the other unit apart. */
function SizeLegend({ size, unit }: { size: Size; unit: Unit }) {
  const text = writeSize(size, unit);
  const cut = text.lastIndexOf(" ");
  return (
    <span className="fs-scale-size">
      {text.slice(0, cut)}
      <b>{text.slice(cut + 1)}</b>
      <span>{writeSize(size, unit === "cm" ? "in" : "cm")}</span>
    </span>
  );
}

/**
 * Design system ScalePreview: one frame on an 8 ft wall at true scale beside a reference, the
 * next size up as a dashed outline. Geometry comes from the size engine's `wallScene`.
 * {@link openspec/specs/frame-size-chart/spec.md#requirement-the-wall-view-shows-the-size-beside-a-reference-with-the-next-size-up}
 */
export function ScalePreview({
  frame,
  ghost,
  reference,
  unit,
}: {
  frame: Size;
  ghost?: Size | null;
  reference: ReferenceId;
  unit: Unit;
}) {
  const scene = wallScene({ frame, ghost, reference });
  const outside = box(scene.frame.outside);
  const art = box(scene.frame.art);
  const ghostBox = scene.ghost && box(scene.ghost);
  const left = Math.min(outside.x, ghostBox?.x ?? Infinity);
  const top = Math.min(outside.y, ghostBox?.y ?? Infinity);
  const right = Math.max(outside.x + outside.width, ghostBox ? ghostBox.x + ghostBox.width : 0);
  // Dimension brackets span the artwork, above and to the right of both outlines.
  const wy = top - 12;
  const hx = right + 12;
  const one = (inches: number) => (unit === "cm" ? `${toCm(inches)} cm` : `${inches} in`);
  const name = `${writeSize(frame, "search")} picture frame at true scale next to ${REFERENCES[reference].name}`;
  return (
    <figure className="fs-scale">
      <figcaption className="fs-scale-caption">True scale</figcaption>
      <div className="fs-scale-stage">
        <svg
          viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
          preserveAspectRatio="xMidYMax slice"
          role="img"
          aria-label={name}
        >
          {/* Past the viewBox both sides: the capped one-column preview shows it to the card's edges. */}
          <rect
            className="floor"
            x={-STAGE.width}
            y={STAGE.floor}
            width={3 * STAGE.width}
            height={STAGE.height - STAGE.floor}
          />
          <line
            className="wall-line"
            x1={-STAGE.width}
            x2={2 * STAGE.width}
            y1={STAGE.floor}
            y2={STAGE.floor}
          />
          {scene.centreLine !== null ? (
            <line
              className="guide"
              x1={left - 44}
              x2={left - 8}
              y1={sy(scene.centreLine)}
              y2={sy(scene.centreLine)}
            />
          ) : null}
          {SILHOUETTES[reference]}
          {ghostBox ? <rect className="ghost" {...ghostBox} /> : null}
          <g className="frame">
            <rect className="moulding" {...outside} />
            <rect className="artwork" {...art} />
            {/* No mat: the lip sits on the artwork's edge. */}
            <rect className="lip" {...art} />
          </g>
          <path
            className="dim"
            d={`M${art.x} ${wy}h${art.width}M${art.x} ${wy - 5}v10M${art.x + art.width} ${wy - 5}v10M${hx} ${art.y}v${art.height}M${hx - 5} ${art.y}h10M${hx - 5} ${art.y + art.height}h10`}
          />
          <text className="dim-text" x={art.x + art.width / 2} y={wy - 10} textAnchor="middle">
            {one(frame.w)}
          </text>
          <text className="dim-text" x={hx + 10} y={art.y + art.height / 2 + 6}>
            {one(frame.h)}
          </text>
        </svg>
      </div>
      <div className="fs-scale-legend">
        <SizeLegend size={frame} unit={unit} />
        <span className="fs-scale-ref">
          <span className="fs-scale-sentence">{referenceSentence(reference, unit)}.</span>
          {ghost ? (
            <span className="fs-scale-ghost">Next size up: {writeSize(ghost, unit)}</span>
          ) : null}
        </span>
      </div>
    </figure>
  );
}
