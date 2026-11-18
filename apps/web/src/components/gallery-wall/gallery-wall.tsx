"use client";

import {
  CM_PER_INCH,
  findFrame,
  GALLERY_GAP,
  layoutTemplate,
  photoSize,
  type Rect,
  type Side,
  type SnapLines,
  TEMPLATES,
  toWholeCm,
  type Unit,
  DEMO_ROOM,
} from "@framesizes/sizes";
import dynamic from "next/dynamic";
import { type KeyboardEvent, useEffect, useId, useReducer, useRef, useState } from "react";

import { KNOWN_COPY } from "@/components/frames-on-wall/copy";
import { writeDistance, writeNumber } from "@/components/frames-on-wall/display";
import {
  ConfirmDialog,
  PhotoFlow,
  Picker,
  usePhotoFile,
} from "@/components/frames-on-wall/photo-flow";
import { type StageFrame, WallStage } from "@/components/frames-on-wall/stage";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { U } from "@/components/ui/u";
import { WidgetCard } from "@/components/ui/widget-card";
import { useUnit } from "@/lib/unit";

import { chipSize, count, targetName, warningText, WIDGET_TITLE } from "./copy";
import {
  type Action,
  boxOf,
  type Distance,
  distancesOf,
  dragFrame,
  framesOf,
  GAP_MAX,
  initialState,
  MAX_FRAMES,
  measureOf,
  placeOf,
  type PlannerFrame,
  type PlannerState,
  previewRect,
  reducer,
  selectedFrame,
  sizesOf,
  templateOf,
  warningOf,
} from "./state";

export type Dispatch = (action: Action) => void;

/** The Nail marks view loads on first use: the server HTML holds the Layout view only. */
const NailMarks = dynamic(() => import("./nail-marks").then((m) => m.NailMarks));

const SIDES: readonly Side[] = ["above", "below", "left", "right"];
const SIDE_NAME: Record<Side, string> = {
  above: "Above",
  below: "Below",
  left: "Left",
  right: "Right",
};
const ROOM = DEMO_ROOM.wall.bounds;
const VIEWS = [
  { value: "layout", label: "Layout" },
  { value: "nails", label: "Nail marks" },
] as const;

/** A length in both units, for HTML the server renders. */
export const Len = ({ inches }: { inches: number }) => (
  <U in={writeDistance(inches, "in")} cm={writeDistance(inches, "cm")} />
);
/** "46 × 27 in" / "117 × 69 cm", each side rounded as a distance. */
export const Dims = ({ w, h }: { w: number; h: number }) => (
  <U
    in={`${writeNumber(w, "in")} × ${writeNumber(h, "in")} in`}
    cm={`${writeNumber(w, "cm")} × ${writeNumber(h, "cm")} cm`}
  />
);

/** The furniture on the wall, by what was marked. */
export const furnitureWord = (state: PlannerState) =>
  state.mode === "sample" || state.known === "sofa" ? "sofa" : "bed";

/** The drawing's name: how many frames, above what, on which wall. */
function sceneLabel(state: PlannerState, frames: number, hasFurniture: boolean): string {
  const above = hasFurniture ? ` above a ${furnitureWord(state)}` : "";
  const where = state.mode === "sample" ? "" : " on your wall photo";
  return `Gallery wall layout: ${count(frames, "frame", "frames")}${above}${where}`;
}

const frameName = (f: PlannerFrame) => `Frame ${f.letter}, ${f.size} picture frame`;

/**
 * The live region's sentence: the selection and its distances.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-planner-is-accessible}
 */
function announcement(state: PlannerState, unit: Unit): string {
  const frames = framesOf(state);
  const frame = selectedFrame(state, frames);
  const d = distancesOf(state, frames);
  const furniture = furnitureWord(state);
  const parts = SIDES.flatMap((side) => {
    const one = d[side];
    return one
      ? [`${SIDE_NAME[side]} ${writeDistance(one.value, unit)} to ${targetName(one.to, furniture)}`]
      : [];
  });
  const who = frame ? `Frame ${frame.letter}, ${frame.size}` : "Whole group";
  return `${who}: ${parts.join(", ") || "nothing marked around it"}.`;
}

/**
 * The G1 gallery wall layout generator: a template of standard frames on the sample wall or the
 * visitor's photo, one gap, the group's size and distances, and nail marks. One client island,
 * prerendered in the Layout view.
 *
 * The Chrome extension renders it as a `panel` (no card edges, no title) or a `tab` (no title),
 * with its own saved state passed in. With no props it is the site's widget.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-planner-opens-on-the-default-template-above-the-sofa}
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-side-panel-holds-the-gallery-wall-planner}
 */
