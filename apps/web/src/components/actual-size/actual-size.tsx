"use client";

import {
  ACTUAL_SIZES,
  type ActualSize,
  CHECK_OBJECTS,
  guessDiagonal,
  guessScale,
  isPhoneScreen,
  scaleFromDiagonal,
  type Unit,
  writeActual,
} from "@framesizes/sizes";
import { type Dispatch, useEffect, useId, useReducer, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useUnit } from "@/lib/unit";

import { Diagonals, PhoneLines, RulerMark, Slider } from "./check";
import { Dims, SizeMap, Stage } from "./drawing";
import { FullView } from "./full-view";
import { checkStored, loadCheck, saveCheck, screenKey } from "./saved";
import {
  initialState,
  type Method,
  phonesLine,
  reducer,
  RULER,
  rulerInches,
  sheetFits,
  sizeOf,
  statusText,
  tagText,
  type ViewerAction,
  type ViewerState,
  visiblePart,
} from "./state";
import { type ScreenSnap, useScreen } from "./use-screen";
import { useScroll } from "./use-scroll";

const isMethod = (mode: ViewerState["mode"]): mode is Method => mode !== "view" && mode !== "full";

/** The desktop box's height and the maps' sizes, from the canvas. */
const BOX_H = 560;
const PHONE_MAP = { w: 326, h: 170 };
const DESK_MAP = { w: 340, h: 190 };

function Badge({ check }: { check: Method | null }) {
  return (
    <span className={`fs-badge ${check ? "fs-badge-good" : "fs-badge-fair"}`}>
      {statusText(check)}
    </span>
  );
}

/**
 * {@link openspec/specs/actual-size/spec.md#requirement-the-viewer-offers-seven-sizes-and-opens-on-8x10}
 */
function SizeGrid({ state, dispatch }: { state: ViewerState; dispatch: Dispatch<ViewerAction> }) {
  return (
    <div className="as-sizes" role="group" aria-label="Size">
      {ACTUAL_SIZES.map((s) => (
        <button
          key={s.id}
          type="button"
          className="fs-chip as-chip"
          aria-pressed={s.id === state.size}
          onClick={() => dispatch({ type: "pick", size: s.id })}
        >
          <span className="fs-chip-main">{s.label}</span>
        </button>
      ))}
    </div>
  );
}

/** The picked size in the visitor's unit, announced politely. */
function Readout({ size, children }: { size: ActualSize; children?: React.ReactNode }) {
  return (
    <div className="as-read" aria-live="polite">
      <span className="as-read-v">
        <Dims inches={writeActual(size, "in")} cm={writeActual(size, "cm")} />
      </span>
      {children}
    </div>
  );
}

/**
 * Phone step 1: the answer, the map with the phone's outline, and the button to see it.
 * {@link openspec/specs/actual-size/spec.md#requirement-the-phone-answer-step-comes-first}
 */
