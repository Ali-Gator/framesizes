import { CHECK_OBJECTS, type Unit } from "@framesizes/sizes";
import { type Dispatch, useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { U } from "@/components/ui/u";

import { lineGap, rulerInches, SCALE_RANGE, type ViewerAction, type ViewerState } from "./state";

/*
 * The scale check: a slider that moves a line, the screen sizes to pick from, and the phone's steps.
 * {@link openspec/specs/actual-size/spec.md#requirement-the-card-check-matches-one-edge-of-a-credit-card}
 */

export const PHONE_DIAGONALS = [5.4, 6.1, 6.3, 6.7, 6.9] as const;
export const DESK_DIAGONALS = [13.3, 14, 15.6, 21.5, 23, 24, 27, 32] as const;

export function Slider({
  scale,
  coarse,
  label,
  dispatch,
}: {
  scale: number;
  /** A touch screen gets the narrower range; a desktop in a narrow window keeps the wide one. */
  coarse: boolean;
  label: string;
  dispatch: Dispatch<ViewerAction>;
}) {
  const range = coarse ? SCALE_RANGE.phone : SCALE_RANGE.desk;
  const [min, max] = range;
  return (
    <div className="as-slide">
      <button
        type="button"
        className="fs-btn fs-btn-secondary as-sq"
        aria-label="Smaller"
        onClick={() => dispatch({ type: "nudge", by: -0.2, range })}
      >
        −
      </button>
      <input
        type="range"
        min={min}
        max={max}
        step={0.1}
        value={scale}
        aria-label={label}
        onChange={(e) => dispatch({ type: "slide", scale: Number(e.target.value), range })}
      />
      <button
        type="button"
        className="fs-btn fs-btn-secondary as-sq"
        aria-label="Bigger"
        onClick={() => dispatch({ type: "nudge", by: 0.2, range })}
      >
        +
      </button>
    </div>
  );
}

/**
 * The screen sizes to pick from, and a field for any other.
 * {@link openspec/specs/actual-size/spec.md#requirement-the-screen-size-can-set-the-scale}
 */
export function Diagonals({
  state,
  phone,
  coarse,
  guess,
  screen,
  dispatch,
}: {
  state: ViewerState;
  /** A phone's screen: the phone sizes and wording. */
  phone: boolean;
  /** A touch screen: a size must give a scale the touch slider can show. */
  coarse: boolean;
  guess: number;
  screen: { w: number; h: number };
  dispatch: Dispatch<ViewerAction>;
}) {
  const list = phone ? PHONE_DIAGONALS : DESK_DIAGONALS;
  // The field shows what was typed, and follows a picked chip.
  const [draft, setDraft] = useState(state.diagonal === null ? "" : String(state.diagonal));
  const range = coarse ? SCALE_RANGE.phone : SCALE_RANGE.desk;
  return (
    <>
      <p className="as-step">
        Pick your {phone ? "phone's screen" : "screen"} size, measured corner to corner. Our guess
        is {guess} in.
      </p>
      <div className="as-diags" role="group" aria-label="Screen size">
        {list.map((d) => (
          <button
            key={d}
            type="button"
            className="fs-chip as-chip"
            aria-pressed={state.diagonal === d}
            onClick={() => {
              setDraft(String(d));
              dispatch({ type: "diagonal", value: d, ...screen, range });
            }}
          >
            <span className="fs-chip-main">{d} in</span>
          </button>
        ))}
      </div>
      <label className="as-diag-in">
        <span className="fs-label">Other size</span>
        <input
          className="fs-input"
          type="number"
          inputMode="decimal"
          step={0.1}
          min={3}
          max={100}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            dispatch({ type: "diagonal", value: e.target.value, ...screen, range });
          }}
        />
        <span>in</span>
      </label>
    </>
  );
}

