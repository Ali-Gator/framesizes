import { type UIEvent, useEffect, useRef, useState } from "react";

/**
 * A scrolling box's measured size and its scroll offset in inches, at most one update a frame.
 * {@link openspec/specs/actual-size/spec.md#scenario-panning}
 */
export function useScroll(scale: number) {
  const stage = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [px, setPx] = useState({ x: 0, y: 0 });
  const frame = useRef(0);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setPx({ x: el.scrollLeft, y: el.scrollTop }));
  };

  return { stage, box, offset: { x: px.x / scale, y: px.y / scale }, onScroll };
}
