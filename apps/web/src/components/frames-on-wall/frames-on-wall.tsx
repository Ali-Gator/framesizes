"use client";

import {
  CM_PER_INCH,
  DEMO_ROOM,
  findFrame,
  framesFor,
  KNOWN_THINGS,
  type KnownId,
  type Orientation,
  photoSize,
  type Side,
  type SnapLines,
  toWholeCm,
  type Unit,
  writeSize,
} from "@framesizes/sizes";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
} from "react";

import { IfLive, PageLink } from "@/components/site/page-link";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { U } from "@/components/ui/u";
import { WidgetCard } from "@/components/ui/widget-card";
import { useUnit } from "@/lib/unit";

import { FIXED_LENGTH, KNOWN_COPY, withArticle } from "./copy";
import { markError, MAX_FRAMES, outsideSize, writeDistance, writeNumber } from "./display";
import { MarkStage, type StageFrame, WallStage } from "./stage";
import {
  centreHeight,
  type Distance,
  distancesOf,
  dragFrame,
  initialState,
  lengthField,
  markLength,
  markOf,
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
const ORIENTATIONS = [
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
  { value: "square", label: "Square" },
] as const satisfies readonly { value: Orientation; label: string }[];

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
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [live, setLive] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

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

  // The photo's object URL lives until it is replaced, the sample room returns, or the page goes.
  const photoUrl = state.photo?.url;
  useEffect(() => () => (photoUrl ? URL.revokeObjectURL(photoUrl) : undefined), [photoUrl]);

  // The step now, for a decode that finishes after the visitor has left the upload step.
  const modeRef = useRef(state.mode);
  useEffect(() => {
    modeRef.current = state.mode;
  }, [state.mode]);

  async function pickFile(file: File | undefined) {
    if (!file) return;
    setFileError(null);
    const url = URL.createObjectURL(file);
    try {
      // Applies the photo's EXIF orientation, as <img> does.
      const bitmap = await createImageBitmap(file);
      const photo = { url, width: bitmap.width, height: bitmap.height };
      bitmap.close();
      if (modeRef.current !== "upload") {
        URL.revokeObjectURL(url);
        return;
      }
      dispatch({ type: "photo", photo });
    } catch {
      URL.revokeObjectURL(url);
      setFileError("Your browser cannot open this photo. Try a JPEG or a PNG.");
    }
  }

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
          <Picker state={state} dispatch={dispatch} />
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
 * Every catalog size in one orientation, each with its outside size; the dashed outline on the
 * wall shows where the picked one will go.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-frames-are-added-from-the-catalog-six-at-most}
 */
function Picker({ state, dispatch }: { state: WallState; dispatch: Dispatch }) {
  const adding = state.adding;
  if (!adding) return null;
  const frame = findFrame(adding.size);
  const sizes = framesFor(adding.orientation);
  return (
    <div className="wf-sel wf-picker">
      <div className="wf-sel-head">
        <p className="wf-ptitle">Add a frame</p>
        <span className="wf-muted">
          {state.frames.length} of {MAX_FRAMES} frames on the wall
        </span>
      </div>
      <SegmentedControl
        label="Orientation"
        options={ORIENTATIONS}
        value={adding.orientation}
        onChange={(orientation) => dispatch({ type: "addOrientation", orientation })}
      />
      <div className="wf-chips" role="group" aria-label="Frame size">
        {sizes.map((f) => (
          <button
            key={f.id}
            type="button"
            className="wf-chip wf-chip-2"
            aria-pressed={f.id === adding.size}
            onClick={() => dispatch({ type: "addSize", size: f.id })}
          >
            <span>{f.id}</span>
            <span className="wf-chip-sub">
              <Both {...outsideSize(f)} />
            </span>
          </button>
        ))}
      </div>
      {frame ? (
        <p className="wf-muted">
          <span className="font-mono">
            <Both w={frame.w} h={frame.h} />
          </span>{" "}
          frame,{" "}
          <span className="font-mono">
            <Both {...outside(frame.id)} />
          </span>{" "}
          on the wall
        </p>
      ) : null}
      <Button className="fs-btn-block" onClick={() => dispatch({ type: "add" })}>
        Add {adding.size} to the wall
      </Button>
      <Button
        variant="secondary"
        className="fs-btn-block"
        onClick={() => dispatch({ type: "closeAdd" })}
      >
        Cancel
      </Button>
    </div>
  );
}

function BackBar({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div className="wf-stepbar">
      <button type="button" className="wf-ibtn wf-ibtn-ghost" aria-label="Back" onClick={onBack}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <span className="fs-label">{label}</span>
    </div>
  );
}