export function GalleryWall({
  variant = "page",
  state: outerState,
  dispatch: outerDispatch,
}: {
  variant?: "page" | "panel" | "tab";
  /** Controlled: both, or neither. */
  state?: PlannerState;
  dispatch?: Dispatch;
} = {}) {
  const unit = useUnit();
  // Runs either way, so the hook order never changes; ignored while controlled.
  const [ownState, ownDispatch] = useReducer(reducer, undefined, initialState);
  const controlled = outerState !== undefined && outerDispatch !== undefined;
  const state = controlled ? outerState : ownState;
  const dispatch = controlled ? outerDispatch : ownDispatch;
  const [live, setLive] = useState("");
  const { pickFile, error } = usePhotoFile(state, dispatch);

  // The e2e tests wait for this before they interact.
  useEffect(() => {
    document.documentElement.dataset.galleryReady = "true";
  }, []);

  const revision = useRef(state.revision);
  useEffect(() => {
    if (revision.current === state.revision) return;
    revision.current = state.revision;
    setLive(announcement(state, unit));
  }, [state, unit]);

  const flow = state.mode !== "sample" && state.mode !== "photo";
  const footer = (
    <span>
      Frames are drawn with a <U in="1 in" cm="2.5 cm" /> moulding.
      {state.mode === "sample" ? "" : " Your photo stays on this device."}
    </span>
  );
  const actions = flow ? null : (
    <SegmentedControl
      label="View"
      size="sm"
      options={VIEWS}
      value={state.view}
      onChange={(view) => dispatch({ type: "view", view })}
    />
  );
  const switching = state.confirmSwitch ? templateOf(state.confirmSwitch) : null;

  return (
    <WidgetCard
      title={variant === "page" ? WIDGET_TITLE : undefined}
      label={WIDGET_TITLE}
      actions={actions}
      footer={footer}
      className={variant === "panel" ? "wf g wf-panel" : "wf g"}
    >
      {flow ? (
        <PhotoFlow
          state={state}
          unit={unit}
          dispatch={dispatch}
          pickFile={pickFile}
          error={error}
        />
      ) : state.view === "nails" ? (
        <NailMarks state={state} unit={unit} dispatch={dispatch} />
      ) : (
        <LayoutView state={state} unit={unit} dispatch={dispatch} />
      )}
      {switching ? (
        <ConfirmDialog
          title={`Switch to ${switching.name}?`}
          text="This replaces your frames and any sizes or moves you changed."
          actions={[
            {
              label: "Switch template",
              primary: true,
              onClick: () => dispatch({ type: "confirmSwitch" }),
            },
          ]}
          onCancel={() => dispatch({ type: "cancelSwitch" })}
        />
      ) : null}
      {state.confirmReset ? (
        <ConfirmDialog
          title="Start over?"
          text="This puts the template back and clears the scale."
          actions={
            state.mode === "sample"
              ? [
                  {
                    label: "Reset the sample room",
                    onClick: () => dispatch({ type: "resetSample" }),
                  },
                ]
              : [
                  {
                    label: "Start over with this photo",
                    onClick: () => dispatch({ type: "restartPhoto" }),
                  },
                  {
                    label: "Back to the sample room",
                    onClick: () => dispatch({ type: "toSample" }),
                  },
                ]
          }
          onCancel={() => dispatch({ type: "cancelReset" })}
        />
      ) : null}
      <p className="fs-sr" aria-live="polite">
        {live}
      </p>
    </WidgetCard>
  );
}

/** The drawn area in inches: the sample wall, or the photo at its scale. */
export function areaOf(state: PlannerState): { w: number; h: number } {
  const { photo, scale } = state;
  return state.mode !== "sample" && photo && scale
    ? photoSize(photo, scale)
    : { w: ROOM.w, h: ROOM.h };
}

/**
 * The Layout view: the drawing, the warning and the summary; the templates, the gap, the
 * selection's distances and the actions.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-group-and-its-frames-move-like-f2s-frames}
 */
