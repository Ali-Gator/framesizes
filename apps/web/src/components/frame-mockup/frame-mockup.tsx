"use client";

import {
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent,
  useId,
  useReducer,
  useRef,
  useState,
} from "react";

import { PageLink } from "@/components/site/page-link";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { U } from "@/components/ui/u";

import {
  artLine,
  chipLabel,
  chipSub,
  ERROR_SUB,
  facts,
  fileName,
  FINISH_NAMES,
  frameValue,
  hint,
  isError,
  MOVE_LABEL,
  noRoom,
  noteText,
  panelValue,
  pictureLabel,
  PNG_FAILED,
  pngLine,
  pngSize,
} from "./copy";
import { makePng, save } from "./export";
import { inView, MockupPicture } from "./mockup-picture";
import { scene } from "./scene";
import { current, FINISHES, INITIAL, optionsFor, type Panel, PANELS, reducer } from "./state";
import { useArtwork } from "./use-artwork";

const MAT = [
  { value: "no", label: "No mat" },
  { value: "yes", label: "Mat" },
] as const;
const WALLS = [
  { value: "sofa", label: "Above the sofa" },
  { value: "plain", label: "Plain wall" },
] as const;
const VIEWS = [
  { value: "wall", label: "Whole wall" },
  { value: "close", label: "Close-up" },
] as const;
const PANEL_NAMES: Record<Panel, string> = {
  size: "Size",
  style: "Style",
  mat: "Mat",
  wall: "Wall",
};

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="mk-icon">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="mk-icon">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="mk-icon">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="mk-icon">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

/** Arrow keys on the cut side: +1 moves the artwork up or left in the frame. */
const KEY_DIRECTION: Record<"x" | "y", Record<string, number>> = {
  x: { ArrowLeft: 1, ArrowRight: -1 },
  y: { ArrowUp: 1, ArrowDown: -1 },
};

/**
 * F7's mockup generator: the picture, the upload, the size chips, the styles, the mat, the walls
 * and views, the answer and the PNG. One DOM for both layouts; CSS makes the desktop columns or
 * the phone column with its disclosure buttons.
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-widget-opens-on-the-sample-artwork-in-a-24x36}
 * {@link openspec/specs/frame-mockup/spec.md#requirement-a-desktop-shows-the-picture-beside-the-controls-a-phone-one-column-with-tabs}
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-frame-comes-in-four-styles}
 * {@link openspec/specs/frame-mockup/spec.md#requirement-a-file-can-be-dropped-on-a-desktop}
 */
