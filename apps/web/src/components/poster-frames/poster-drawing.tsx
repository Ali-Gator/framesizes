import { U } from "@/components/ui/u";

import type { Box, Drawing } from "./answer";

const place = (b: Box) => ({
  left: `${b.l}%`,
  top: `${b.t}%`,
  width: `${b.w}%`,
  height: `${b.h}%`,
});

/**
 * A poster in its frame, to one scale: the moulding (dashed for a custom frame), then the poster
 * filling the frame or, with a mat, the mat, its opening and the poster's edge under it, with the
 * borders written on the mat. Reuses F5's `mt-*` drawing classes.
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-answer-is-announced-and-drawn-to-one-scale}
 */
export function PosterDrawing({ draw }: { draw: Drawing }) {
  const { boxes, borders } = draw;
  return (
    <figure className="mc-draw mc-fig">
      <div className="mt-stage" role="img" aria-label={draw.label}>
        <div className={`mt-r mt-oak${draw.dashed ? " pf-xf" : ""}`} style={place(boxes.oak)} />
        {boxes.opening && borders ? (
          <>
            <div className="mt-r mt-mat" style={place(boxes.frame)} />
            <div className="mt-r mt-open" style={place(boxes.opening)}>
              <span className="mt-art">Poster</span>
            </div>
            <div className="mt-r mt-hid" style={place(boxes.poster)} />
            <span
              className="mt-tl"
              style={{ left: `${borders.sideAt.l}%`, top: `${borders.sideAt.t}%` }}
            >
              <U in={borders.side.in} cm={borders.side.cm} />
            </span>
            <span
              className="mt-tl"
              style={{ left: `${borders.topAt.l}%`, top: `${borders.topAt.t}%` }}
            >
              <U in={borders.top.in} cm={borders.top.cm} />
            </span>
          </>
        ) : (
          <div className="mt-r mt-open" style={place(boxes.poster)}>
            <span className="mt-art">Poster</span>
          </div>
        )}
      </div>
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
      <figcaption>{draw.caption}</figcaption>
    </figure>
  );
}
