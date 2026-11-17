"use client";

import {
  findFrame,
  framesFor,
  KNOWN_THINGS,
  type KnownId,
  type Orientation,
  type Unit,
  writeSize,
} from "@framesizes/sizes";
import { type ChangeEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { U } from "@/components/ui/u";

import { FIXED_LENGTH, KNOWN_COPY } from "./copy";
import { markError, outsideSize } from "./display";
import { MarkStage } from "./stage";
import { lengthField, markLength, markOf, type PhotoAction, type PhotoSlice } from "./state";

/*
 * The wall photo's pieces, shared by the frame visualizer (F2) and the gallery wall planner (G1):
 * reading the file, the upload and three scale steps, the size picker and the confirm dialog.
 */

type PhotoDispatch = (action: PhotoAction) => void;

/** A size in both units: "18 × 22 in" / "45.7 × 55.9 cm". */
const Both = ({ w, h }: { w: number; h: number }) => (
  <U in={writeSize({ w, h }, "in")} cm={writeSize({ w, h }, "cm")} />
);

const ORIENTATIONS = [
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
  { value: "square", label: "Square" },
] as const satisfies readonly { value: Orientation; label: string }[];

/**
 * Reads a picked photo on the device: its size from an `<img>`, which applies the photo's EXIF
 * orientation. The object URL lives until the photo is replaced, the sample room returns, or the
 * page goes.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-a-wall-photo-is-used-on-the-device-only}
 */
export function usePhotoFile(state: PhotoSlice, dispatch: PhotoDispatch) {
  const [error, setError] = useState<string | null>(null);

  const photoUrl = state.photo?.url;
  useEffect(() => () => (photoUrl ? URL.revokeObjectURL(photoUrl) : undefined), [photoUrl]);

  // The step now, for a decode that finishes after the visitor has left the upload step.
  const modeRef = useRef(state.mode);
  useEffect(() => {
    modeRef.current = state.mode;
  }, [state.mode]);

  async function pickFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const photo = { url, width: img.naturalWidth, height: img.naturalHeight };
      if (modeRef.current !== "upload" || !photo.width || !photo.height) {
        URL.revokeObjectURL(url);
        return;
      }
      dispatch({ type: "photo", photo });
    } catch {
      URL.revokeObjectURL(url);
      setError("Your browser cannot open this photo. Try a JPEG or a PNG.");
    }
  }

  return { pickFile, error };
}

/**
 * Every catalog size in one orientation, each with its outside size; the dashed outline on the
 * wall shows where the picked one will go.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-frames-are-added-from-the-catalog-six-at-most}
 */
export function Picker({
  title,
  count,
  orientation,
  size,
  onOrientation,
  onSize,
  cta,
  onApply,
  onCancel,
  children,
}: {
  title: string;
  count: string;
  orientation: Orientation;
  size: string;
  onOrientation: (orientation: Orientation) => void;
  onSize: (size: string) => void;
  cta: string;
  onApply: () => void;
  onCancel: () => void;
  /** Options above the buttons. */
  children?: ReactNode;
}) {
  const frame = findFrame(size);
  const sizes = framesFor(orientation);
  return (
    <div className="wf-sel wf-picker">
      <div className="wf-sel-head">
        <p className="wf-ptitle">{title}</p>
        <span className="wf-muted">{count}</span>
      </div>
      <SegmentedControl
        label="Orientation"
        options={ORIENTATIONS}
        value={orientation}
        onChange={onOrientation}
      />
      <div className="wf-chips" role="group" aria-label="Frame size">
        {sizes.map((f) => (
          <button
            key={f.id}
            type="button"
            className="wf-chip wf-chip-2"
            aria-pressed={f.id === size}
            onClick={() => onSize(f.id)}
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
            <Both {...outsideSize(frame)} />
          </span>{" "}
          on the wall
        </p>
      ) : null}
      {children}
      <Button className="fs-btn-block" onClick={onApply}>
        {cta}
      </Button>
      <Button variant="secondary" className="fs-btn-block" onClick={onCancel}>
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
export function PhotoFlow({
  state,
  unit,
  dispatch,
  pickFile,
  error,
}: {
  state: PhotoSlice;
  unit: Unit;
  dispatch: PhotoDispatch;
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
  state: PhotoSlice;
  unit: Unit;
  dispatch: PhotoDispatch;
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
 * A modal question: a title, one line, the choices and Cancel. Escape cancels.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-start-over-asks-first}
 */
export function ConfirmDialog({
  title,
  text,
  actions,
  onCancel,
}: {
  title: string;
  text: string;
  actions: readonly { label: string; onClick: () => void; primary?: boolean }[];
  onCancel: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="wf-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <p id={titleId} className="wf-dlg-t">
        {title}
      </p>
      <p>{text}</p>
      {actions.map((a) => (
        <Button
          key={a.label}
          variant={a.primary ? "primary" : "secondary"}
          className="fs-btn-block"
          onClick={a.onClick}
        >
          {a.label}
        </Button>
      ))}
      <Button variant="ghost" className="fs-btn-block" onClick={onCancel}>
        Cancel
      </Button>
    </dialog>
  );
}