export function FrameMockup() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const id = useId();
  const { pick, cancel } = useArtwork(state.art, dispatch);
  const input = useRef<HTMLInputElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [over, setOver] = useState(false);
  // Enter and leave fire for each child the file passes over; Safari gives no relatedTarget.
  const overCount = useRef(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; focus: number; ppi: number } | null>(null);

  const c = current(state);
  const s = scene(state);
  const options = optionsFor(state.art, state.mat);
  const room = !!optionsFor(state.art, true).find((o) => o.size.id === state.size)?.opening;
  const art = artLine(state.art);
  const value = { in: frameValue(c.option.size, "in"), cm: frameValue(c.option.size, "cm") };
  const lines = { in: facts(state, "in"), cm: facts(state, "cm") };
  const file = fileName(state.size);
  const group = (p: Panel) => `${id}-${p}`;
  const why = `${id}-why`;
  const open = (p: Panel) => `mk-group mk-g-${p}${state.panel === p ? " is-open" : ""}`;

  function onKey(event: KeyboardEvent) {
    const dir = KEY_DIRECTION[c.axis][event.key];
    if (!dir || c.still) return;
    event.preventDefault();
    dispatch({ type: "focus", delta: dir * (event.shiftKey ? c.step.shift : c.step.arrow) });
  }
  function onDown(event: PointerEvent<HTMLButtonElement>) {
    const box = stage.current?.getBoundingClientRect();
    if (c.still || !box) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      focus: state.focus,
      ppi: box.width / s.view.w,
    };
    setDragging(true);
  }
  function onMove(event: PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const moved = c.axis === "x" ? event.clientX - d.x : event.clientY - d.y;
    dispatch({ type: "drag", focus: d.focus - (moved / d.ppi) * c.step.shift });
  }
  function onUp() {
    drag.current = null;
    setDragging(false);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    overCount.current = 0;
    setOver(false);
    void pick(event.dataTransfer.files[0]);
  }

  async function download() {
    const node = stage.current;
    if (!node) return;
    dispatch({ type: "download", state: "making" });
    const blob = await makePng(node, s, c.crop, pngSize(state)).catch(() => null);
    if (!blob) {
      dispatch({ type: "download", state: "failed" });
      return;
    }
    save(blob, file);
    dispatch({ type: "download", state: "done" });
  }

  const status = state.reading ? (
    <p className="mk-wait">Opening your artwork…</p>
  ) : state.note && isError(state.note) ? (
    <p className="mk-err">
      <ErrorIcon />
      <span>
        {noteText(state.note, state.size)}
        <small>{ERROR_SUB}</small>
      </span>
    </p>
  ) : state.note ? (
    <p className="mk-note">
      <CheckIcon />
      <span>{noteText(state.note, state.size)}</span>
    </p>
  ) : null;

  return (
    <section className="fs-widget mk" aria-label="Poster mockup generator">
      <div className="mk-body">
        <div className="mk-left">
          <div className="mk-pic-wrap">
            <MockupPicture
              scene={s}
              finish={state.finish}
              src={state.art.url}
              label={pictureLabel(state)}
              dragging={dragging}
              stageRef={stage}
            >
              <button
                type="button"
                className="mk-move"
                aria-label={MOVE_LABEL}
                disabled={c.still}
                style={{ ...inView(s.opening, s.view), touchAction: c.still ? undefined : "none" }}
                onKeyDown={onKey}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
              />
            </MockupPicture>
            {state.reading ? (
              <div className="mk-busy" aria-hidden="true">
                <span>Opening your artwork…</span>
              </div>
            ) : null}
          </div>

          <div className="mk-tog">
            <div className={open("mat")} id={group("mat")}>
              <span className="mc-label" aria-hidden="true">
                Mat
              </span>
              <SegmentedControl
                label="Mat"
                size="sm"
                className="mk-seg"
                options={[
                  MAT[0],
                  { ...MAT[1], disabled: !room, describedBy: room ? undefined : why },
                ]}
                value={state.mat ? "yes" : "no"}
                onChange={(v) => dispatch({ type: "mat", on: v === "yes" })}
              />
              {room ? null : (
                <p className="mk-why" id={why}>
                  {noRoom(state.size)}
                </p>
              )}
            </div>
            <div className={open("wall")} id={group("wall")}>
              <div className="mk-ctl">
                <span className="mc-label" aria-hidden="true">
                  Wall
                </span>
                <SegmentedControl
                  label="Wall"
                  size="sm"
                  className="mk-seg"
                  options={WALLS}
                  value={state.placement}
                  onChange={(v) => dispatch({ type: "placement", placement: v })}
                />
              </div>
              <div className="mk-ctl">
                <span className="mc-label" aria-hidden="true">
                  View
                </span>
                <SegmentedControl
                  label="View"
                  size="sm"
                  className="mk-seg"
                  options={VIEWS}
                  value={state.view}
                  onChange={(v) => dispatch({ type: "view", view: v })}
                />
              </div>
            </div>
          </div>

          <p className="mk-hint">
            <U in={hint(c.still, "in")} cm={hint(c.still, "cm")} />
          </p>

          {/* {@link openspec/specs/frame-mockup/spec.md#requirement-the-answer-names-the-frame-in-both-units} */}
          <div className="mk-answer" aria-live="polite">
            <div className="mc-result">
              <span className="mc-label">Frame size</span>
              <span className="mc-result-value">
                <U in={value.in.value} cm={value.cm.value} />
              </span>
              {value.in.sub && value.cm.sub ? (
                <span className="mc-result-sub">
                  <U in={value.in.sub} cm={value.cm.sub} />
                </span>
              ) : null}
            </div>
            <ul className="mk-facts">
              {lines.in.map((line, i) => (
                <li key={i} className={line.whole ? "mk-whole" : undefined}>
                  <U in={line.text} cm={lines.cm[i]?.text ?? line.text} />
                </li>
              ))}
            </ul>
            <p className="mk-link">
              <PageLink id="F2">Your own wall? Try it on a photo in Frames on your wall.</PageLink>
            </p>
          </div>

          {/* {@link openspec/specs/frame-mockup/spec.md#requirement-the-png-saves-the-view-on-screen} */}
          <div className="mk-dl">
            <Button
              variant="primary"
              className="mk-dl-btn"
              disabled={state.download === "making"}
              onClick={() => void download()}
            >
              <DownloadIcon />
              {state.download === "making" ? "Making your PNG…" : "Download PNG"}
            </Button>
            <p className="mk-saved" role="status">
              {state.download === "done" ? (
                <>
                  <CheckIcon />
                  Saved <span className="font-mono">{file}</span>
                </>
              ) : state.download === "failed" ? (
                <span className="mk-failed">{PNG_FAILED}</span>
              ) : null}
            </p>
            <p className="mk-hint">{pngLine(state)}</p>
          </div>
        </div>

        <div className="mk-right">
          <div
            className={`mk-drop${over ? " is-over" : ""}${state.reading ? " is-busy" : ""}`}
            onDragEnter={(e) => {
              e.preventDefault();
              overCount.current++;
              setOver(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => {
              overCount.current = Math.max(0, overCount.current - 1);
              if (!overCount.current) setOver(false);
            }}
            onDrop={onDrop}
          >
            <span className="mk-drop-icon" aria-hidden="true">
              <UploadIcon />
            </span>
            <span className="mk-drop-t">
              <span className="mk-drop-title">
                {over
                  ? "Drop to use this file"
                  : state.reading
                    ? "Opening your artwork…"
                    : "Drop your artwork here"}
              </span>
              <span className="mk-drop-sub">JPEG or PNG. It stays on your device.</span>
            </span>
            <Button
              variant="secondary"
              className="mk-choose"
              disabled={state.reading}
              onClick={() => input.current?.click()}
            >
              <UploadIcon />
              Choose a JPEG or PNG
            </Button>
            <input
              ref={input}
              type="file"
              accept="image/*"
              hidden
              tabIndex={-1}
              onChange={(e) => {
                void pick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          <div className="mk-status" aria-live="polite">
            {status}
          </div>

          <div className="mk-line">
            <span className="mk-art-k">
              <span className="mk-art-t">{art.title}</span>
              <span className="mk-art-s">{art.sub}</span>
            </span>
            {state.art.sample ? null : (
              <Button
                variant="ghost"
                onClick={() => {
                  cancel();
                  dispatch({ type: "sample" });
                }}
              >
                Use the sample again
              </Button>
            )}
          </div>

          <div className="mk-tabs">
            {PANELS.map((p) => (
              <button
                key={p}
                type="button"
                className="mk-tab"
                aria-expanded={state.panel === p}
                aria-controls={group(p)}
                onClick={() => dispatch({ type: "panel", panel: p })}
              >
                <span className="mk-tab-k">{PANEL_NAMES[p]}</span>
                <span className="mk-tab-v">{panelValue(p, state)}</span>
              </button>
            ))}
          </div>

          {/* {@link openspec/specs/frame-mockup/spec.md#requirement-each-size-chip-shows-how-much-of-the-artwork-it-cuts} */}
          <div className={open("size")} id={group("size")}>
            <span className="mc-label mk-glabel" id={`${id}-size-l`}>
              Frame size
            </span>
            <div className="mk-chips" role="group" aria-labelledby={`${id}-size-l`}>
              {options.map((o) => (
                <button
                  key={o.size.id}
                  type="button"
                  className="mc-chip mk-chip"
                  aria-pressed={o.size.id === state.size}
                  disabled={!o.opening}
                  onClick={() => dispatch({ type: "size", id: o.size.id })}
                >
                  <span className="mk-chip-n">{chipLabel(o.size)}</span>{" "}
                  <span className="mk-chip-s">{chipSub(state.art, o)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={open("style")} id={group("style")}>
            <span className="mc-label mk-glabel" id={`${id}-style-l`}>
              Frame style
            </span>
            <div className="mk-fins" role="group" aria-labelledby={`${id}-style-l`}>
              {FINISHES.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`mk-fin fin-${f}`}
                  aria-pressed={state.finish === f}
                  onClick={() => dispatch({ type: "finish", finish: f })}
                >
                  <span className="mk-dot" aria-hidden="true" />
                  {FINISH_NAMES[f]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
