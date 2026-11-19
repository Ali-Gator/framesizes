import { CM_PER_INCH, MOULDING, type Rect, type Side, type Unit } from "@framesizes/sizes";
import { type KeyboardEvent, useId, useRef, useState } from "react";

import {
  parseLength,
  stepDistance,
  writeDistance,
  writeNumber,
} from "@/components/frames-on-wall/display";
import { type Dimension, WallStage } from "@/components/frames-on-wall/stage";
import { areaOf, furnitureWord as furnitureOf } from "@/components/gallery-wall/gallery-wall";
import { MAX_FRAMES, placeOf, type PlannerState } from "@/components/gallery-wall/state";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { U } from "@/components/ui/u";

import type { FoundSize } from "../find-sizes";
import type { TryRecord } from "../store";
import {
  distancesOf,
  dragPrint,
  hangPrint,
  outsideOf,
  placed,
  type Size,
  tipOf,
  type To,
  turnLabel,
  turnSize,
  withDistance,
} from "./hang";
import { ArtHead, FRAME_OPTIONS } from "./size-step";
import type { TryAction, TryState } from "./try-reducer";
import type { TryImage } from "./use-try";

const SIDES: readonly Side[] = ["above", "below", "left", "right"];

/** A length in the unit the size was written in: "26", "66". */
const inUnit = (inches: number, unit: FoundSize["unit"]) =>
  unit === "mm" ? String(Math.round(inches * 25.4)) : writeNumber(inches, unit);

/** The rows' names and what each runs from, from the T23 canvas (board d). */
function rowName(side: Side, to: To | undefined, furniture: string) {
  if (side === "above") return { name: "To the ceiling", from: "Top edge" };
  if (side === "below") {
    return {
      name: to === "furniture" ? `To the ${furniture}` : "To the floor",
      from: "Bottom edge",
    };
  }
  return side === "left"
    ? { name: "From the left", from: "Wall's left edge" }
    : { name: "From the right", from: "Wall's right edge" };
}

/**
 * The print alone at true size on the saved wall, or in the sample room: its four distances as on
 * F2, the frame switch, the tip, and "Add to my layout", "Use my wall photo" and "Back to my layout".
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-print-hangs-at-true-size-on-the-saved-wall}
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-prints-distances-and-tip-follow-f2}
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-try-ends-by-adding-the-print-or-going-back}
 */
