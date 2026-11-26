import type { CSSProperties, ReactNode, Ref } from "react";

import { SampleRoom } from "@/components/ui/sample-room";

import { type Box, type Scene, WALL } from "./scene";
import type { Finish } from "./state";

const pct = (n: number) => `${Math.round(n * 1e5) / 1e3}%`;
/** A box in % of the wall, the world box's frame. */
const inWorld = (r: Box): CSSProperties => ({
  left: pct(r.x / WALL.w),
  top: pct(r.y / WALL.h),
  width: pct(r.w / WALL.w),
  height: pct(r.h / WALL.h),
});
/** A box in % of the view, the stage's frame. */
export const inView = (r: Box, view: Box): CSSProperties => ({
  left: pct((r.x - view.x) / view.w),
  top: pct((r.y - view.y) / view.h),
  width: pct(r.w / view.w),
  height: pct(r.h / view.h),
});
/** The artwork clipped to the opening: an inset in % of the artwork's drawn box. */
const clip = (art: Box, o: Box) =>
  `inset(${pct((o.y - art.y) / art.h)} ${pct((art.x + art.w - o.x - o.w) / art.w)} ${pct(
    (art.y + art.h - o.y - o.h) / art.h,
  )} ${pct((o.x - art.x) / art.w)})`;

/** The two cut parts outside the opening, dimmed while dragging. */
function bands(art: Box, o: Box): Box[] {
  return art.w > o.w + 1e-6
    ? [
        { x: art.x, y: art.y, w: o.x - art.x, h: art.h },
        { x: o.x + o.w, y: art.y, w: art.x + art.w - o.x - o.w, h: art.h },
      ]
    : [
        { x: art.x, y: art.y, w: art.w, h: o.y - art.y },
        { x: art.x, y: o.y + o.h, w: art.w, h: art.y + art.h - o.y - o.h },
      ];
}

/**
 * The mockup at true scale: the room, the frame, the mat and the artwork, positioned in % of the
 * wall inside a box that shows the view. One image to assistive tech; `children` (the move
 * control) sit beside it in the stage, never inside it.
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-frame-hangs-on-one-of-two-walls-seen-whole-or-close-up}
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-pictures-label-follows-the-state}
 */
export function MockupPicture({
  scene: s,
  finish,
  src,
  label,
  dragging = false,
  stageRef,
  children,
}: {
  scene: Scene;
  finish: Finish;
  src: string;
  label: string;
  dragging?: boolean;
  stageRef?: Ref<HTMLDivElement>;
  children?: ReactNode;
}) {
  const { view } = s;
  // The stage's box is 3:2; a taller view is narrowed to keep its own shape.
  const ratio = view.w / view.h;
  return (
    <div className="mk-frame-box">
      <div
        ref={stageRef}
        className={`mk-stage${dragging ? " is-drag" : ""}`}
        style={{
          aspectRatio: `${Math.round(view.w * 1000) / 1000} / ${Math.round(view.h * 1000) / 1000}`,
          width: pct(Math.min(1, ratio / 1.5)),
        }}
      >
        <div className="mk-pic" role="img" aria-label={label}>
          <div
            className="mk-world"
            style={{
              left: pct(-view.x / view.w),
              top: pct(-view.y / view.h),
              width: pct(WALL.w / view.w),
              height: pct(WALL.h / view.h),
            }}
          >
            <SampleRoom sofa={s.sofa} className="mk-room" />
            <div className={`mk-fr fin-${finish}`} style={inWorld(s.outside)} />
            {s.mat ? <div className="mk-mat" style={inWorld(s.mat)} /> : null}
            {/* eslint-disable-next-line @next/next/no-img-element -- a blob: upload or the sample, drawn as is */}
            <img
              className="mk-art"
              src={src}
              alt=""
              draggable={false}
              style={{ ...inWorld(s.art), clipPath: dragging ? undefined : clip(s.art, s.opening) }}
            />
            {dragging
              ? bands(s.art, s.opening).map((b, i) => (
                  <div key={i} className="mk-band" style={inWorld(b)} />
                ))
              : null}
            {dragging ? <div className="mk-edge" style={inWorld(s.opening)} /> : null}
            {s.mat && !dragging ? <div className="mk-bev" style={inWorld(s.opening)} /> : null}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