const lengthOf = (id: KnownId, unit: Unit): string => {
  const thing = KNOWN_THINGS.find((k) => k.id === id);
  if (!thing) return "—";
  if (thing.length.kind === "fixed") return FIXED_LENGTH[id]?.[unit] ?? "";
  if (thing.length.kind === "default") return `${thing.length[unit]} ${unit}`;
  return "—";
};

/**
 * Upload, then the three scale steps. The photo is read here and never sent.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-a-wall-photo-is-used-on-the-device-only}
 */
function PhotoFlow({
  state,
  unit,
  dispatch,
  pickFile,
  error,
}: {
  state: WallState;
  unit: Unit;
  dispatch: Dispatch;
  pickFile: (file: File | undefined) => void;
  error: string | null;
}) {
  const fileId = useId();
  const [over, setOver] = useState(false);
  const copy = KNOWN_COPY[state.known];

  if (state.mode === "upload" || !state.photo) {
    return (
      <div className="wf-flow">
        <label
          htmlFor={fileId}
          className={`wf-drop${over ? " is-over" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setOver(false);
            pickFile(event.dataTransfer.files[0]);
          }}
        >
          <span className="wf-drop-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
            </svg>
          </span>
          <span className="wf-drop-title">Add a photo of your wall</span>
          <span className="wf-drop-sub">
            Stand straight in front of the wall and take it head-on. The photo stays on your device.
          </span>
        </label>
        <input
          id={fileId}
          className="fs-sr"
          type="file"
          accept="image/*"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            void pickFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        {error ? (
          <p className="wf-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="wf-tips-box">
          <p className="wf-ptitle">For sizes you can trust</p>
          <ol className="wf-tips">
            <li>Stand in the middle, facing the wall, phone upright.</li>
            <li>
              Get one thing you know the size of in the shot: a door, the sofa, the whole wall or a
              sheet of paper.
            </li>
            <li>Keep that thing flat against the same wall.</li>
          </ol>
        </div>
        <div className="wf-actions">
          {state.photo && state.scale ? (
            <Button variant="secondary" onClick={() => dispatch({ type: "resume" })}>
              Back to my photo
            </Button>
          ) : null}
          <Button variant="ghost" onClick={() => dispatch({ type: "toSample" })}>
            Back to the sample room
          </Button>
        </div>
      </div>
    );
  }

  const photo = state.photo;
  const mark = markOf(state, photo);

  if (state.mode === "pick") {
    return (
      <div className="wf-flow">
        <BackBar label="Set the scale · 1 of 3" onBack={() => dispatch({ type: "back" })} />
        <fieldset className="wf-opts">
          <legend className="wf-q">What can you see on this wall?</legend>
          <div className="wf-opts-list">
            {KNOWN_THINGS.map((k) => (
              <label key={k.id} className="wf-opt">
                <span className="wf-opt-ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path
                      d={
                        KNOWN_COPY[k.id].direction === "up"
                          ? "M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"
                          : "M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"
                      }
                    />
                  </svg>
                </span>
                <span className="wf-opt-txt">
                  <span className="wf-opt-name">{k.name}</span>
                  <span className="wf-opt-edge">{k.edge}</span>
                </span>
                <span className="wf-opt-val">
                  <span className="font-mono">{lengthOf(k.id, unit)}</span>
                  <span className="wf-opt-note">{KNOWN_COPY[k.id].note}</span>
                </span>
                <input
                  type="radio"
                  name={`${fileId}-known`}
                  value={k.id}
                  checked={k.id === state.known}
                  onChange={() => dispatch({ type: "known", known: k.id })}
                />
              </label>
            ))}
          </div>
        </fieldset>
        <p className="wf-hint">Pick something flat against this wall.</p>
        <Button className="fs-btn-lg fs-btn-block" onClick={() => dispatch({ type: "toPlace" })}>
          Next
        </Button>
      </div>
    );
  }

  const across = copy.direction === "across";
  const ends = across
    ? (["Left end of the mark", "Right end of the mark"] as const)
    : (["Bottom end of the mark", "Top end of the mark"] as const);
  const length = Math.round(markLength(mark));
  const stage = (handles: boolean) => (
    <MarkStage
      photo={photo}
      mark={mark}
      ends={handles ? ends : null}
      onMove={(end, point) => dispatch({ type: "handle", end, point })}
    />
  );

  if (state.mode === "place") {
    return (
      <div className="wf-flow">
        <BackBar label="Set the scale · 2 of 3" onBack={() => dispatch({ type: "back" })} />
        <p className="wf-q">{copy.place}</p>
        {stage(true)}
        <p className="wf-readout">
          Your mark: <span className="font-mono font-medium">{length} px</span>
        </p>
        <p className="wf-hint">
          Pinch to zoom in for a closer look. Arrow keys move a dot 1 px, Shift + arrow 10 px.
        </p>
        <div className="wf-actions wf-actions-row">
          <Button variant="secondary" onClick={() => dispatch({ type: "back" })}>
            Back
          </Button>
          <Button className="wf-grow" onClick={() => dispatch({ type: "placeNext" })}>
            Next
          </Button>
        </div>
      </div>
    );
  }

  if (state.mode === "short") {
    const pct = Math.round(markError(Math.max(length, 1)) * 100);
    return (
      <div className="wf-flow">
        <BackBar label="Set the scale · 2 of 3" onBack={() => dispatch({ type: "back" })} />
        {stage(false)}
        <div className="wf-warn" role="alert">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" />
          </svg>
          <div>
            <p className="wf-warn-t">This mark is too short to trust</p>
            <p>
              {copy.short} is {length} px long in your photo. If either dot is 2 px off, every size
              changes by up to {pct}%.
            </p>
            <p>
              Mark something longer, like the door or the wall, or zoom in and place the dots again.
            </p>
          </div>
        </div>
        <Button className="fs-btn-lg fs-btn-block" onClick={() => dispatch({ type: "back" })}>
          Mark something longer
        </Button>
        <div>
          <Button variant="ghost" onClick={() => dispatch({ type: "useAnyway" })}>
            Use it anyway
          </Button>
        </div>
      </div>
    );
  }

  // Step 3: confirm the length.
  return <ConfirmStep state={state} unit={unit} dispatch={dispatch} stage={stage(false)} />;
}

function ConfirmStep({
  state,
  unit,
  dispatch,
  stage,
}: {
  state: WallState;
  unit: Unit;
  dispatch: Dispatch;
  stage: ReactNode;
}) {
  const id = useId();
  const copy = KNOWN_COPY[state.known];
  const hintId = `${id}-hint`;
  return (
    <div className="wf-flow">
      <BackBar label="Set the scale · 3 of 3" onBack={() => dispatch({ type: "back" })} />
      {stage}
      <p className="wf-q">{copy.fixed ? "Check the length" : copy.question}</p>
      {copy.fixed ? (
        <p className="wf-fixed">{copy.fixed[unit]}</p>
      ) : (
        <div className="fs-field">
          <label className="fs-label" htmlFor={id}>
            {copy.label}
          </label>
          <span className="wf-num wf-num-wide">
            <input
              id={id}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={lengthField(state, unit)}
              aria-invalid={state.lengthError || undefined}
              aria-describedby={hintId}
              onChange={(event) => dispatch({ type: "lengthText", text: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter") dispatch({ type: "setScale", unit });
              }}
            />
            <span className="wf-u" aria-hidden="true">
              <U in="in" cm="cm" />
            </span>
          </span>
          {state.lengthError ? (
            <p id={hintId} className="wf-error" role="alert">
              Enter the {state.known === "wall" ? "wall's width" : "length"} to set the scale.
            </p>
          ) : (
            <p id={hintId} className="wf-hint">
              {copy.hint?.[unit]}
            </p>
          )}
        </div>
      )}
      <Button
        className="fs-btn-lg fs-btn-block"
        onClick={() => dispatch({ type: "setScale", unit })}
      >
        Set the scale
      </Button>
    </div>
  );
}

/**
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-start-over-asks-first}
 */
function ResetDialog({ state, dispatch }: { state: WallState; dispatch: Dispatch }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
  }, []);
  const photo = state.mode !== "sample" && state.photo;
  return (
    <dialog
      ref={dialog}
      className="wf-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        dispatch({ type: "cancelReset" });
      }}
    >
      <p id={titleId} className="wf-dlg-t">
        Start over?
      </p>
      <p>This takes the frames off the wall and clears the scale.</p>
      {photo ? (
        <>
          <Button
            variant="secondary"
            className="fs-btn-block"
            onClick={() => dispatch({ type: "restartPhoto" })}
          >
            Start over with this photo
          </Button>
          <Button
            variant="secondary"
            className="fs-btn-block"
            onClick={() => dispatch({ type: "toSample" })}
          >
            Back to the sample room
          </Button>
        </>
      ) : (
        <Button
          variant="secondary"
          className="fs-btn-block"
          onClick={() => dispatch({ type: "toSample" })}
        >
          Reset the sample room
        </Button>
      )}
      <Button
        variant="ghost"
        className="fs-btn-block"
        onClick={() => dispatch({ type: "cancelReset" })}
      >
        Cancel
      </Button>
    </dialog>
  );
}
