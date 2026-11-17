"use client";

import { CM_PER_INCH, type Hanger, type Unit } from "@framesizes/sizes";
import { useId, useState } from "react";

import { parseLength, writeDistance, writeNumber } from "@/components/frames-on-wall/display";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SizeTable } from "@/components/ui/size-table";
import { U } from "@/components/ui/u";

import { chipSize, count, noNailText } from "./copy";
import type { Dispatch } from "./gallery-wall";
import {
  boxOf,
  formHanger,
  framesOf,
  measureOf,
  placeOf,
  type PlannerFrame,
  type PlannerState,
} from "./state";

const TYPES = [
  { value: "one", label: "One nail" },
  { value: "two", label: "Two D-rings" },
] as const;

/** Space around the group on the map, in inches. */
const MARGIN = 6;
const pc = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`;

/** A typed drop or inset as the field shows it: ¼ in, or one decimal in cm. */
const fieldText = (inches: number | null, unit: Unit) =>
  inches === null
    ? ""
    : unit === "cm"
      ? String(Math.round(inches * CM_PER_INCH * 10) / 10)
      : writeNumber(inches, unit);

/**
 * The Nail marks view: the map zoomed to the group with Start and numbered badges, "Hanger for",
 * the type, the drop and inset, and the nail table.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-nail-marks-are-numbered-once-a-drop-is-typed}
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-a-frame-without-a-nail-says-why}
 */
export function NailMarks({
  state,
  unit,
  dispatch,
}: {
  state: PlannerState;
  unit: Unit;
  dispatch: Dispatch;
}) {
  const frames = framesOf(state);
  const m = measureOf(state, frames);
  const box = boxOf(frames);
  if (!m || !box) return null;
  const left = placeOf(state).wall.edges.left;
  const nails = m.nails;
  const anyDrop =
    nails.length > 0 ||
    state.hangers.all.drop !== null ||
    Object.values(state.hangers.byFrame).some((h) => h.drop !== null);
  const reasons = m.missing.filter(
    (x) => x.reason !== "no-drop" || state.hangers.byFrame[frames[x.frame]?.id ?? ""],
  );

  const map = {
    x: box.x - MARGIN,
    y: box.y - MARGIN,
    w: box.w + 2 * MARGIN,
    h: box.h + 2 * MARGIN,
  };
  const at = (x: number, y: number) => ({
    left: pc(x - map.x, map.w),
    bottom: pc(y - map.y, map.h),
  });
  const top = box.y + box.h;
  const label = nails.length
    ? `Nail marks: ${count(nails.length, "nail", "nails")} for ${count(frames.length, "frame", "frames")}`
    : `Nail marks: ${count(frames.length, "frame", "frames")}, no nails yet`;
  const scope = state.hangerFor === "all" ? null : frames.find((f) => f.id === state.hangerFor);

  let start = "Start is the group's top-left corner. Mark it where the group begins.";
  if (m.aboveFloor !== null && left !== null && m.left !== null) {
    start = `Start is the top-left corner: ${writeDistance(m.left, unit)} from the wall's left edge, ${writeDistance(m.aboveFloor, unit)} up from the floor.`;
  } else if (m.aboveFloor !== null) {
    start = `Start is the top-left corner, ${writeDistance(m.aboveFloor, unit)} up from the floor.`;
  }

  return (
    <div className="g-app">
      <div className="g-main">
        <div className="g-map" style={{ aspectRatio: `${map.w} / ${map.h}` }}>
          <div className="wf-scene" role="img" aria-label={label} />
          <div className="wf-layer" aria-hidden="true">
            {frames.map((f) => (
              <span
                key={f.id}
                className={`g-mframe${scope?.id === f.id ? " is-scope" : ""}`}
                style={{
                  ...at(f.rect.x, f.rect.y),
                  width: pc(f.rect.w, map.w),
                  height: pc(f.rect.h, map.h),
                }}
              >
                <span className="g-letter">{f.letter}</span>
              </span>
            ))}
            <span className="g-corner" style={at(box.x, top)}>
              <span className="g-corner-l">Start</span>
            </span>
            {nails.map((n, i) => (
              <span
                key={i}
                className="g-nail"
                style={{ left: pc(n.across + MARGIN, map.w), top: pc(n.down + MARGIN, map.h) }}
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>
        <p className="g-start">{start}</p>
      </div>

      <div className="g-side">
        <HangerForm
          key={`${state.hangerFor}-${unit}`}
          state={state}
          frames={frames}
          unit={unit}
          dispatch={dispatch}
        />
        {!nails.length && !anyDrop ? (
          <p className="wf-hint">Type the drop to number the nails.</p>
        ) : null}
        {nails.length ? (
          <SizeTable
            title="Nail positions"
            meta="From Start"
            selectable={false}
            columns={[
              { label: "Nail" },
              { label: "Frame" },
              { label: "Right", num: true },
              { label: "Down", num: true },
              { label: "Up from floor", num: true },
            ]}
            rows={nails.map((n, i) => ({
              id: `n${i + 1}`,
              label: <span className="g-n">{i + 1}</span>,
              cells: [
                `${frames[n.frame]?.letter ?? ""}${n.ring ? ` ${n.ring}` : ""}`,
                <Len key="r" inches={n.across} unit={unit} />,
                <Len key="d" inches={n.down} unit={unit} />,
                n.floor === null ? "—" : <Len key="f" inches={n.floor} unit={unit} />,
              ],
            }))}
          />
        ) : null}
        {anyDrop
          ? reasons.map(({ frame, reason }) => {
              const f = frames[frame];
              return f ? (
                <p key={f.id} className="g-err-line">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v5M12 16h.01" />
                  </svg>
                  <span>{noNailText(f.letter, reason, f.rect, unit)}</span>
                </p>
              ) : null;
            })
          : null}
      </div>
    </div>
  );
}

const Len = ({ inches, unit }: { inches: number; unit: Unit }) => (
  <>{writeDistance(inches, unit)}</>
);

/**
 * "Hanger for", the type and the drop and inset fields. A frame with no hanger of its own opens on
 * the last type with empty fields.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-hanger-type-carries-over-to-the-next-frame}
 */
function HangerForm({
  state,
  frames,
  unit,
  dispatch,
}: {
  state: PlannerState;
  frames: PlannerFrame[];
  unit: Unit;
  dispatch: Dispatch;
}) {
  const id = useId();
  const hanger: Hanger = formHanger(state);
  const [drop, setDrop] = useState(() => fieldText(hanger.drop, unit));
  const [inset, setInset] = useState(() =>
    fieldText(hanger.kind === "two" ? hanger.inset : null, unit),
  );
  const own = state.hangerFor !== "all" && Boolean(state.hangers.byFrame[state.hangerFor]);
  const frame = frames.find((f) => f.id === state.hangerFor) ?? null;
  const bad = (text: string) => text.trim() !== "" && parseLength(text, unit) === null;
  const reason = frame
    ? measureOf(state, frames)?.missing.find((x) => frames[x.frame]?.id === frame.id)?.reason
    : undefined;

  const dropError = bad(drop)
    ? "Type a number, like 2 or 2 1/2."
    : frame && reason === "drop-out-of-range"
      ? `The drop has to be under ${writeDistance(frame.rect.h, unit)}, the frame's height on the wall.`
      : null;
  const insetError = bad(inset)
    ? "Type a number, like 1 1/2."
    : frame && reason === "inset-out-of-range"
      ? `The inset has to be between 0 and ${writeDistance(frame.rect.w / 2, unit)}, half the frame's width.`
      : null;

  return (
    <div className="g-hform">
      <div className="fs-field">
        <label className="fs-label" htmlFor={`${id}-for`}>
          Hanger for
        </label>
        <select
          id={`${id}-for`}
          className="g-select"
          value={state.hangerFor}
          onChange={(event) => dispatch({ type: "hangerFor", for: event.target.value })}
        >
          <option value="all">All frames</option>
          {frames.map((f) => (
            <option key={f.id} value={f.id}>
              Frame {f.letter} · {chipSize(f.size)}
              {state.hangers.byFrame[f.id] ? " (its own)" : ""}
            </option>
          ))}
        </select>
      </div>
      <SegmentedControl
        label="Hanger type"
        options={TYPES}
        value={hanger.kind}
        onChange={(kind) => dispatch({ type: "hangerType", kind })}
      />
      <div className="g-hrow">
        <div className="g-hfields">
          <Field
            id={`${id}-drop`}
            label="Drop"
            value={drop}
            hint={
              hanger.kind === "one"
                ? "Top edge down to the wire pulled tight, or to the sawtooth."
                : "Top edge down to the D-ring."
            }
            error={dropError}
            onChange={(text) => {
              setDrop(text);
              dispatch({ type: "hangerField", field: "drop", text, unit });
            }}
          />
          {hanger.kind === "two" ? (
            <Field
              id={`${id}-inset`}
              label="Inset"
              value={inset}
              hint="Side of the frame in to the middle of the D-ring."
              error={insetError}
              onChange={(text) => {
                setInset(text);
                dispatch({ type: "hangerField", field: "inset", text, unit });
              }}
            />
          ) : null}
        </div>
        {hanger.kind === "one" ? (
          <svg
            className="g-hico"
            viewBox="0 0 100 76"
            role="img"
            aria-label="Back of a frame: the drop runs from the top edge down to the wire pulled tight."
          >
            <rect
              x="4"
              y="4"
              width="92"
              height="68"
              rx="2"
              className="g-ico-frame"
              strokeWidth="4"
            />
            <path
              d="M16 34 Q50 52 84 34"
              fill="none"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="g-ico-muted"
            />
            <path
              d="M16 34 L50 20 L84 34"
              fill="none"
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="g-ico-ink"
            />
            <line x1="62" y1="6" x2="62" y2="20" strokeWidth="4" className="g-ico-tape" />
            <line x1="57" y1="6" x2="67" y2="6" strokeWidth="2" className="g-ico-ink" />
            <line x1="52" y1="20" x2="67" y2="20" strokeWidth="2" className="g-ico-ink" />
          </svg>
        ) : (
          <svg
            className="g-hico"
            viewBox="0 0 100 76"
            role="img"
            aria-label="Back of a frame with two D-rings: the drop runs from the top edge to a ring, the inset from the side to the ring's middle."
          >
            <rect
              x="4"
              y="4"
              width="92"
              height="68"
              rx="2"
              className="g-ico-frame"
              strokeWidth="4"
            />
            <path
              d="M18 26 a6 6 0 0 1 12 0 v5 h-12 z"
              fill="none"
              strokeWidth="2.5"
              className="g-ico-ink"
            />
            <path
              d="M70 26 a6 6 0 0 1 12 0 v5 h-12 z"
              fill="none"
              strokeWidth="2.5"
              className="g-ico-ink"
            />
            <line x1="24" y1="6" x2="24" y2="20" strokeWidth="4" className="g-ico-tape" />
            <line x1="19" y1="6" x2="29" y2="6" strokeWidth="2" className="g-ico-ink" />
            <line x1="19" y1="20" x2="29" y2="20" strokeWidth="2" className="g-ico-ink" />
            <line x1="6" y1="46" x2="24" y2="46" strokeWidth="4" className="g-ico-tape" />
            <line x1="6" y1="41" x2="6" y2="51" strokeWidth="2" className="g-ico-ink" />
            <line x1="24" y1="41" x2="24" y2="51" strokeWidth="2" className="g-ico-ink" />
          </svg>
        )}
      </div>
      {own ? (
        <div>
          <Button variant="ghost" onClick={() => dispatch({ type: "sameAsAll" })}>
            Same as all frames
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  hint,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  hint: string;
  error: string | null;
  onChange: (text: string) => void;
}) {
  return (
    <div className="fs-field">
      <label className="fs-label" htmlFor={id}>
        {label}
      </label>
      <span className="wf-num wf-num-wide">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-hint`}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="wf-u" aria-hidden="true">
          <U in="in" cm="cm" />
        </span>
      </span>
      <p id={`${id}-hint`} className={error ? "wf-error" : "wf-hint"}>
        {error ?? hint}
      </p>
    </div>
  );
}
