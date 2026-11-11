import { commonFrames, writeSize } from "@framesizes/sizes";

/** Drawing units per inch, and the width of each frame's column. */
const SCALE = 3;
const COLUMN = 100;

/**
 * The six most common sizes as frames on one baseline, at one scale, labelled under the drawing.
 * {@link openspec/specs/frame-size-chart/spec.md#requirement-the-six-most-common-sizes-are-drawn-at-one-scale}
 */
export function CommonSizes() {
  const frames = commonFrames();
  const tallest = Math.max(...frames.map((f) => f.h)) * SCALE;
  const height = tallest + 8;
  const first = frames[0];
  const last = frames.at(-1);
  const name = `Six common picture frame sizes from ${first?.id} to ${last?.id} inches compared at the same scale`;
  return (
    <figure
      className="m-0 overflow-x-auto"
      tabIndex={0}
      aria-label="The six most common frame sizes"
    >
      <div className="min-w-[720px]">
        <svg
          viewBox={`0 0 ${frames.length * COLUMN} ${height}`}
          role="img"
          aria-label={name}
          className="block w-full"
        >
          {frames.map((f, i) => (
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
          <line
            x1={0}
            x2={frames.length * COLUMN}
            y1={tallest}
            y2={tallest}
            stroke="var(--line-strong)"
          />
        </svg>
        <ol className="mt-3 grid grid-cols-6 gap-6">
          {frames.map((f) => (
            <li key={f.id} className="flex flex-col gap-0.5">
              <span className="font-mono text-xl leading-7 font-medium">{`${f.w}×${f.h}`}</span>
              <span className="measure text-ink-muted">{writeSize(f, "cm")}</span>
              <span className="small">{f.use}</span>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