export function HangView({
  record,
  image,
  landscape,
  state,
  dispatch,
  size,
  planner,
  frames,
  hasPhoto,
  unit,
  onAdd,
  onBack,
  onPhoto,
}: {
  record: TryRecord;
  image: TryImage | null;
  /** Which way the picture runs; `null` when unknown, and the size hangs as written. */
  landscape: boolean | null;
  state: TryState;
  dispatch: (action: TryAction) => void;
  /** The picked or typed size, as written. */
  size: Size & { label: string; unit?: FoundSize["unit"] };
  planner: PlannerState;
  /** How many frames the layout holds now. */
  frames: number;
  hasPhoto: boolean;
  unit: Unit;
  onAdd: (print: { w: number; h: number; label: string; framed: boolean }) => void;
  onBack: () => void;
  onPhoto: () => void;
}) {
  const id = useId();
  const sample = planner.mode === "sample";
  const furnitureWord = furnitureOf(planner);
  const { wall, furniture } = placeOf(planner);
  const turned = turnSize(size, landscape);
  const label = turnLabel(size.label, size, turned);
  const outside = outsideOf(turned, state.framed);
  const base = hangPrint(outside, wall, furniture);
  const rect = placed(base, state.at);
  const [drag, setDrag] = useState<Rect | null>(null);
  const from = useRef<Rect | null>(null);
  const [drafts, setDrafts] = useState<Partial<Record<Side, string>>>({});
  const shown = drag ?? rect;
  const d = distancesOf(shown, wall, furniture);
  const full = frames >= MAX_FRAMES;
  const written = size.unit ?? unit;

  const moveTo = (to: Rect) => dispatch({ type: "move", dx: to.x - base.x, dy: to.y - base.y });
  function setSide(side: Side, inches: number | null) {
    if (inches === null) return;
    moveTo(withDistance(rect, side, inches, wall, furniture));
  }
  function commit(side: Side, text: string) {
    setDrafts((all) => {
      const rest = { ...all };
      delete rest[side];
      return rest;
    });
    setSide(side, parseLength(text, unit));
  }
  function step(side: Side, direction: 1 | -1) {
    const now = d[side]?.value;
    if (now !== undefined) setSide(side, stepDistance(now, direction, unit));
  }
  function onKey(_: string, event: KeyboardEvent) {
    const fine = unit === "cm" ? 1 / CM_PER_INCH : 0.25;
    const by = event.shiftKey ? fine * 4 : fine;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-by, 0],
      ArrowRight: [by, 0],
      ArrowUp: [0, by],
      ArrowDown: [0, -by],
    };
    const m = delta[event.key];
    if (!m) return;
    event.preventDefault();
    moveTo({ ...rect, x: rect.x + m[0], y: rect.y + m[1] });
  }

  const where =
    d.below?.to === "furniture"
      ? `${writeDistance(d.below.value, unit)} above the ${furnitureWord}`
      : "centred on the wall";
  const sizeWords = `${inUnit(turned.w, written)} by ${inUnit(turned.h, written)} ${written}`;
  const scene = `${record.title || "The print"}, ${sizeWords}${state.framed ? ", in a 1 in frame" : ""}, ${where}, ${sample ? "on a 12 by 8 ft sample wall" : "on your wall photo"}`;
  const dims: Dimension[] = SIDES.flatMap((side) => {
    const one = d[side];
    return one ? [{ side, value: one.value }] : [];
  });
  const tip = furniture ? tipOf(furniture) : null;

  return (
    <div className="x-pbody">
      <ArtHead record={record} image={image}>
        <span className="x-size-line">
          {label} ·{" "}
          {state.framed
            ? `${inUnit(outside.w, written)} × ${inUnit(outside.h, written)} framed`
            : "unframed"}
        </span>
      </ArtHead>
      <div>
        <Button variant="ghost" onClick={() => dispatch({ type: "change" })}>
          Change size
        </Button>
      </div>
      <WallStage
        area={areaOf(planner)}
        photo={sample ? null : planner.photo}
        label={scene}
        frames={[
          {
            id: "print",
            size: label,
            rect: shown,
            selected: true,
            name: `The print, ${label}`,
            art: image?.url,
            moulding: state.framed ? MOULDING : 0,
          },
        ]}
        dims={dims}
        preview={null}
        floor={null}
        onSelect={() => undefined}
        onDrag={(_, dx, dy) => {
          from.current ??= rect;
          const moved = dragPrint(from.current, dx, dy, wall, furniture);
          setDrag(moved.rect);
          return moved.lines;
        }}
        onDrop={() => {
          if (drag) moveTo(drag);
          from.current = null;
          setDrag(null);
        }}
        onKey={onKey}
      />
      <SegmentedControl
        label="Frame"
        className="x-seg-full"
        options={FRAME_OPTIONS}
        value={state.framed ? "framed" : "none"}
        onChange={(value) => dispatch({ type: "frame", framed: value === "framed" })}
      />
      <fieldset className="wf-rows">
        <legend className="x-label">Distances</legend>
        {SIDES.map((side) => {
          const one = d[side];
          const { name, from: edge } = rowName(side, one?.to, furnitureWord);
          const field = `${id}-${side}`;
          const neg = one !== null && one.value < -0.01;
          return (
            <div key={side} className={`wf-row${neg ? " is-neg" : ""}`} data-side={side}>
              <div className="wf-row-l">
                {one ? (
                  <label className="wf-row-name" htmlFor={field}>
                    {name}
                  </label>
                ) : (
                  <span className="wf-row-name">{name}</span>
                )}
                <span className="wf-row-to">{one ? edge : "Nothing marked on this side"}</span>
              </div>
              {one ? (
                <div className="wf-step">
                  <button
                    type="button"
                    className="wf-ibtn"
                    aria-label={`${name}: ${unit === "cm" ? "1 cm" : "¼ in"} less`}
                    onClick={() => step(side, -1)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="wf-num">
                    <input
                      id={field}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={drafts[side] ?? writeNumber(one.value, unit)}
                      onChange={(event) =>
                        setDrafts((all) => ({ ...all, [side]: event.target.value }))
                      }
                      onBlur={(event) => {
                        if (drafts[side] !== undefined) commit(side, event.target.value);
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" || drafts[side] === undefined) return;
                        event.preventDefault();
                        commit(side, event.currentTarget.value);
                      }}
                    />
                    <span className="wf-u" aria-hidden="true">
                      <U in="in" cm="cm" />
                    </span>
                  </span>
                  <button
                    type="button"
                    className="wf-ibtn"
                    aria-label={`${name}: ${unit === "cm" ? "1 cm" : "¼ in"} more`}
                    onClick={() => step(side, 1)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              ) : (
                <span className="wf-row-none" aria-hidden="true">
                  —
                </span>
              )}
            </div>
          );
        })}
      </fieldset>
      {tip ? (
        <p className="x-tip">
          Art about two-thirds of the {furnitureWord}&apos;s width fills this wall:{" "}
          {writeDistance(tip.art, unit)} over the {writeDistance(tip.under, unit)} {furnitureWord}.
        </p>
      ) : null}
      <div className="x-stack">
        <Button
          className="x-block"
          disabled={full}
          aria-describedby={full ? `${id}-full` : undefined}
          onClick={() => onAdd({ w: turned.w, h: turned.h, label, framed: state.framed })}
        >
          Add to my layout
        </Button>
        {full ? (
          <p className="x-why" id={`${id}-full`} role="status">
            That&apos;s 12 frames, the most the planner holds.
          </p>
        ) : null}
        {hasPhoto ? null : (
          <Button variant="secondary" className="x-block" onClick={onPhoto}>
            Use my wall photo
          </Button>
        )}
        <div>
          <Button variant="ghost" onClick={onBack}>
            Back to my layout
          </Button>
        </div>
      </div>
      <p className="x-muted">
        The print is drawn at the size you picked,{" "}
        {sample ? "on a 12 × 8 ft sample wall." : "on your wall photo."}
      </p>
    </div>
  );
}
