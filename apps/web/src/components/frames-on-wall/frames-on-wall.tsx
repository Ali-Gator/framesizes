"use client";

import {
  CM_PER_INCH,
  DEMO_ROOM,
  findFrame,
  photoSize,
  type Side,
  type SnapLines,
  toWholeCm,
  type Unit,
  writeSize,
} from "@framesizes/sizes";
import { type KeyboardEvent, useEffect, useId, useReducer, useRef, useState } from "react";

import { IfLive, PageLink } from "@/components/site/page-link";
import { Button } from "@/components/ui/button";
import { U } from "@/components/ui/u";
import { WidgetCard } from "@/components/ui/widget-card";
import { useUnit, useUnitSettled } from "@/lib/unit";

import { KNOWN_COPY, withArticle } from "./copy";
import { MAX_FRAMES, outsideSize, writeDistance, writeNumber } from "./display";
import { ConfirmDialog, PhotoFlow, Picker, usePhotoFile } from "./photo-flow";
import { type StageFrame, WallStage } from "./stage";
import {
  centreHeight,
  type Distance,
  distancesOf,
  dragFrame,
  initialState,
  previewRect,
  reducer,
  selectedFrame,
  wallOf,
  type WallState,
} from "./state";

export const WIDGET_TITLE = "Frame visualizer";

const SIDES: readonly Side[] = ["above", "below", "left", "right"];
const SIDE_NAME: Record<Side, string> = {
  above: "Above",
  below: "Below",
  left: "Left",
  right: "Right",
};

/** A size in both units: "18 × 22 in" / "45.7 × 55.9 cm". */
const Both = ({ w, h }: { w: number; h: number }) => (
  <U in={writeSize({ w, h }, "in")} cm={writeSize({ w, h }, "cm")} />
);
const outside = (size: string) => {
  const f = findFrame(size);
  return f ? outsideSize(f) : { w: 0, h: 0 };
};
/** The sample wall, from the engine's demo room. */
const ROOM = DEMO_ROOM.wall.bounds;

function toWhat(d: Distance): string {
  if (d.to.kind === "frame") return `the ${d.to.name} frame`;
  return `the ${d.to.name}`;
}

/** The drawing's name: the room or the photo, then every frame on it. */
function sceneLabel(state: WallState, unit: Unit): string {
  const frames = state.frames.map((f) => `${withArticle(f.size)} picture frame`).join(" and ");
  if (state.mode === "sample") {
    const wall =
      unit === "cm"
        ? `${toWholeCm(ROOM.w)} by ${toWholeCm(ROOM.h)} cm`
        : `${ROOM.w} by ${ROOM.h} in`;
    return `Sample room: a wall ${wall} with a sofa${frames ? ` and ${frames}` : ""}`;
  }
  return `Your wall photo${frames ? ` with ${frames}` : ""}`;
}

/**
 * The live region's sentence: the selected frame and its distances.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-each-change-to-a-frame-is-announced}
 */
function announcement(state: WallState, unit: Unit): string {
  const frame = selectedFrame(state);
  if (!frame) return state.frames.length ? "" : "No frame on the wall.";
  const d = distancesOf(state, frame.id);
  const parts = (["below", "above", "left", "right"] as const).flatMap((side) => {
    const one = d[side];
    return one ? [`${writeDistance(one.value, unit)} ${side} to ${toWhat(one)}`] : [];
  });
  return `${frame.size} frame: ${parts.join(", ") || "nothing marked around it"}.`;
}

/**
 * The F2 frame visualizer: the sample room or the visitor's wall photo, frames at true size, the
 * selected frame's distances. One client island, prerendered in the sample room.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-the-widget-opens-in-the-sample-room-with-the-16x20-selected}
 */
