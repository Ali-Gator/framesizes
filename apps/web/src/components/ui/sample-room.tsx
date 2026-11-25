import { type CSSProperties, useId } from "react";

const fill = (color: string, opacity?: number): CSSProperties =>
  opacity === undefined ? { fill: `var(--${color})` } : { fill: `var(--${color})`, opacity };
const outline: CSSProperties = {
  fill: "var(--paper)",
  stroke: "var(--line-strong)",
  strokeWidth: 0.35,
};
const stop = (color: string, opacity: number): CSSProperties => ({
  stopColor: `var(--${color})`,
  stopOpacity: opacity,
});

/** The plant's leaves: cx, cy, rx, ry, rotation. */
const LEAVES = [
  [123.5, 75, 2.2, 7, -28],
  [127, 71, 2.2, 8.5, -4],
  [130.5, 74, 2.2, 7.5, 22],
  [121.5, 79, 1.9, 5.5, -55],
  [132.5, 79, 1.9, 5.5, 55],
  [125, 69, 1.7, 6, -16],
] as const;

/** Light patches on the sofa: x, y, w, h, rx, opacity. */
const patch = (x: number, y: number, w: number, h: number, rx: number, opacity: number) => (
  <rect x={x} y={y} width={w} height={h} rx={rx} style={fill("paper", opacity)} />
);

/**
 * The v2 sample room (F7 canvas, Scene): a 144 × 96 in wall with a lamp, a plant, the floor and,
 * when asked, the sofa. One SVG stretched over its box; the site's colour tokens paint it.
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-frame-hangs-on-one-of-two-walls-seen-whole-or-close-up}
 */
export function SampleRoom({ sofa, className }: { sofa: boolean; className?: string }) {
  const id = useId();
  const glow = `${id}g`;
  const ceiling = `${id}c`;
  const side = `${id}s`;
  return (
    <svg
      className={className}
      viewBox="0 0 144 96"
      preserveAspectRatio="none"
      aria-hidden="true"
      data-room=""
    >
      <defs>
        <radialGradient id={glow} cx="17" cy="40" r="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={stop("tape", 0.24)} />
          <stop offset="0.55" style={stop("tape", 0.07)} />
          <stop offset="1" style={stop("tape", 0)} />
        </radialGradient>
        <linearGradient id={ceiling} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={stop("ink", 0.08)} />
          <stop offset="1" style={stop("ink", 0)} />
        </linearGradient>
        <linearGradient id={side} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.55" style={stop("ink", 0)} />
          <stop offset="1" style={stop("ink", 0.06)} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="144" height="96" style={fill("stage")} />
      <rect x="0" y="0" width="144" height="90" fill={`url(#${side})`} />
      <rect x="0" y="0" width="144" height="90" fill={`url(#${glow})`} />
      <rect x="0" y="0" width="144" height="9" fill={`url(#${ceiling})`} />
      <rect x="0" y="89.5" width="144" height="4" style={fill("paper")} />
      <rect x="0" y="89.5" width="144" height="0.35" style={fill("line-strong", 0.7)} />
      <rect x="0" y="93.5" width="144" height="2.5" style={fill("oak", 0.55)} />
      <rect x="0" y="94.7" width="144" height="0.18" style={fill("oak")} />
      <ellipse cx="17" cy="93.4" rx="5" ry="0.6" style={fill("ink", 0.14)} />
      <ellipse cx="127" cy="93.4" rx="6" ry="0.6" style={fill("ink", 0.14)} />
      <rect x="16.6" y="44" width="0.8" height="49" style={fill("furniture")} />
      <ellipse cx="17" cy="93" rx="3.6" ry="0.75" style={fill("furniture")} />
      <ellipse cx="17" cy="45" rx="5.6" ry="0.7" style={fill("tape", 0.75)} />
      <path d="M11 45 L23 45 L21 34.5 L13 34.5 Z" style={outline} />
      <g>
        {LEAVES.map(([cx, cy, rx, ry, r]) => (
          <ellipse
            key={`${cx} ${cy}`}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            transform={`rotate(${r} ${cx} ${cy})`}
            style={fill("leaf")}
          />
        ))}
      </g>
      <path d="M121.6 82.4 L132.4 82.4 L131.3 93.4 L122.7 93.4 Z" style={outline} />
      <rect x="121" y="81" width="12" height="1.6" rx="0.5" style={outline} />
      {sofa ? (
        <g data-sofa="">
          <ellipse cx="72" cy="93.6" rx="44" ry="0.9" style={fill("ink", 0.16)} />
          <rect x="30" y="62" width="84" height="20" rx="3" style={fill("furniture")} />
          {patch(33, 64, 25.4, 12, 2.5, 0.14)}
          {patch(59.3, 64, 25.4, 12, 2.5, 0.14)}
          {patch(85.6, 64, 25.4, 12, 2.5, 0.14)}
          <rect x="33" y="74" width="78" height="14" rx="2" style={fill("furniture")} />
          {patch(34, 74.6, 38.5, 4.2, 1.6, 0.12)}
          {patch(73.5, 74.6, 36.5, 4.2, 1.6, 0.12)}
          <rect x="31" y="85.6" width="82" height="2.4" rx="1" style={fill("ink", 0.1)} />
          <rect x="30" y="69" width="7" height="19" rx="2.5" style={fill("furniture")} />
          <rect x="107" y="69" width="7" height="19" rx="2.5" style={fill("furniture")} />
          {patch(30, 69, 7, 3, 1.5, 0.12)}
          {patch(107, 69, 7, 3, 1.5, 0.12)}
          <rect
            x="38"
            y="66.5"
            width="10"
            height="9"
            rx="2.5"
            transform="rotate(-9 43 71)"
            style={fill("oak", 0.75)}
          />
          <rect
            x="96"
            y="66.5"
            width="10"
            height="9"
            rx="2.5"
            transform="rotate(9 101 71)"
            style={fill("leaf", 0.75)}
          />
          <path d="M34 88 L36.4 88 L35.8 93.5 L34.6 93.5 Z" style={fill("ink", 0.55)} />
          <path d="M107.6 88 L110 88 L109.4 93.5 L108.2 93.5 Z" style={fill("ink", 0.55)} />
        </g>
      ) : null}
    </svg>
  );
}
