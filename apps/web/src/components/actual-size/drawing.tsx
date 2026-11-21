import { CM_PER_INCH, type Size, type Unit } from "@framesizes/sizes";
import type { CSSProperties, ReactNode, Ref, UIEvent } from "react";

import { U } from "@/components/ui/u";

import { RULER } from "./state";

/*
 * The 1:1 drawing: a scrolling box with rulers and the frame at the scale, and the small map of the
 * whole size beside the part on screen.
 * {@link openspec/specs/actual-size/spec.md#requirement-the-desktop-box-shows-the-size-at-11}
 */

interface Tick {
  at: number;
  major: boolean;
  label: string;
}

/** Half-unit ticks from the box's corner; whole units labelled, every 2 cm when a centimetre is under 30 px. */
export function ticks(length: number, scale: number, unit: Unit): Tick[] {
  const per = unit === "in" ? scale : scale / CM_PER_INCH;
  const every = unit === "cm" && per < 30 ? 2 : 1;
  const step = per / 2;
  const out: Tick[] = [];
  if (!(step > 0)) return out;
  for (let i = 1; RULER + i * step <= length; i++) {
    const major = i % 2 === 0;
    const value = i / 2;
    out.push({
      at: RULER + i * step,
      major,
      label: major && value % every === 0 ? `${value}` : "",
    });
  }
  return out;
}

/**
 * {@link openspec/specs/actual-size/spec.md#requirement-every-size-shows-in-the-visitors-unit}
 */
function Rulers({ w, h, scale, unit }: { w: number; h: number; scale: number; unit: Unit }) {
  return (
    <>
      <svg className="as-rx" width={w} height={RULER} aria-hidden="true" data-axis="x">
        {ticks(w, scale, unit).map((t) => (
          <g key={t.at}>
            <line x1={t.at} x2={t.at} y1={RULER} y2={RULER - (t.major ? 12 : 8)} />
            {t.label ? (
              <text x={t.at + 3} y={13}>
                {t.label}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      <svg className="as-ry" width={RULER} height={h} aria-hidden="true" data-axis="y">
        {ticks(h, scale, unit).map((t) => (
          <g key={t.at}>
            <line y1={t.at} y2={t.at} x1={RULER} x2={RULER - (t.major ? 12 : 8)} />
            {t.label ? (
              <text x={13} y={t.at + 3} transform={`rotate(-90 13 ${t.at + 3})`}>
                {t.label}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      <div className="as-rc" />
    </>
  );
}

/** A size in both units, as the readout writes it. */
export function Dims({ inches, cm }: { inches: string; cm: string }) {
  return <U in={inches} cm={cm} />;
}

export interface StageProps {
  size: Size;
  scale: number;
  unit: Unit;
  /** The box's measured size in CSS px. */
  box: Size;
  label: string;
  /** The frame's tag: its size and whether the scale is checked. */
  tag?: ReactNode;
  /** What lines up with a card, a ruler or a sheet, drawn instead of the frame. */
  overlay?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
  ref?: Ref<HTMLDivElement>;
}

/** The scrolling box: rulers along the top and the left, the size from the corner after them. */
export function Stage({
  size,
  scale,
  unit,
  box,
  label,
  tag,
  overlay,
  className,
  style,
  onScroll,
  ref,
}: StageProps) {
  const frame = { w: size.w * scale, h: size.h * scale };
  // No frame until the client knows the scale, and none while a card, ruler or sheet lines up.
  const showFrame = !overlay && scale > 0;
  const w = Math.max(box.w - 2, showFrame ? RULER + frame.w + 32 : 0);
  const h = Math.max(box.h - 2, showFrame ? RULER + frame.h + 32 : 0);
  return (
    <div
      ref={ref}
      className={`as-stage${className ? ` ${className}` : ""}`}
      role="region"
      aria-label={label}
      tabIndex={0}
      style={style}
      onScroll={onScroll}
    >
      <div className="as-content" style={{ width: w, height: h }}>
        {overlay ??
          (showFrame ? (
            <div
              className="as-frame"
              data-testid="frame"
              style={{ left: RULER, top: RULER, width: frame.w, height: frame.h }}
            >
              {tag}
            </div>
          ) : null)}
        <Rulers w={w} h={h} scale={scale} unit={unit} />
      </div>
    </div>
  );
}

/** A rectangle in inches from the size's top-left corner. */
export interface Outline {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The whole size drawn small, with a dashed outline: the phone's glass or the part on screen.
 * {@link openspec/specs/actual-size/spec.md#requirement-the-phone-answer-step-comes-first}
 */
export function SizeMap({
  size,
  name,
  outline,
  outlineLabel,
  outlineCorner = "top-left",
  width,
  height,
  pad = 12,
  label,
  className,
}: {
  size: Size;
  /** The size's name, written on it; none on the mini map. */
  name?: string;
  outline: Outline;
  outlineLabel?: string;
  /** Where the outline's label sits: the phone's top-left, or the part on screen's bottom-right. */
  outlineCorner?: "top-left" | "bottom-right";
  width: number;
  height: number;
  pad?: number;
  label?: string;
  className?: string;
}) {
  const k = Math.min(
    (width - 2 * pad) / Math.max(size.w, outline.w),
    (height - 2 * pad) / Math.max(size.h, outline.h),
  );
  const rect = (r: Outline) => ({
    left: pad + r.x * k,
    top: pad + r.y * k,
    width: r.w * k,
    height: r.h * k,
  });
  return (
    <div
      className={`as-map-box${className ? ` ${className}` : ""}`}
      style={{ width: "100%", maxWidth: width, height }}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <div className="as-map-f" style={rect({ x: 0, y: 0, ...size })}>
        {name ? (
          <span className="as-map-l" style={{ left: 2, bottom: 2 }}>
            {name}
          </span>
        ) : null}
      </div>
      <div className="as-map-s" data-testid="map-outline" style={rect(outline)}>
        {outlineLabel ? (
          <span
            className="as-map-l"
            style={outlineCorner === "top-left" ? { left: 2, top: 2 } : { right: 2, bottom: 2 }}
          >
            {outlineLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