/** The phone's picture of a card standing on the screen between the two lines. */
function CardPicture() {
  return (
    <svg viewBox="0 0 88 120" width="88" height="120" aria-hidden="true">
      <rect
        x="10"
        y="3"
        width="68"
        height="114"
        rx="11"
        fill="#FFFFFF"
        stroke="#14181C"
        strokeWidth="2"
      />
      <rect x="14" y="12" width="60" height="96" rx="3" fill="#E7E9E2" />
      <rect
        x="18"
        y="20"
        width="50"
        height="78"
        rx="4"
        fill="#FFF0C2"
        stroke="#14181C"
        strokeWidth="1.5"
      />
      <rect
        x="24"
        y="30"
        width="11"
        height="8"
        rx="1.5"
        fill="#FFC21A"
        stroke="#7A5400"
        strokeWidth="1"
      />
      <line
        x1="24"
        y1="84"
        x2="56"
        y2="84"
        stroke="#7A5400"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line x1="18" y1="14" x2="18" y2="50" stroke="#14181C" strokeWidth="2.5" />
      <line x1="68" y1="14" x2="68" y2="50" stroke="#14181C" strokeWidth="2.5" />
      <path
        d="M60 56h16M72 52l4 4-4 4M64 52l-4 4 4 4"
        fill="none"
        stroke="#14181C"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The phone's picture of a ruler across the screen, 0 on the left line. */
function RulerPicture() {
  return (
    <svg viewBox="0 0 88 120" width="88" height="120" aria-hidden="true">
      <rect
        x="10"
        y="3"
        width="68"
        height="114"
        rx="11"
        fill="#FFFFFF"
        stroke="#14181C"
        strokeWidth="2"
      />
      <rect x="14" y="12" width="60" height="96" rx="3" fill="#E7E9E2" />
      <rect
        x="4"
        y="24"
        width="82"
        height="20"
        rx="2"
        fill="#FFF0C2"
        stroke="#14181C"
        strokeWidth="1.5"
      />
      <g stroke="#7A5400" strokeWidth="1">
        <line x1="30.5" y1="24" x2="30.5" y2="29" />
        <line x1="43" y1="24" x2="43" y2="31" />
        <line x1="55.5" y1="24" x2="55.5" y2="29" />
        <line x1="80.5" y1="24" x2="80.5" y2="29" />
      </g>
      <line x1="18" y1="14" x2="18" y2="54" stroke="#14181C" strokeWidth="2.5" />
      <line x1="68" y1="14" x2="68" y2="54" stroke="#14181C" strokeWidth="2.5" />
      <path
        d="M60 60h16M72 56l4 4-4 4M64 56l-4 4 4 4"
        fill="none"
        stroke="#14181C"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const RulerMark = ({ phone }: { phone: boolean }) => (
  <span className="font-mono">
    <U in={phone ? "2 in" : "5 in"} cm={phone ? "5 cm" : "12 cm"} />
  </span>
);

/**
 * The phone's check step: card or ruler, on one screen.
 * {@link openspec/specs/actual-size/spec.md#scenario-the-step-on-a-small-phone}
 */
export function PhoneLines({
  state,
  unit,
  narrow,
  coarse,
  dispatch,
  onDone,
}: {
  state: ViewerState;
  unit: Unit;
  coarse: boolean;
  /** Under 380 px of width the lines start 8 px in, not 16. */
  narrow: boolean;
  dispatch: Dispatch<ViewerAction>;
  onDone: () => void;
}) {
  const ruler = state.mode === "ruler";
  const edge = ruler ? rulerInches(true, unit) : CHECK_OBJECTS.card.short;
  const start = narrow ? 8 : 16;
  const gap = lineGap(state.scale, edge);
  // On the narrowest phones the right line can pass the screen's edge before it matches.
  const [stripWidth, setStripWidth] = useState(0);
  const measure = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const read = () => setStripWidth(el.clientWidth);
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const offEdge = stripWidth > 0 && start + gap > stripWidth - 2;
  return (
    <>
      <div className="as-how">
        {ruler ? <RulerPicture /> : <CardPicture />}
        <ol>
          {ruler ? (
            <>
              <li>Lay a ruler flat across the screen.</li>
              <li>Put its 0 on the left line.</li>
              <li>
                Slide until the right line is at <RulerMark phone />.
              </li>
            </>
          ) : (
            <>
              <li>Stand a credit card upright on the screen.</li>
              <li>Put its left edge on the left line.</li>
              <li>Slide until the right line meets its right edge.</li>
            </>
          )}
        </ol>
      </div>
      <div className="as-bleed">
        <div
          ref={measure}
          className="as-strip"
          style={{ height: state.scale }}
          role="img"
          aria-label={
            ruler ? "Two lines a ruler mark apart" : "Two lines a credit card's width apart"
          }
        >
          <div
            className="as-strip-card"
            style={{ left: start, width: gap, height: state.scale + 20 }}
          >
            <span>{ruler ? "Ruler" : "Credit card"}</span>
          </div>
          <div className="as-vline" data-testid="line-start" style={{ left: start }} />
          <div className="as-vline" data-testid="line-end" style={{ left: start + gap }}>
            <div className="as-grip" />
          </div>
        </div>
        {/* Over the strip, outside its picture, so nothing under the slider moves when it shows. */}
        <p className="as-edge" aria-live="polite">
          {offEdge ? "The line is past your screen's edge. Pick your screen size." : ""}
        </p>
      </div>
      <Slider
        scale={state.scale}
        coarse={coarse}
        label="Distance between the lines"
        dispatch={dispatch}
      />
      <Button className="fs-btn-lg fs-btn-block" onClick={onDone}>
        Done, it matches
      </Button>
      <div className="as-links">
        {ruler ? (
          <Button variant="ghost" onClick={() => dispatch({ type: "open", method: "card" })}>
            Use a card instead
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => dispatch({ type: "open", method: "ruler" })}>
            Have a ruler? Use it instead
          </Button>
        )}
        <Button variant="ghost" onClick={() => dispatch({ type: "open", method: "screen" })}>
          {ruler ? "No ruler? Pick your screen size" : "No card? Pick your screen size"}
        </Button>
        <Button variant="ghost" onClick={() => dispatch({ type: "skip" })}>
          Skip, use the guess
        </Button>
      </div>
    </>
  );
}

export { RulerMark };