export function FramesOnWall() {
  const unit = useUnit();
  useUnitSettled(unit);
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [live, setLive] = useState("");

  // The e2e tests wait for this before they interact.
  useEffect(() => {
    document.documentElement.dataset.wallReady = "true";
  }, []);

  // Read out the selected frame after each change, never on every pointer move.
  const revision = useRef(state.revision);
  useEffect(() => {
    if (revision.current === state.revision) return;
    revision.current = state.revision;
    setLive(announcement(state, unit));
  }, [state, unit]);

  const { pickFile, error: fileError } = usePhotoFile(state, dispatch);

  const flow = state.mode !== "sample" && state.mode !== "photo";
  const footer = (
    <span>
      Frames are drawn with a <U in="1 in" cm="2.5 cm" /> moulding.{" "}
      {state.mode === "sample"
        ? "Sizes are the common US ready-made frame sizes."
        : "Your photo stays on this device."}
    </span>
  );

  return (
    <WidgetCard title={WIDGET_TITLE} footer={footer} className="wf">
      {flow ? (
        <PhotoFlow
          state={state}
          unit={unit}
          dispatch={dispatch}
          pickFile={pickFile}
          error={fileError}
        />
      ) : (
        <WallView state={state} unit={unit} dispatch={dispatch} />
      )}
      {state.confirmReset ? <ResetDialog state={state} dispatch={dispatch} /> : null}
      <p className="fs-sr" aria-live="polite">
        {live}
      </p>
    </WidgetCard>
  );
}

type Dispatch = (action: Parameters<typeof reducer>[1]) => void;

