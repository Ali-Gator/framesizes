import { frameAnatomy, MAT_OVERLAP, writeSize } from "@framesizes/sizes";

const EXAMPLE = frameAnatomy({ frame: { w: 11, h: 14 }, image: { w: 8, h: 10 } });
/** Drawing units per inch. */
const SCALE = 16;
const overlap = MAT_OVERLAP === 0.25 ? "¼" : String(MAT_OVERLAP);

const MEASURES = [
  {
    name: "Outside size",
    size: EXAMPLE.outside,
    swatch: "bg-oak",
    text: "The outer edge of the moulding. It changes with the moulding's width, so it is not the size on the label.",
  },
  {
    name: "Frame size",
    size: EXAMPLE.frame,
    swatch: "bg-paper border-[1.5px] border-line-strong",
    text: "The size on the label: the largest print, or mat, the frame holds.",
  },
  {
    name: "Mat opening",
    size: EXAMPLE.matOpening,
    swatch: "bg-tape border-4 border-paper outline-[1.5px] outline-line-strong",
    text: `The window in the mat. It is cut ${overlap} in smaller on each side, so the mat holds the photo's edges.`,
  },
  {
    name: "Image size",
    size: EXAMPLE.image,
    swatch: "bg-tape border-[1.5px] border-ink",
    text: "Your photo or print. Order or crop the image to this size.",
  },
];

/**
 * An 8x10 photo with a mat in an 11x14 frame, drawn and measured from the size engine.
 * {@link openspec/specs/frame-size-chart/spec.md#requirement-the-frame-anatomy-example-is-computed}
 */
export function FrameAnatomy() {
  const { outside, frame, matOpening } = EXAMPLE;
  const moulding = ((outside.w - frame.w) / 2) * SCALE;
  return (
    <div className="flex flex-wrap items-center gap-8">
      <div className="flex min-w-0 flex-[0_1_320px] justify-center rounded-[24px] bg-stage p-8">
        <svg
          viewBox={`0 0 ${outside.w * SCALE} ${outside.h * SCALE}`}
          width={outside.w * SCALE}
          height={outside.h * SCALE}
          role="img"
          aria-label="8x10 photo with a mat in an 11x14 frame: moulding, mat, mat opening and photo"
          className="h-auto max-w-full"
        >
          <rect width={outside.w * SCALE} height={outside.h * SCALE} fill="var(--oak)" />
          <rect
            x={moulding}
            y={moulding}
            width={frame.w * SCALE}
            height={frame.h * SCALE}
            fill="var(--paper)"
          />
          <rect
            x={moulding + ((frame.w - matOpening.w) / 2) * SCALE}
            y={moulding + ((frame.h - matOpening.h) / 2) * SCALE}
            width={matOpening.w * SCALE}
            height={matOpening.h * SCALE}
            fill="var(--tape)"
          />
        </svg>
      </div>
      <ul className="flex min-w-0 flex-[1_1_320px] flex-col gap-5">
        {MEASURES.map((m) => (
          <li key={m.name} data-measure={m.name} className="flex items-start gap-3">
            <span aria-hidden="true" className={`mt-1 size-4 flex-none box-border ${m.swatch}`} />
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-bold">{m.name}</span>
                <span data-value className="font-mono font-medium">
                  {writeSize(m.size, "in")}
                </span>
              </div>
              <span className="small text-ink-muted">{m.text}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
