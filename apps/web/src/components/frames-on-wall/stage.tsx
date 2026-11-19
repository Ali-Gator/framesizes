"use client";

import { MOULDING, type Point, type Rect, type SnapLines } from "@framesizes/sizes";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";

import { U } from "@/components/ui/u";

import { writeDistance } from "./display";
import type { Mark, PhotoInfo } from "./state";

export const pc = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`;

/** A rectangle in wall inches (bottom-left origin) as CSS on a `w` × `h` stage. */
const place = (r: Rect, w: number, h: number): CSSProperties => ({
  left: pc(r.x, w),
  bottom: pc(r.y, h),
  width: pc(r.w, w),
  height: pc(r.h, h),
});

/** A press that moves less than this many pixels is a tap. */
const TAP_PX = 4;

export interface StageFrame {
  id: string;
  size: string;
  rect: Rect;
  selected: boolean;
  /** The planner's letter, drawn in the frame's corner. */
  letter?: string;
  /** The frame button's name; "16x20 frame" by default. */
  name?: string;
}

export interface Dimension {
  side: "left" | "right" | "above" | "below";
  value: number;
}

/** The sample room's sofa and floor, drawn on DEMO_ROOM's 144 × 96 in wall (top-left origin). */
function SampleRoom() {
  return (
    <svg className="wf-scene" viewBox="0 0 144 96" preserveAspectRatio="none" aria-hidden="true">
      <rect x="0" y="93.5" width="144" height="2.5" fill="var(--line)" />
      <g fill="var(--furniture)">
        <rect x="30" y="62" width="84" height="20" rx="3" />
        <rect x="33" y="74" width="78" height="14" rx="2" />
        <rect x="30" y="69" width="7" height="19" rx="2.5" />
        <rect x="107" y="69" width="7" height="19" rx="2.5" />
        <rect x="33" y="88" width="2.5" height="5.5" />
        <rect x="108.5" y="88" width="2.5" height="5.5" />
      </g>
    </svg>
  );
}

/** The selected frame's distance lines and their labels, in wall inches. */
function dimensions(frame: Rect, dims: readonly Dimension[], w: number, h: number) {
  const cx = frame.x + frame.w / 2;
  const cy = frame.y + frame.h / 2;
  return dims
    .filter((d) => d.value >= 0.05)
    .map((d) => {
      const across = d.side === "left" || d.side === "right";
      let line: CSSProperties;
      let label: { x: number; y: number };
      if (across) {
        const x0 = d.side === "right" ? frame.x + frame.w : frame.x - d.value;
        line = { left: pc(x0, w), width: pc(d.value, w), bottom: pc(cy, h) };
        label = { x: x0 + d.value / 2, y: d.value < 14 ? frame.y + frame.h + 4 : cy };
      } else {
        const y0 = d.side === "above" ? frame.y + frame.h : frame.y - d.value;
        line = { bottom: pc(y0, h), height: pc(d.value, h), left: pc(cx, w) };
        label = { x: d.value < 10 ? frame.x + frame.w + 8 : cx, y: y0 + d.value / 2 };
      }
      return { side: d.side, across, value: d.value, line, label };
    });
}

/**
 * The wall and its frames at true scale: the drawing (`role="img"`, named by `label`) and a
 * sibling control layer the same size, holding a 44 px button per frame centred on it.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-the-widget-is-accessible}
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-small-frames-stay-easy-to-pick}
 */
export function WallStage({
  area,
  photo,
  label,
  frames,
  dims,
  preview,
  floor,
  onSelect,
  onDrag,
  onDrop,
  onKey,
  onFloor,
  focus,
  overlay,
}: {
  /** The drawn area in inches: the sample wall, or the photo at its scale. */
  area: { w: number; h: number };
  photo: PhotoInfo | null;
  label: string;
  frames: readonly StageFrame[];
  dims: readonly Dimension[];
  /** The size picker's outline, or a dragged frame's snap lines. */
  preview: Rect | null;
  /** The floor line in inches above the photo's bottom, and its pixel row. */
  floor: { inches: number; px: number } | null;
  onSelect: (id: string) => void;
  /** Wall-inch offsets from where the press started; returns the snap lines to draw. */
  onDrag: (id: string, dx: number, dy: number) => SnapLines;
  onDrop: (id: string) => void;
  onKey: (id: string, event: KeyboardEvent) => void;
  onFloor?: (px: number) => void;
  /** What the distance lines run from, when it is not the selected frame: the whole group. */
  focus?: Rect | null;
  /** More drawing over the frames, in the drawing's layer. */
  overlay?: ReactNode;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const press = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const [lines, setLines] = useState<SnapLines | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const selected = frames.find((f) => f.selected);

  const toInches = (event: PointerEvent, from: { x: number; y: number }) => {
    const box = stage.current?.getBoundingClientRect();
    if (!box?.width || !box.height) return { dx: 0, dy: 0 };
    return {
      dx: ((event.clientX - from.x) / box.width) * area.w,
      dy: (-(event.clientY - from.y) / box.height) * area.h,
    };
  };

  function down(id: string, event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    press.current = { id, x: event.clientX, y: event.clientY, moved: false };
  }
  function move(event: PointerEvent) {
    const p = press.current;
    if (!p) return;
    if (!p.moved && Math.hypot(event.clientX - p.x, event.clientY - p.y) < TAP_PX) return;
    if (!p.moved) {
      p.moved = true;
      setDragging(p.id);
    }
    const { dx, dy } = toInches(event, p);
    setLines(onDrag(p.id, dx, dy));
  }
  function up() {
    const p = press.current;
    press.current = null;
    setLines(null);
    setDragging(null);
    if (!p) return;
    if (p.moved) onDrop(p.id);
    else onSelect(p.id);
  }

  const floorPress = useRef<boolean>(false);
  function floorMove(event: PointerEvent) {
    const box = stage.current?.getBoundingClientRect();
    if (!floorPress.current || !box?.height || !photo || !onFloor) return;
    onFloor(((event.clientY - box.top) / box.height) * photo.height);
  }
  function floorKey(event: KeyboardEvent) {
    if (!floor || !onFloor) return;
    const step = event.shiftKey ? 10 : 1;
    const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
    if (!dy) return;
    event.preventDefault();
    onFloor(floor.px + dy);
  }

  const from = focus ?? selected?.rect;
  const dimEls = from && !preview ? dimensions(from, dims, area.w, area.h) : [];

  return (
    <div
      ref={stage}
      className="wf-stage"
      style={{ aspectRatio: `${area.w} / ${area.h}` }}
      data-dragging={dragging ?? undefined}
    >
      <div className="wf-drawing" role="img" aria-label={label}>
        {photo ? (
          // A blob: URL the browser already holds; next/image has nothing to optimise here.
          // eslint-disable-next-line @next/next/no-img-element
          <img className="wf-scene" src={photo.url} alt="Your wall photo" draggable={false} />
        ) : (
          <SampleRoom />
        )}
        {floor ? (
          <div className="wf-floor" style={{ bottom: pc(floor.inches, area.h) }}>
            <span className="wf-floor-l">Floor</span>
          </div>
        ) : null}
        {frames.map((f) => (
          <span
            key={f.id}
            className={`wf-frame${f.selected ? " is-sel" : ""}${dragging === f.id ? " is-drag" : ""}`}
            style={place(f.rect, area.w, area.h)}
          >
            <span
              className="wf-art"
              style={{
                left: pc(MOULDING, f.rect.w),
                right: pc(MOULDING, f.rect.w),
                top: pc(MOULDING, f.rect.h),
                bottom: pc(MOULDING, f.rect.h),
              }}
            />
            {f.letter ? (
              <span className="g-letter" aria-hidden="true">
                {f.letter}
              </span>
            ) : null}
          </span>
        ))}
        {overlay}
        {preview ? <span className="wf-ghost" style={place(preview, area.w, area.h)} /> : null}
        {dimEls.map((d) => (
          <span
            key={d.side}
            className={`wf-dim ${d.across ? "wf-dim-h" : "wf-dim-v"}`}
            style={d.line}
          />
        ))}
        {dimEls.map((d) => (
          <span
            key={`${d.side}-l`}
            className="wf-pill"
            style={{ left: pc(d.label.x, area.w), bottom: pc(d.label.y, area.h) }}
          >
            <U in={writeDistance(d.value, "in")} cm={writeDistance(d.value, "cm")} />
          </span>
        ))}
        {lines?.vertical.map((x) => (
          <span key={`v${x}`} className="wf-guide wf-guide-v" style={{ left: pc(x, area.w) }} />
        ))}
        {lines?.horizontal.map((y) => (
          <span key={`h${y}`} className="wf-guide wf-guide-h" style={{ bottom: pc(y, area.h) }} />
        ))}
      </div>

      <div className="wf-layer" onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {frames.map((f) => (
          <button
            key={f.id}
            type="button"
            className="wf-hit"
            data-frame={f.id}
            aria-label={f.name ?? `${f.size} frame`}
            aria-pressed={f.selected}
            style={{
              left: pc(f.rect.x + f.rect.w / 2, area.w),
              bottom: pc(f.rect.y + f.rect.h / 2, area.h),
              width: `max(${pc(f.rect.w, area.w)}, 44px)`,
              height: `max(${pc(f.rect.h, area.h)}, 44px)`,
              zIndex: f.selected ? 2 : 1,
            }}
            onPointerDown={(event) => down(f.id, event)}
            onClick={(event) => {
              // A pointer press selects on release; this is the keyboard's Enter and Space.
              if (event.detail === 0) onSelect(f.id);
            }}
            onKeyDown={(event) => onKey(f.id, event)}
          />
        ))}
        {floor && onFloor && photo ? (
          <button
            type="button"
            className="wf-handle wf-floor-handle"
            aria-label="Floor line"
            style={{ left: "24px", top: pc(floor.px, photo.height) }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              floorPress.current = true;
            }}
            onPointerMove={floorMove}
            onPointerUp={() => {
              floorPress.current = false;
            }}
            onPointerCancel={() => {
              floorPress.current = false;
            }}
            onLostPointerCapture={() => {
              floorPress.current = false;
            }}
            onKeyDown={floorKey}
          >
            <span className="wf-dot" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The photo with the mark between two ends, two 44 px handles and, while one moves or has focus,
 * a 3× loupe on its point. Points are full-size photo pixels.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-step-2-of-the-scale-places-the-two-ends}
 */
export function MarkStage({
  photo,
  mark,
  ends,
  onMove,
  children,
}: {
  photo: PhotoInfo;
  mark: Mark;
  /** The handles' names; none while the mark is only shown. */
  ends: readonly [string, string] | null;
  onMove: (end: 0 | 1, point: Point) => void;
  children?: ReactNode;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<0 | 1 | null>(null);
  const pressed = useRef<0 | 1 | null>(null);
  const [a, b] = mark;

  function toPhoto(event: PointerEvent): Point | null {
    const box = stage.current?.getBoundingClientRect();
    if (!box?.width || !box.height) return null;
    return {
      x: ((event.clientX - box.left) / box.width) * photo.width,
      y: ((event.clientY - box.top) / box.height) * photo.height,
    };
  }
  function key(end: 0 | 1, event: KeyboardEvent) {
    const step = event.shiftKey ? 10 : 1;
    const by: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const d = by[event.key];
    if (!d) return;
    event.preventDefault();
    const p = mark[end];
    onMove(end, { x: p.x + d[0], y: p.y + d[1] });
  }

  const point = active === null ? null : mark[active];
  const ratio = photo.height / photo.width;

  return (
    <div
      ref={stage}
      className="wf-stage"
      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
    >
      <div className="wf-drawing" role="img" aria-label="Your wall photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="wf-scene" src={photo.url} alt="Your wall photo" draggable={false} />
        <svg
          className="wf-scene"
          viewBox={`0 0 ${photo.width} ${photo.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="wf-mark-under" />
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="wf-mark-over" />
        </svg>
      </div>
      {ends ? (
        <div className="wf-layer">
          {([0, 1] as const).map((end) => (
            <button
              key={end}
              type="button"
              className={`wf-handle${active === end ? " is-active" : ""}`}
              aria-label={ends[end]}
              style={{ left: pc(mark[end].x, photo.width), top: pc(mark[end].y, photo.height) }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                pressed.current = end;
                setActive(end);
              }}
              onPointerMove={(event) => {
                const p = pressed.current === end ? toPhoto(event) : null;
                if (p) onMove(end, p);
              }}
              onPointerUp={() => {
                pressed.current = null;
              }}
              onPointerCancel={() => {
                pressed.current = null;
              }}
              onLostPointerCapture={() => {
                pressed.current = null;
              }}
              onFocus={() => setActive(end)}
              onBlur={() => setActive((now) => (now === end ? null : now))}
              onKeyDown={(event) => key(end, event)}
            >
              <span className="wf-dot" />
            </button>
          ))}
          {point ? (
            <div className="wf-loupe" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt=""
                draggable={false}
                style={{
                  width: "300cqw",
                  height: `${300 * ratio}cqw`,
                  left: `calc(48px - ${((300 * point.x) / photo.width).toFixed(3)}cqw)`,
                  top: `calc(48px - ${((300 * ratio * point.y) / photo.height).toFixed(3)}cqw)`,
                }}
              />
              <span className="wf-cross" />
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
