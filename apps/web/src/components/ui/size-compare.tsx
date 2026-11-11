import { writeSize, type Frame, type Unit } from "@framesizes/sizes";

import { STAGE } from "./scale-preview";

type CompareSize = Pick<Frame, "id" | "w" | "h" | "major">;

/** Label boxes closer than this (stage units) count as overlapping. */
// Labels are digits (no descenders): 18 units apart vertically clear 22-unit type; 70 across clear "11×17".
export const LABEL_GAP = { x: 70, y: 18 } as const;

interface Layout {
  scale: number;
  x0: number;
  base: number;
  /** Smallest area first. */
  small: CompareSize[];
  selected: CompareSize | undefined;
  labels: { id: string; x: number; y: number; text: string; inside: boolean }[];
}

/**
 * Every size from one bottom-left corner at one scale. Labels go to the selected size first, then
 * sizes marked major, then the rest, small to large; one that would overlap an earlier one is dropped.
 */
export function compareLayout(sizes: readonly CompareSize[], value: string): Layout {
  const maxW = Math.max(1, ...sizes.map((z) => z.w));
  const maxH = Math.max(1, ...sizes.map((z) => z.h));
  // 56 units stay clear at the top for the caption.
  const scale = Math.min((STAGE.width - 230) / maxW, (STAGE.height - 80) / maxH);
  const x0 = (STAGE.width - maxW * scale) / 2;
  const base = STAGE.height - 24;
  const selected = sizes.find((z) => z.id === value);
  const small = [...sizes].sort((a, b) => a.w * a.h - b.w * b.h);
  const inside = (z: CompareSize) => !!selected && z.w <= selected.w && z.h <= selected.h;
  const order = [
    ...(selected ? [selected] : []),
    ...small.filter((z) => z !== selected && z.major),
    ...small.filter((z) => z !== selected && !z.major),
  ];
  const labels: Layout["labels"] = [];
  for (const z of order) {
    const x = x0 + z.w * scale - 7;
    const y = base - z.h * scale + 18;
    if (labels.some((l) => Math.abs(l.x - x) < LABEL_GAP.x && Math.abs(l.y - y) < LABEL_GAP.y)) {
      continue;
    }
    labels.push({ id: z.id, x, y, text: `${z.w}×${z.h}`, inside: inside(z) });
  }
  return { scale, x0, base, small, selected, labels };
}

/**
 * Design system SizeCompare: nested outlines at one scale, the selected size filled.
 * {@link openspec/specs/frame-size-chart/spec.md#requirement-the-all-sizes-view-compares-every-listed-size}
 */
export function SizeCompare({
  sizes,
  value,
  unit,
  onSelect,
}: {
  sizes: readonly CompareSize[];
  value: string;
  unit: Unit;
  onSelect?: (id: string) => void;
}) {
  const { scale, x0, base, small, selected, labels } = compareLayout(sizes, value);
  const box = (z: CompareSize) => ({
    x: x0,
    y: base - z.h * scale,
    width: z.w * scale,
    height: z.h * scale,
  });
  const first = small[0];
  const last = small.at(-1);
  const range = first && last ? ` from ${first.id} to ${last.id} inches` : "";
  const name = `Standard frame sizes chart${range}${selected ? `, ${selected.id} highlighted` : ""}`;
  return (
    <figure className="fs-scale">
      <figcaption className="fs-scale-caption">Same scale</figcaption>
      <div className="fs-scale-stage">
        <svg
          viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={name}
        >
          {selected ? <rect className="cmp-fill" {...box(selected)} /> : null}
          {[...small].reverse().map((z) => (
            <rect
              key={z.id}
              data-size={z.id}
              className={selected && z.w <= selected.w && z.h <= selected.h ? "cmp cmp-in" : "cmp"}
              onClick={onSelect && (() => onSelect(z.id))}
              {...box(z)}
            />
          ))}
          {selected ? <rect className="cmp-sel" {...box(selected)} /> : null}
          {labels.map((l) => (
            <text
              key={l.id}
              className={l.inside ? "cmp-label cmp-label-in" : "cmp-label"}
              x={l.x}
              y={l.y}
              textAnchor="end"
            >
              {l.text}
            </text>
          ))}
        </svg>
      </div>
      <div className="fs-scale-legend">
        {selected ? (
          <span className="fs-scale-size">
            {writeSize(selected, unit)}
            <span>{writeSize(selected, unit === "cm" ? "in" : "cm")}</span>
          </span>
        ) : null}
        <span className="fs-scale-ref">{sizes.length} sizes from one corner, same scale</span>
      </div>
    </figure>
  );
}
