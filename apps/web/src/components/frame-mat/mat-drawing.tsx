import type { ReactNode } from "react";

import { U } from "@/components/ui/u";

import type { Box, Drawing } from "./answer";

const place = (b: Box) => ({
  left: `${b.l}%`,
  top: `${b.t}%`,
  width: `${b.w}%`,
  height: `${b.h}%`,
});

/**
 * A print in its mat and frame: the frame, the mat, the opening and the print's edge under the
 * mat, with the borders written on the mat, a legend and a caption. Server-rendered on the page.
 * {@link openspec/specs/frame-mat-calculator/spec.md#requirement-the-answer-is-announced-and-drawn}
 */
export function MatDrawing({
  draw,
  caption,
  className,
}: {
  draw: Drawing;
  /** In place of the drawing's caption and legend, for the page's figure. */
  caption?: ReactNode;
  className?: string;
}) {
  return (
    <figure className={`mc-draw${className ? ` ${className}` : ""}`}>
      <div className="mt-stage" role="img" aria-label={draw.label}>
        <div className="mt-r mt-oak" style={place(draw.boxes.oak)} />
        <div className="mt-r mt-mat" style={place(draw.boxes.mat)} />
        <div className="mt-r mt-open" style={place(draw.boxes.opening)}>
          <span className="mt-art">Print</span>
        </div>
        <div className="mt-r mt-hid" style={place(draw.boxes.print)} />
        <span className="mt-tl" style={{ left: `${draw.sideAt.l}%`, top: `${draw.sideAt.t}%` }}>
          <U in={draw.side.in} cm={draw.side.cm} />
        </span>
        <span className="mt-tl" style={{ left: `${draw.topAt.l}%`, top: `${draw.topAt.t}%` }}>
          <U in={draw.top.in} cm={draw.top.cm} />
        </span>
      </div>
      {caption ? null : (
        <ul className="mc-legend">
          {draw.legend.map((g) => (
            <li key={g.name}>
              <span className={`mc-sw ${g.swatch}`} aria-hidden="true" />
              <span>{g.name}</span>
              <span className="v">
                <U in={g.value.in} cm={g.value.cm} />
              </span>
            </li>
          ))}
        </ul>
      )}
      <figcaption>{caption ?? draw.caption}</figcaption>
    </figure>
  );
}
