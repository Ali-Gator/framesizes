import { commonFrames, writeSize } from "@framesizes/sizes";

/** Drawing units per inch, and the width of each frame's column. */
const SCALE = 3;
const COLUMN = 100;

/**
 * The six most common sizes as frames at one scale, labelled under the drawing: two rows of three,
 * stacked on a phone and side by side on one baseline from 640px.
 * {@link openspec/specs/frame-size-chart/spec.md#requirement-the-six-most-common-sizes-are-drawn-at-one-scale}
 */
export function CommonSizes() {
  const frames = commonFrames();
  const rows = [frames.slice(0, 3), frames.slice(3)];
  const first = frames[0];
  const last = frames.at(-1);
  const name = `Six common picture frame sizes from ${first?.id} to ${last?.id} inches compared at the same scale`;
  return (
    <figure
      className="m-0 grid gap-x-6 gap-y-8 sm:grid-cols-2 sm:grid-rows-[auto_auto] sm:gap-y-3"
      aria-label="The six most common frame sizes"
    >
      {rows.map((row, r) => {
        // Both rows are 3 × COLUMN wide at one SCALE, each trimmed to its tallest frame and stroke.
        const tallest = Math.max(...row.map((f) => f.h)) * SCALE;
        return (
          <div key={row[0]?.id} className="grid gap-3 sm:row-span-2 sm:grid-rows-subgrid">
            <svg
              viewBox={`0 -1 ${3 * COLUMN} ${tallest + 9}`}
              {...(r === 0 ? { role: "img", "aria-label": name } : { "aria-hidden": true })}
              className="block w-full self-end"
            >
              {row.map((f, i) => (
                <rect
                  key={f.id}
                  data-frame={f.id}
                  x={i * COLUMN + 8}
                  y={tallest - f.h * SCALE}
                  width={f.w * SCALE}
                  height={f.h * SCALE}
                  fill="var(--tape)"
                  stroke="var(--oak)"
                  strokeWidth={1.5}
                />
              ))}
              <line x1={0} x2={3 * COLUMN} y1={tallest} y2={tallest} stroke="var(--line-strong)" />
            </svg>
            {/* No column gap, and the frame's 8% inset, so each label starts under its frame. */}
            <ol className="grid grid-cols-3">
              {row.map((f) => (
                <li key={f.id} className="flex flex-col gap-0.5 pr-2 pl-[8%]">
                  <span className="font-mono text-xl leading-7 font-medium">{`${f.w}×${f.h}`}</span>
                  <span className="measure text-ink-muted max-sm:text-xs">
                    {writeSize(f, "cm")}
                  </span>
                  <span className="small">{f.use}</span>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </figure>
  );
}
