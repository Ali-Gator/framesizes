import { toWholeCm, writeSize, type Frame, type Unit } from "@framesizes/sizes";

import { STAGE } from "./scale-preview";

type CompareSize = Pick<Frame, "id" | "w" | "h" | "major">;

/**
 * Labels are laid out for their largest size in stage units: the phone rule in widgets.css
 * (`@container card`) draws `.cmp-label` at 26; the base and 520px rules draw 14 and 22.
 */
export const LABEL_FONT = 26;
/** Stage units between a label's box and its outline's top edge and right corner. */
export const INSET = 6;

interface Label {
  id: string;
  /** The box's left edge. */
  x: number;
  /** The baseline, the box's bottom edge. */
  y: number;
  width: number;
  height: number;
  /** `end`: the text ends at the box's right edge; `start`: it starts at its left edge. */
  anchor: "start" | "end";
  text: string;
  inside: boolean;
}

interface Layout {
  scale: number;
  x0: number;
  base: number;
  /** Smallest area first. */
  small: CompareSize[];
  selected: CompareSize | undefined;
  labels: Label[];
}

/**
 * Every size from one bottom-left corner at one scale. Labels go to the selected size first, then
 * sizes marked major, then the rest, small to large. Each sits under its outline's top edge, ending
 * near the corner, or starting at the shared left edge when there is no room; one whose box would
 * come near an earlier one's is dropped.
 * {@link openspec/specs/frame-size-chart/spec.md#scenario-labels-stay-inside-the-drawing-and-apart}
 */
export function compareLayout(
  sizes: readonly CompareSize[],
  value: string,
  unit: Unit = "in",
): Layout {
  const maxW = Math.max(1, ...sizes.map((z) => z.w));
  const maxH = Math.max(1, ...sizes.map((z) => z.h));
  // 56 units stay clear at the top for the caption.
  const scale = Math.min((STAGE.width - 230) / maxW, (STAGE.height - 80) / maxH);
  const x0 = (STAGE.width - maxW * scale) / 2;
  const base = STAGE.height - 24;
  const selected = sizes.find((z) => z.id === value);
  const small = [...sizes].sort((a, b) => a.w * a.h - b.w * b.h);
  const order = [
    ...(selected ? [selected] : []),
    ...small.filter((z) => z !== selected && z.major),
    ...small.filter((z) => z !== selected && !z.major),
  ];
  // Mono digits: 0.6 em wide, cap height 0.72 em, no descenders.
  const height = 0.72 * LABEL_FONT;
  const labels: Label[] = [];
  for (const z of order) {
    const text = unit === "cm" ? `${toWholeCm(z.w)}×${toWholeCm(z.h)}` : `${z.w}×${z.h}`;
    const width = text.length * 0.6 * LABEL_FONT;
    const end = x0 + z.w * scale - INSET;
    const shift = end - width < x0 + INSET;
    const x = shift ? x0 + INSET : end - width;
    const y = base - z.h * scale + INSET + height;
    const near = (l: Label) =>
      x < l.x + l.width + 6 &&
      l.x < x + width + 6 &&
      y - height < l.y + 3 &&
      l.y - l.height < y + 3;
    if (labels.some(near)) continue;
    const inside =
      !!selected &&
      x >= x0 &&
      x + width <= x0 + selected.w * scale &&
      y - height >= base - selected.h * scale &&
      y <= base;
    labels.push({ id: z.id, x, y, width, height, anchor: shift ? "start" : "end", text, inside });
  }
  return { scale, x0, base, small, selected, labels };
}

/**
 * The size whose top-right corner is nearest a point in stage units, or `undefined` when every
 * corner is more than 3 in (drawn scale) away.
 * {@link openspec/specs/frame-size-chart/spec.md#scenario-a-click-near-a-small-outlines-corner}
 */
export function nearestSize(layout: Layout, x: number, y: number): string | undefined {
  let best: string | undefined;
  let min = 3 * layout.scale;
  for (const z of layout.small) {
    const d = Math.hypot(layout.x0 + z.w * layout.scale - x, layout.base - z.h * layout.scale - y);
    if (d <= min) [best, min] = [z.id, d];
  }
  return best;
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
  const layout = compareLayout(sizes, value, unit);
  const { scale, x0, base, small, selected, labels } = layout;
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
          className="cmp-stage"
          onClick={
            onSelect &&
            ((e) => {
              const m = e.currentTarget.getScreenCTM()?.inverse();
              if (!m) return;
              const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
              const id = nearestSize(layout, p.x, p.y);
              if (id) onSelect(id);
            })
          }
        >
          {selected ? <rect className="cmp-fill" {...box(selected)} /> : null}
          {[...small].reverse().map((z) => (
            <rect
              key={z.id}
              data-size={z.id}
              className={selected && z.w <= selected.w && z.h <= selected.h ? "cmp cmp-in" : "cmp"}
              {...box(z)}
            />
          ))}
          {selected ? <rect className="cmp-sel" {...box(selected)} /> : null}
          {labels.map((l) => (
            <text
              key={l.id}
              className={l.inside ? "cmp-label cmp-label-in" : "cmp-label"}
              x={l.anchor === "end" ? l.x + l.width : l.x}
              y={l.y}
              textAnchor={l.anchor}
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