function WallView({ state, unit, dispatch }: { state: WallState; unit: Unit; dispatch: Dispatch }) {
  const [drag, setDrag] = useState<{ id: string; rect: StageFrame["rect"] } | null>(null);
  const dragFromRef = useRef<StageFrame["rect"] | null>(null);
  /** The latest dragged rect: a fast release may come before its render. */
  const dragRectRef = useRef<StageFrame["rect"] | null>(null);
  const sample = state.mode === "sample";
  const { photo, scale } = state;
  const area = !sample && photo && scale ? photoSize(photo, scale) : { w: ROOM.w, h: ROOM.h };
  const selected = selectedFrame(state);
  const distances = selected ? distancesOf(state, selected.id) : null;
  const floorInches = wallOf(state).wall.edges.bottom;
  const atCap = state.frames.length >= MAX_FRAMES;

  const frames: StageFrame[] = state.frames.map((f) => ({
    id: f.id,
    size: f.size,
    rect: drag?.id === f.id ? drag.rect : f.rect,
    selected: f.id === state.selected,
  }));
  const dims = distances
    ? SIDES.flatMap((side) => {
        const d = distances[side];
        return d ? [{ side, value: d.value }] : [];
      })
    : [];

  function onDrag(id: string, dx: number, dy: number): SnapLines {
    const frame = state.frames.find((f) => f.id === id);
    if (!frame) return { vertical: [], horizontal: [] };
    dragFromRef.current ??= frame.rect;
    const moved = dragFrame(state, id, dragFromRef.current, dx, dy);
    dragRectRef.current = moved.rect;
    setDrag({ id, rect: moved.rect });
    return moved.lines;
  }
  function onDrop(id: string) {
    const rect = dragRectRef.current;
    if (rect) dispatch({ type: "place", id, rect });
    dragFromRef.current = null;
    dragRectRef.current = null;
    setDrag(null);
  }
  function onKey(id: string, event: KeyboardEvent) {
    const fine = unit === "cm" ? 1 / CM_PER_INCH : 0.25;
    const coarse = unit === "cm" ? 5 / CM_PER_INCH : 1;
    const step = event.shiftKey ? coarse : fine;
    const by: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const d = by[event.key];
    if (d) {
      event.preventDefault();
      dispatch({ type: "nudge", id, dx: d[0], dy: d[1] });
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      dispatch({ type: "remove", id });
    }
  }

  const floor =
    !sample && photo && state.floor !== null && floorInches !== null
      ? { inches: floorInches, px: state.floor }
      : null;

  return (
    <div className="wf-split">
      <div className="wf-see">
        <WallStage
          area={area}
          photo={sample ? null : photo}
          label={sceneLabel(state, unit)}
          frames={frames}
          dims={drag ? [] : dims}
          preview={state.adding ? previewRect(state) : null}
          floor={floor}
          onSelect={(id) => dispatch({ type: "select", id })}
          onDrag={onDrag}
          onDrop={onDrop}
          onKey={onKey}
          onFloor={(y) => dispatch({ type: "floor", y })}
        />
        <p className="wf-caption">
          {sample ? (
            <>
              Sample room: a{" "}
              <U
                in={`${ROOM.w / 12} × ${ROOM.h / 12} ft`}
                cm={`${toWholeCm(ROOM.w)} × ${toWholeCm(ROOM.h)} cm`}
              />{" "}
              wall
            </>
          ) : (
            `Your photo, scaled from ${KNOWN_COPY[state.known].short.toLowerCase()}`
          )}
        </p>
        {state.frames.length ? (
          <div className="wf-on">
            <span className="fs-label" id="wf-on-label">
              On the wall
            </span>
            <div className="wf-chips" role="group" aria-labelledby="wf-on-label">
              {state.frames.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="wf-chip"
                  aria-pressed={f.id === state.selected}
                  onClick={() => dispatch({ type: "select", id: f.id })}
                >
                  {f.size}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="wf-do">
        {state.adding ? (
          <Picker
            title="Add a frame"
            count={`${state.frames.length} of ${MAX_FRAMES} frames on the wall`}
            orientation={state.adding.orientation}
            size={state.adding.size}
            onOrientation={(orientation) => dispatch({ type: "addOrientation", orientation })}
            onSize={(size) => dispatch({ type: "addSize", size })}
            cta={`Add ${state.adding.size} to the wall`}
            onApply={() => dispatch({ type: "add" })}
            onCancel={() => dispatch({ type: "closeAdd" })}
          />
        ) : (
          <>
            {selected && distances ? (
              <Selected
                key={selected.id}
                size={selected.size}
                distances={distances}
                centre={centreHeight(state)}
                unit={unit}
                dispatch={dispatch}
                onRemove={() => dispatch({ type: "remove", id: selected.id })}
              />
            ) : (
              <p className="wf-hint">
                No frame on the wall yet. Add one to see its size and the distances around it.
              </p>
            )}
            {!sample && state.floor === null ? (
              <div className="wf-tip">
                <span>Mark the floor line to see how high each frame hangs.</span>
                <div>
                  <Button variant="secondary" onClick={() => dispatch({ type: "markFloor" })}>
                    Mark the floor
                  </Button>
                </div>
              </div>
            ) : null}
            <div className="wf-actions wf-actions-col">
              {sample ? (
                <>
                  <Button
                    className="fs-btn-lg fs-btn-block"
                    onClick={() => dispatch({ type: "upload" })}
                  >
                    Use my wall photo
                  </Button>
                  <div className="wf-actions">
                    {atCap ? null : (
                      <Button variant="secondary" onClick={() => dispatch({ type: "openAdd" })}>
                        Add a frame
                      </Button>
                    )}
                    <Button variant="ghost" onClick={() => dispatch({ type: "openReset" })}>
                      Start over
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {atCap ? null : (
                    <Button
                      className="fs-btn-lg fs-btn-block"
                      onClick={() => dispatch({ type: "openAdd" })}
                    >
                      Add a frame
                    </Button>
                  )}
                  <div className="wf-actions">
                    <Button variant="secondary" onClick={() => dispatch({ type: "upload" })}>
                      Change photo
                    </Button>
                    <Button variant="ghost" onClick={() => dispatch({ type: "openReset" })}>
                      Start over
                    </Button>
                  </div>
                </>
              )}
              {atCap ? (
                <p className="wf-cap">
                  That&apos;s 6 frames, the most this page holds.
                  <IfLive page="G1">
                    {" "}
                    For a whole gallery wall, open the{" "}
                    <PageLink id="G1">gallery wall layout planner</PageLink>.
                  </IfLive>
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The selected frame, its four distances with less, more and a field, and its centre height.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-setting-a-distance-moves-the-selected-frame}
 */
function Selected({
  size,
  distances,
  centre,
  unit,
  dispatch,
  onRemove,
}: {
  size: string;
  distances: Record<Side, Distance | null>;
  centre: number | null;
  unit: Unit;
  dispatch: Dispatch;
  onRemove: () => void;
}) {
  const id = useId();
  const [drafts, setDrafts] = useState<Partial<Record<Side, string>>>({});
  const out = outside(size);
  const stepWord = unit === "cm" ? "1 cm" : "¼ in";

  function commit(side: Side, text: string) {
    setDrafts((all) => {
      const rest = { ...all };
      delete rest[side];
      return rest;
    });
    dispatch({ type: "distance", side, text, unit });
  }

  return (
    <div className="wf-sel">
      <div className="wf-sel-head">
        <div className="wf-sel-name">
          <span className="wf-sel-size">{size} frame</span>
          <span className="wf-muted font-mono">
            <Both {...out} /> on the wall
          </span>
        </div>
        <button
          type="button"
          className="wf-ibtn wf-ibtn-ghost"
          aria-label={`Remove the ${size} frame`}
          onClick={onRemove}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <fieldset className="wf-rows">
        <legend className="fs-label">Distances</legend>
        {SIDES.map((side) => {
          const d = distances[side];
          const field = `${id}-${side}`;
          const name = SIDE_NAME[side];
          return (
            <div key={side} className="wf-row" data-side={side}>
              <div className="wf-row-l">
                {d ? (
                  <label className="wf-row-name" htmlFor={field}>
                    {name}
                  </label>
                ) : (
                  <span className="wf-row-name">{name}</span>
                )}
                <span className="wf-row-to">
                  {d ? `to ${toWhat(d)}` : "Nothing marked on this side"}
                </span>
              </div>
              {d ? (
                <div className="wf-step">
                  <button
                    type="button"
                    className="wf-ibtn"
                    aria-label={`${name}: ${stepWord} less`}
                    onClick={() => dispatch({ type: "step", side, direction: -1, unit })}
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
                      value={drafts[side] ?? writeNumber(d.value, unit)}
                      onChange={(event) =>
                        setDrafts((all) => ({ ...all, [side]: event.target.value }))
                      }
                      onBlur={(event) => {
                        if (drafts[side] !== undefined) commit(side, event.target.value);
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return;
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
                    aria-label={`${name}: ${stepWord} more`}
                    onClick={() => dispatch({ type: "step", side, direction: 1, unit })}
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
      {centre !== null ? (
        <p className="wf-centre">
          Centre:{" "}
          <span className="font-mono font-medium">
            <U in={writeDistance(centre, "in")} cm={writeDistance(centre, "cm")} />
          </span>{" "}
          from the floor
        </p>
      ) : null}
    </div>
  );
}

/**
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-start-over-asks-first}
 */
function ResetDialog({ state, dispatch }: { state: WallState; dispatch: Dispatch }) {
  const photo = state.mode !== "sample" && state.photo;
  return (
    <ConfirmDialog
      title="Start over?"
      text="This takes the frames off the wall and clears the scale."
      actions={
        photo
          ? [
              {
                label: "Start over with this photo",
                onClick: () => dispatch({ type: "restartPhoto" }),
              },
              { label: "Back to the sample room", onClick: () => dispatch({ type: "toSample" }) },
            ]
          : [{ label: "Reset the sample room", onClick: () => dispatch({ type: "toSample" }) }]
      }
      onCancel={() => dispatch({ type: "cancelReset" })}
    />
  );
}