function PhoneAnswer({
  state,
  screen,
  dispatch,
  seeRef,
}: {
  state: ViewerState;
  screen: ScreenSnap | null;
  dispatch: Dispatch<ViewerAction>;
  seeRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const size = sizeOf(state);
  const ready = screen !== null && state.scale > 0;
  const glass = ready ? { w: screen.w / state.scale, h: screen.h / state.scale } : null;
  // A tablet or a narrow desktop window is "your screen", not "your phone".
  const onPhone = screen === null || isPhoneScreen(screen);
  return (
    <div className="as-phone">
      <Readout size={size}>
        <p className="as-phones">
          {glass ? phonesLine(size, screen ?? glass, state.scale, onPhone) : ""}
        </p>
      </Readout>
      <figure className="as-map">
        {glass ? (
          <SizeMap
            size={size}
            name={size.id}
            outline={{ x: 0, y: 0, ...glass }}
            outlineLabel={onPhone ? "Your phone" : "Your screen"}
            width={PHONE_MAP.w}
            height={PHONE_MAP.h}
            label={`The whole ${size.id} drawn smaller, next to the outline of your ${onPhone ? "phone" : "screen"}`}
          />
        ) : (
          <div className="as-map-box" style={{ maxWidth: PHONE_MAP.w, height: PHONE_MAP.h }} />
        )}
      </figure>
      <button
        ref={seeRef}
        type="button"
        className="fs-btn fs-btn-primary fs-btn-lg fs-btn-block"
        onClick={() => dispatch({ type: "see" })}
      >
        See {size.id} at actual size
      </button>
      <div className="as-line">
        <Badge check={state.check} />
        <Button
          variant="ghost"
          onClick={() =>
            dispatch({
              type: "open",
              method: state.check && state.check !== "sheet" ? state.check : "card",
            })
          }
        >
          {state.check ? "Check again" : "Check it with a card"}
        </Button>
      </div>
    </div>
  );
}

const TABS: readonly [Method, string][] = [
  ["card", "Credit card"],
  ["ruler", "Ruler"],
  ["sheet", "Sheet of paper"],
  ["screen", "Screen size"],
];

/** What lines up with the card, the ruler or the sheet in the box's corner. */
function Overlay({
  state,
  unit,
  boxH,
}: {
  state: ViewerState;
  unit: Unit;
  boxH: number;
}): React.ReactNode {
  const s = state.scale;
  const at = { left: RULER, top: RULER };
  if (state.mode === "card") {
    const card = CHECK_OBJECTS.card;
    return (
      <div
        className="as-ref"
        style={{ ...at, width: card.long * s, height: card.short * s, borderRadius: 0.125 * s }}
      >
        <span className="as-ref-l">Your card goes here</span>
      </div>
    );
  }
  if (state.mode === "ruler") {
    return (
      <div
        className="as-ref"
        style={{ ...at, width: rulerInches(false, unit) * s, height: 1.2 * s }}
      >
        <span className="as-ref-l">Ruler: 0 here</span>
        <div className="as-ref-edge" />
      </div>
    );
  }
  if (state.mode === "sheet") {
    const sheet = state.sheet === "a4" ? CHECK_OBJECTS.a4 : CHECK_OBJECTS.letter;
    return (
      <div
        className="as-ref"
        style={{ ...at, width: sheet.short * s, height: Math.max(0, boxH - RULER - 2) }}
      >
        <span className="as-ref-l">Your {state.sheet === "a4" ? "A4" : "Letter"} sheet</span>
        <div className="as-ref-edge" />
      </div>
    );
  }
  return undefined;
}

/**
 * The desktop's one screen: status, the inline check, the 1:1 box, the readout and the map.
 * {@link openspec/specs/actual-size/spec.md#requirement-the-desktop-box-shows-the-size-at-11}
 * {@link openspec/specs/actual-size/spec.md#requirement-a-sheet-of-paper-is-offered-only-where-it-fits}
 */
function Desk({
  state,
  unit,
  screen,
  stored,
  dispatch,
  onDone,
}: {
  state: ViewerState;
  unit: Unit;
  screen: ScreenSnap | null;
  stored: boolean;
  dispatch: Dispatch<ViewerAction>;
  onDone: () => void;
}) {
  const size = sizeOf(state);
  const { stage, box, offset, onScroll } = useScroll(state.scale || 1);
  const ready = screen !== null && state.scale > 0;
  const guess = screen ? guessScale(screen) : 0;
  const sheetOk = box.w > 0 && guess > 0 && sheetFits(box.w, guess);
  const checking = isMethod(state.mode);
  const part = visiblePart(size, box, state.scale || 1);
  const open = (method: Method) => dispatch({ type: "open", method });
  // A box that narrows mid-check can no longer hold the sheet: fall back to the card.
  useEffect(() => {
    if (state.mode === "sheet" && box.w > 0 && !sheetOk) {
      dispatch({ type: "open", method: "card" });
    }
  }, [state.mode, box.w, sheetOk, dispatch]);
  return (
    <div className="as-desk">
      {checking ? (
        <div className="as-cal" role="group" aria-label="Check the scale">
          <div className="as-tabs" role="group" aria-label="Check with">
            {TABS.filter(([m]) => m !== "sheet" || sheetOk).map(([m, label]) => (
              <button
                key={m}
                type="button"
                className="fs-chip as-chip"
                aria-pressed={state.mode === m}
                onClick={() => open(m)}
              >
                {label}
              </button>
            ))}
          </div>
          {state.mode === "card" ? (
            <p className="as-step">
              Put a credit card on the screen with its corner in the top-left corner of the box.
              Drag the slider until the dashed outline meets the card&apos;s edges.
            </p>
          ) : null}
          {state.mode === "ruler" ? (
            <p className="as-step">
              Lay a ruler flat across the box with its 0 on the left edge. Drag the slider until the
              black line is at <RulerMark phone={false} />.
            </p>
          ) : null}
          {state.mode === "sheet" ? (
            <>
              <div className="as-tabs" role="group" aria-label="Paper">
                {(["letter", "a4"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    className="fs-chip as-chip"
                    aria-pressed={state.sheet === k}
                    onClick={() => dispatch({ type: "sheet", sheet: k })}
                  >
                    {k === "a4" ? "A4" : "Letter"}
                  </button>
                ))}
              </div>
              <p className="as-step">
                Put the sheet on the screen with its top-left corner in the corner of the box. Drag
                the slider until the black line meets the sheet&apos;s right edge.
              </p>
            </>
          ) : null}
          {state.mode === "screen" && screen ? (
            <Diagonals
              state={state}
              phone={false}
              coarse={false}
              guess={guessDiagonal(screen)}
              screen={screen}
              dispatch={dispatch}
            />
          ) : (
            <Slider scale={state.scale} coarse={false} label="Outline size" dispatch={dispatch} />
          )}
          <div className="as-acts">
            <Button onClick={onDone}>
              {state.mode === "screen" && screen
                ? `Use ${state.diagonal ?? guessDiagonal(screen)} in`
                : "Done, it matches"}
            </Button>
            <Button variant="ghost" onClick={() => dispatch({ type: "cancel" })}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="as-status">
          <Badge check={state.check} />
          <p>
            {state.check
              ? stored
                ? "Saved on this device."
                : "Kept for this visit."
              : "Sizes are a guess until you check once on this device."}
          </p>
          {state.check ? (
            <Button
              variant="ghost"
              onClick={() =>
                open(!state.check || (state.check === "sheet" && !sheetOk) ? "card" : state.check)
              }
            >
              Check again
            </Button>
          ) : (
            <div className="as-checks">
              <Button onClick={() => open("card")}>Check with a card</Button>
              {sheetOk ? (
                <Button variant="secondary" onClick={() => open("sheet")}>
                  Sheet of paper
                </Button>
              ) : null}
              <Button variant="secondary" onClick={() => open("screen")}>
                Screen size
              </Button>
            </div>
          )}
        </div>
      )}

      <Stage
        ref={stage}
        size={size}
        scale={ready ? state.scale : 0}
        unit={unit}
        box={box}
        style={{ height: BOX_H }}
        label={
          checking && state.mode !== "screen"
            ? `Line up your ${state.mode} here`
            : `${size.id} at actual size; scroll to see all of it`
        }
        onScroll={onScroll}
        overlay={
          ready && checking && state.mode !== "screen" ? (
            <Overlay state={state} unit={unit} boxH={box.h} />
          ) : undefined
        }
        tag={
          <span className="as-tag">
            <b>
              <Dims inches={writeActual(size, "in")} cm={writeActual(size, "cm")} />
            </b>
            <span>{tagText(state.check)}</span>
          </span>
        }
      />

      {checking ? null : (
        <div className="as-under">
          <Readout size={size}>
            {ready && box.w > 0 ? (
              part.fits ? (
                <p>It fits in the box at full size.</p>
              ) : (
                <p>
                  The box shows{" "}
                  <span className="font-mono">
                    <Dims inches={part.in} cm={part.cm} />
                  </span>{" "}
                  of it. Scroll the box to see the rest.
                </p>
              )
            ) : null}
          </Readout>
          <figure className="as-map">
            {ready && box.w > 0 ? (
              <SizeMap
                size={size}
                name={size.id}
                outline={{ ...offset, ...part.view }}
                outlineLabel="On screen"
                outlineCorner="bottom-right"
                width={DESK_MAP.w}
                height={DESK_MAP.h}
                label={`The whole ${size.id} drawn smaller, with the part the box shows marked`}
              />
            ) : (
              <div className="as-map-box" style={{ maxWidth: DESK_MAP.w, height: DESK_MAP.h }} />
            )}
            <figcaption>The whole {size.id}, and the part the box shows (dashed).</figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}

/**
 * F3's actual size viewer: seven sizes at 1:1 once the screen's scale is checked.
 * {@link openspec/specs/actual-size/spec.md#requirement-the-viewer-is-accessible}
 */
export function ActualSizeViewer() {
  const unit = useUnit();
  const screen = useScreen();
  const [state, dispatch] = useReducer(reducer, initialState);
  // Whether the check is in storage; false while it lasts only for this page view.
  const [stored, setStored] = useState(false);
  const titleId = useId();
  const head = useRef<HTMLElement>(null);
  const see = useRef<HTMLButtonElement>(null);

  // The scale is known only in the browser: the saved check for this screen, else the guess.
  // Again only when the screen itself changes (a new pixel ratio), not when the window crosses the
  // phone breakpoint or a phone rotates, so a check in progress keeps its slider.
  const initFor = useRef<string | null>(null);
  useEffect(() => {
    if (!screen || initFor.current === screenKey(screen)) return;
    initFor.current = screenKey(screen);
    const saved = loadCheck(screen);
    setStored(checkStored());
    dispatch({
      type: "init",
      scale: saved?.scale ?? guessScale(screen),
      check: saved?.method ?? null,
    });
  }, [screen]);

  const phone = screen?.phone;
  const checking = isMethod(state.mode);
  const phoneCheck = phone === true && checking;

  // The full view exists only in the phone layout, the sheet only in the desktop one.
  useEffect(() => {
    if (phone === false && state.mode === "full") dispatch({ type: "close" });
    if (phone === true && state.mode === "sheet") dispatch({ type: "open", method: "card" });
  }, [phone, state.mode]);

  // A phone's check step starts with the viewer's title at the top of the screen.
  useEffect(() => {
    if (phoneCheck) head.current?.scrollIntoView?.({ block: "start" });
  }, [phoneCheck]);

  const done = () => {
    if (!screen || !isMethod(state.mode)) return;
    // The screen-size check saves the scale of the size its button names: the picked one or the
    // guess, worked out again, since a slider on another tab may have moved the scale since.
    const diagonal =
      state.mode === "screen" ? (state.diagonal ?? guessDiagonal(screen)) : undefined;
    const scale =
      diagonal === undefined
        ? state.scale
        : (scaleFromDiagonal(screen.w, screen.h, diagonal) ?? state.scale);
    setStored(saveCheck({ scale, method: state.mode }, screen));
    dispatch({ type: "done", scale, diagonal });
  };

  const size = sizeOf(state);
  const title = phoneCheck
    ? state.mode === "screen"
      ? "Pick your screen size"
      : "Check your screen"
    : `${size.id} at actual size`;

  return (
    <section ref={head} className="fs-widget as" aria-labelledby={titleId}>
      <header className="fs-widget-head">
        <h2 id={titleId} className="fs-widget-title">
          {title}
        </h2>
        {phoneCheck ? (
          <Button variant="ghost" onClick={() => dispatch({ type: "cancel" })}>
            Cancel
          </Button>
        ) : null}
      </header>
      <div className="fs-widget-body as-body">
        {phoneCheck && screen ? (
          state.mode === "screen" ? (
            <>
              <Diagonals
                state={state}
                phone={isPhoneScreen(screen)}
                coarse={screen.coarse}
                guess={guessDiagonal(screen)}
                screen={screen}
                dispatch={dispatch}
              />
              <p className="as-why">
                A card is more exact. Screen size works when the page isn&apos;t zoomed.
              </p>
              <Button className="fs-btn-lg fs-btn-block" onClick={done}>
                Use {state.diagonal ?? guessDiagonal(screen)} in
              </Button>
              <div className="as-links">
                <Button variant="ghost" onClick={() => dispatch({ type: "open", method: "card" })}>
                  Use a card instead
                </Button>
              </div>
            </>
          ) : (
            <PhoneLines
              state={state}
              unit={unit}
              narrow={window.innerWidth < 380}
              coarse={screen.coarse}
              dispatch={dispatch}
              onDone={done}
            />
          )
        ) : (
          <SizeGrid state={state} dispatch={dispatch} />
        )}
        {phone !== true ? (
          <Desk
            state={state}
            unit={unit}
            screen={screen}
            stored={stored}
            dispatch={dispatch}
            onDone={done}
          />
        ) : null}
        {phone !== false && !phoneCheck ? (
          <PhoneAnswer state={state} screen={screen} dispatch={dispatch} seeRef={see} />
        ) : null}
      </div>
      {phone && state.mode === "full" ? (
        <FullView
          size={size}
          scale={state.scale}
          check={state.check}
          unit={unit}
          returnTo={see}
          onClose={() => dispatch({ type: "close" })}
        />
      ) : null}
    </section>
  );
}