function LayoutView({
  state,
  unit,
  dispatch,
}: {
  state: PlannerState;
  unit: Unit;
  dispatch: Dispatch;
}) {
  const [drag, setDrag] = useState<{
    id: string | "group";
    rect?: Rect;
    dx: number;
    dy: number;
  } | null>(null);
  const fromRef = useRef<Rect | null>(null);
  const dragRef = useRef<typeof drag>(null);
  const sample = state.mode === "sample";
  const frames = framesOf(state);
  const groupSelected = state.selected === "group";
  const area = areaOf(state);
  const measure = measureOf(state, frames);
  const warning = warningOf(state, frames);
  const distances = distancesOf(state, frames);
  const selected = selectedFrame(state, frames);
  const box = boxOf(frames);
  const furniture = furnitureWord(state);
  const { wall, furniture: onWall } = placeOf(state);
  const floorInches = wall.edges.bottom;

  const shown: StageFrame[] = frames.map((f) => {
    let rect = f.rect;
    if (drag?.id === "group") rect = { ...rect, x: rect.x + drag.dx, y: rect.y + drag.dy };
    else if (drag?.id === f.id && drag.rect) rect = drag.rect;
    return {
      id: f.id,
      size: f.size,
      rect,
      selected: f.id === state.selected,
      letter: f.letter,
      name: frameName(f),
    };
  });
  const shownBox = boxOf(shown);
  const dims = SIDES.flatMap((side) => {
    const d = distances[side];
    return d ? [{ side, value: d.value }] : [];
  });

  function onDrag(id: string, dx: number, dy: number): SnapLines {
    const none = { vertical: [], horizontal: [] };
    if (groupSelected) {
      dragRef.current = { id: "group", dx, dy };
      setDrag(dragRef.current);
      return none;
    }
    const frame = frames.find((f) => f.id === id);
    if (!frame) return none;
    fromRef.current ??= frame.rect;
    const moved = dragFrame(state, id, fromRef.current, dx, dy);
    dragRef.current = { id, rect: moved.rect, dx, dy };
    setDrag(dragRef.current);
    return moved.lines;
  }
  function onDrop(id: string) {
    const last = dragRef.current;
    if (last?.id === "group") dispatch({ type: "moveGroup", dx: last.dx, dy: last.dy });
    else if (last?.rect) dispatch({ type: "place", id, rect: last.rect });
    fromRef.current = null;
    dragRef.current = null;
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
      if (groupSelected) dispatch({ type: "moveGroup", dx: d[0], dy: d[1] });
      else dispatch({ type: "nudge", id, dx: d[0], dy: d[1] });
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      dispatch({ type: "remove", id });
    }
  }

  const floor =
    !sample && state.photo && state.floor !== null && floorInches !== null
      ? { inches: floorInches, px: state.floor }
      : null;
  const warn = warning ? warningText(warning, unit) : null;
  const atCap = frames.length >= MAX_FRAMES;
  const overlay =
    groupSelected && shownBox ? (
      <span
        className="g-gbox"
        style={{
          left: pc(shownBox.x - 1, area.w),
          bottom: pc(shownBox.y - 1, area.h),
          width: pc(shownBox.w + 2, area.w),
          height: pc(shownBox.h + 2, area.h),
        }}
      />
    ) : null;

  return (
    <div className="g-app">
      <div className="g-main">
        <WallStage
          area={area}
          photo={sample ? null : state.photo}
          label={sceneLabel(state, frames.length, onWall !== null)}
          frames={shown}
          dims={drag ? [] : dims}
          preview={state.picker?.mode === "add" ? previewRect(state) : null}
          floor={floor}
          focus={groupSelected ? shownBox : null}
          overlay={overlay}
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
        {warn && warning ? (
          <div className="wf-warn" role="alert">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" />
            </svg>
            <div className="g-warn-in">
              <div>
                <p className="wf-warn-t">{warn.title}</p>
                <p>{warn.text}</p>
              </div>
              {warning.kind === "left" || warning.kind === "right" ? (
                <div>
                  <Button variant="secondary" onClick={() => dispatch({ type: "centre" })}>
                    Centre it on the wall
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        {!sample && state.floor === null ? (
          <div className="wf-tip">
            <span>Mark the floor line to see how high the group hangs.</span>
            <div>
              <Button variant="secondary" onClick={() => dispatch({ type: "markFloor" })}>
                Mark the floor
              </Button>
            </div>
          </div>
        ) : null}
        {measure ? (
          <div className="g-sum">
            <div className="g-sum-in">
              <dl className="g-sum-l">
                <div className="g-sum-i">
                  <dt>Size</dt>
                  <dd>
                    <Dims w={measure.width} h={measure.height} />
                  </dd>
                </div>
                <div className={`g-sum-i${measure.aboveFloor === null ? " is-none" : ""}`}>
                  <dt>Top edge</dt>
                  <dd>
                    {measure.aboveFloor === null ? (
                      "Not marked"
                    ) : (
                      <Len inches={measure.aboveFloor} />
                    )}
                  </dd>
                </div>
                <SidesItem left={measure.left} right={measure.right} />
              </dl>
              <div className="g-sum-go">
                <Button
                  variant="secondary"
                  className="fs-btn-block"
                  onClick={() => dispatch({ type: "view", view: "nails" })}
                >
                  Get nail marks
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="g-side">
        {state.picker ? (
          <PlannerPicker state={state} frames={frames} dispatch={dispatch} />
        ) : (
          <>
            <Templates state={state} dispatch={dispatch} />
            <GapRow state={state} unit={unit} dispatch={dispatch} />
            {Object.keys(state.moved).length ? (
              <p className="g-note">Changing the gap or a size lines the frames up again.</p>
            ) : null}
            <div className="wf-on">
              <span className="fs-label" id="g-on-label">
                Select
              </span>
              <div className="wf-chips" role="group" aria-labelledby="g-on-label">
                <button
                  type="button"
                  className="wf-chip"
                  aria-pressed={groupSelected}
                  onClick={() => dispatch({ type: "select", id: "group" })}
                >
                  All {frames.length}
                </button>
                {frames.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="wf-chip"
                    aria-pressed={f.id === state.selected}
                    onClick={() => dispatch({ type: "select", id: f.id })}
                  >
                    {f.letter} · {chipSize(f.size)}
                  </button>
                ))}
              </div>
            </div>
            <Selection
              key={`${state.selected}-${unit}`}
              frame={selected}
              box={box}
              sizes={groupSelected ? sizesOf(frames) : []}
              distances={distances}
              furniture={furniture}
              unit={unit}
              canRemove={frames.length > 1}
              dispatch={dispatch}
            />
            <div className="wf-actions">
              {sample ? (
                <Button onClick={() => dispatch({ type: "upload" })}>Use my wall photo</Button>
              ) : (
                <Button variant="secondary" onClick={() => dispatch({ type: "upload" })}>
                  Change photo
                </Button>
              )}
              {atCap ? null : (
                <Button
                  variant="secondary"
                  onClick={() => dispatch({ type: "openPicker", mode: "add" })}
                >
                  Add a frame
                </Button>
              )}
              <Button variant="ghost" onClick={() => dispatch({ type: "openReset" })}>
                Start over
              </Button>
              {atCap ? (
                <p className="wf-cap g-cap">That&apos;s 12 frames, the most the planner holds.</p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const pc = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`;

function SidesItem({ left, right }: { left: number | null; right: number | null }) {
  if (left === null && right === null) {
    return (
      <div className="g-sum-i is-none">
        <dt>Left · right</dt>
        <dd>Not marked</dd>
      </div>
    );
  }
  const neg = (left ?? 0) < -0.01 || (right ?? 0) < -0.01;
  const side = (n: number | null, unit: Unit) =>
    n === null ? "—" : writeNumber(n, unit).replace("-", "−");
  return (
    <div className={`g-sum-i${neg ? " is-neg" : ""}`}>
      <dt>Left · right</dt>
      <dd>
        <U
          in={`${side(left, "in")} · ${side(right, "in")} in`}
          cm={`${side(left, "cm")} · ${side(right, "cm")} cm`}
        />
      </dd>
    </div>
  );
}

/** Each template laid out once, at the default gap, for its picture. */
const THUMBS = TEMPLATES.flatMap((t) => {
  const layout = layoutTemplate(t.stack, GALLERY_GAP, DEMO_ROOM.wall, null);
  return layout ? [{ t, layout }] : [];
});

/**
 * The five templates as to-scale pictures, one radio each.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-a-template-is-picked-from-its-picture}
 */
function Templates({ state, dispatch }: { state: PlannerState; dispatch: Dispatch }) {
  const name = useId();
  const current = templateOf(state.template);
  return (
    <fieldset className="g-tpls">
      <legend>
        <span className="fs-label">Template</span>{" "}
        <span className="g-tpl-cur">{current?.name}</span>
      </legend>
      <div className="g-tgrid">
        {THUMBS.map(({ t, layout }) => {
          const { box } = layout;
          const s = Math.min(44 / box.h, 64 / box.w);
          return (
            <label key={t.id} className="g-tpl" title={t.name}>
              <input
                type="radio"
                name={name}
                value={t.id}
                checked={t.id === state.template}
                aria-label={t.name}
                onChange={() => dispatch({ type: "template", id: t.id })}
              />
              <span
                className="g-thumb"
                style={{ width: box.w * s, aspectRatio: `${box.w} / ${box.h}` }}
                aria-hidden="true"
              >
                {layout.frames.map((f, i) => (
                  <i
                    key={i}
                    style={{
                      left: pc(f.rect.x - box.x, box.w),
                      bottom: pc(f.rect.y - box.y, box.h),
                      width: pc(f.rect.w, box.w),
                      height: pc(f.rect.h, box.h),
                    }}
                  />
                ))}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * One gap for every frame, with less, more and a field; out of range, it says the range.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-one-gap-spaces-every-frame}
 */
function GapRow({
  state,
  unit,
  dispatch,
}: {
  state: PlannerState;
  unit: Unit;
  dispatch: Dispatch;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const stepWord = unit === "cm" ? "1 cm" : "¼ in";
  const commit = (text: string) => {
    setDraft(null);
    dispatch({ type: "gapText", text, unit });
  };
  return (
    <div className="g-gaps">
      <div className="g-gap">
        <label className="wf-row-name" htmlFor={id}>
          Gap between frames
        </label>
        <div className="wf-step">
          <button
            type="button"
            className="wf-ibtn"
            aria-label={`Gap: ${stepWord} less`}
            onClick={() => dispatch({ type: "gapStep", direction: -1, unit })}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14" />
            </svg>
          </button>
          <span className="wf-num">
            <input
              id={id}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={draft ?? writeNumber(state.gap, unit)}
              aria-invalid={state.gapError || undefined}
              aria-describedby={state.gapError ? `${id}-err` : undefined}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={(event) => {
                if (draft !== null) commit(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" || draft === null) return;
                event.preventDefault();
                commit(event.currentTarget.value);
              }}
            />
            <span className="wf-u" aria-hidden="true">
              <U in="in" cm="cm" />
            </span>
          </span>
          <button
            type="button"
            className="wf-ibtn"
            aria-label={`Gap: ${stepWord} more`}
            onClick={() => dispatch({ type: "gapStep", direction: 1, unit })}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
      {state.gapError ? (
        <p id={`${id}-err`} className="wf-error" role="alert">
          Type a gap from 0 to {writeDistance(GAP_MAX, unit)}.
        </p>
      ) : null}
    </div>
  );
}

/**
 * The selected frame or the whole group: its size, "Change size" for a frame, and its four
 * distances with less, more and a field.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-group-and-its-frames-move-like-f2s-frames}
 */
function Selection({
  frame,
  box,
  sizes,
  distances,
  furniture,
  unit,
  canRemove,
  dispatch,
}: {
  frame: PlannerFrame | null;
  box: Rect | null;
  /** The whole group's sizes, largest first; empty with one frame selected. */
  sizes: { size: string; frames: PlannerFrame[] }[];
  distances: Record<Side, Distance | null>;
  furniture: string;
  unit: Unit;
  canRemove: boolean;
  dispatch: Dispatch;
}) {
  const id = useId();
  const [drafts, setDrafts] = useState<Partial<Record<Side, string>>>({});
  const stepWord = unit === "cm" ? "1 cm" : "¼ in";
  const size = frame ? frame.rect : box;

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
        <div className="g-sel-name">
          <span className="wf-sel-size">
            {frame ? `${frame.letter} · ${chipSize(frame.size)}` : "Whole group"}
          </span>
          {size ? (
            <span className="wf-muted font-mono">
              <Dims w={size.w} h={size.h} />
              {frame ? " on the wall" : null}
            </span>
          ) : null}
        </div>
        {frame && canRemove ? (
          <button
            type="button"
            className="wf-ibtn wf-ibtn-ghost"
            aria-label={`Remove frame ${frame.letter}`}
            onClick={() => dispatch({ type: "remove", id: frame.id })}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>
      {frame ? (
        <div>
          <Button
            variant="secondary"
            onClick={() => dispatch({ type: "openPicker", mode: "size" })}
          >
            Change size
          </Button>
        </div>
      ) : null}
      {sizes.length ? <GroupSizes sizes={sizes} unit={unit} dispatch={dispatch} /> : null}
      <fieldset className="wf-rows">
        <legend className="fs-label">Distances</legend>
        {SIDES.map((side) => {
          const d = distances[side];
          const field = `${id}-${side}`;
          const name = SIDE_NAME[side];
          const neg = d !== null && d.value < -0.01;
          return (
            <div key={side} className={`wf-row${neg ? " is-neg" : ""}`} data-side={side}>
              <div className="wf-row-l">
                {d ? (
                  <label className="wf-row-name" htmlFor={field}>
                    {name}
                  </label>
                ) : (
                  <span className="wf-row-name">{name}</span>
                )}
                <span className="wf-row-to">
                  {d
                    ? `${neg ? "past" : "to"} ${targetName(d.to, furniture)}`
                    : "Nothing marked on this side"}
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
    </div>
  );
}

/** "A, B, D and E". */
const letters = (frames: readonly PlannerFrame[]) => {
  const all = frames.map((f) => f.letter);
  return all.length > 1 ? `${all.slice(0, -1).join(", ")} and ${all.at(-1)}` : (all[0] ?? "");
};

/** A catalog size as it hangs, unframed: "8 × 10 in" / "20 × 25 cm". */
function nominal(size: string, unit: Unit): string {
  const f = findFrame(size);
  return f ? `${writeNumber(f.w, unit)} × ${writeNumber(f.h, unit)} ${unit}` : chipSize(size);
}

/**
 * With the whole group selected: the layout's sizes, each with its frames and "Change", which
 * opens the picker for every frame of that size.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-a-frames-size-is-changed-in-place}
 */
function GroupSizes({
  sizes,
  unit,
  dispatch,
}: {
  sizes: { size: string; frames: PlannerFrame[] }[];
  unit: Unit;
  dispatch: Dispatch;
}) {
  const id = useId();
  return (
    <div className="g-gsizes">
      <p className="fs-label" id={id}>
        Sizes in this layout
      </p>
      <ul className="g-gs" aria-labelledby={id}>
        {sizes.map(({ size, frames }) => {
          const f = findFrame(size);
          return (
            <li key={size} className="g-gs-row">
              <div className="g-gs-name">
                <span className="g-gs-size">{f ? <Dims w={f.w} h={f.h} /> : chipSize(size)}</span>
                <span className="g-gs-of">
                  {frames.length === 1 ? "Frame" : "Frames"} {letters(frames)}
                </span>
              </div>
              <Button
                variant="secondary"
                aria-label={
                  frames.length === 1
                    ? `Change the ${nominal(size, unit)} frame`
                    : `Change all ${count(frames.length, "", `${nominal(size, unit)} frames`)}`
                }
                onClick={() => dispatch({ type: "openGroupSize", size })}
              >
                Change
              </Button>
            </li>
          );
        })}
      </ul>
      <p className="wf-muted">
        Change swaps every frame of that size and lays the template out again.
      </p>
    </div>
  );
}

/**
 * F2's size picker: "Add a frame" beside the selection, or a new size for the selected frame and,
 * by default, every other frame of its size.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-a-frames-size-is-changed-in-place}
 */
function PlannerPicker({
  state,
  frames,
  dispatch,
}: {
  state: PlannerState;
  frames: PlannerFrame[];
  dispatch: Dispatch;
}) {
  const { picker } = state;
  if (!picker) return null;
  const frame = selectedFrame(state, frames);
  const same = frame ? frames.filter((f) => f.id !== frame.id && f.size === frame.size).length : 0;
  const adding = picker.mode === "add";
  const group = picker.mode === "group-size" ? frames.filter((f) => f.size === picker.from) : [];
  return (
    <Picker
      title={
        adding
          ? "Add a frame"
          : `New size for ${group.length ? letters(group) : (frame?.letter ?? "")}`
      }
      count={`${frames.length} of ${MAX_FRAMES}`}
      orientation={picker.orientation}
      size={picker.size}
      onOrientation={(orientation) => dispatch({ type: "pickerOrientation", orientation })}
      onSize={(size) => dispatch({ type: "pickerSize", size })}
      cta={`${adding ? "Add" : "Use"} ${picker.size}`}
      onApply={() => dispatch({ type: "applyPicker" })}
      onCancel={() => dispatch({ type: "closePicker" })}
    >
      {picker.mode === "size" && frame && same > 0 ? (
        <label className="g-check">
          <input
            type="checkbox"
            checked={picker.all}
            onChange={(event) => dispatch({ type: "pickerAll", all: event.target.checked })}
          />
          Also the other {same} {chipSize(frame.size)} {same === 1 ? "frame" : "frames"}
        </label>
      ) : null}
    </Picker>
  );
}
