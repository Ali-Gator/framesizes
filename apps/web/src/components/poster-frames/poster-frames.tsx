"use client";

import { posterFrames, POSTERS, toWholeCm, type Unit } from "@framesizes/sizes";
import { useId, useLayoutEffect, useReducer, useRef } from "react";

import { PageLink } from "@/components/site/page-link";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { U } from "@/components/ui/u";
import { useUnit, useUnitSettled } from "@/lib/unit";

import { type Answer, describe, drawing } from "./answer";
import { PosterDrawing } from "./poster-drawing";
import { type Field, FIELDS, INITIAL, poster, reducer } from "./state";

const MAT = [
  { value: "no", label: "Without a mat" },
  { value: "yes", label: "With a mat" },
] as const;
const ORIENTATION = [
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
] as const;
const LABELS: Record<Field, string> = { w: "Width", h: "Height" };

/** A chip's name and the size under it: `24×36` over `61×91 cm`, `A2` over `420×594 mm`. */
function chipText(id: string, landscape: boolean) {
  const p = POSTERS.find((x) => x.id === id);
  if (!p) throw new Error(id);
  const [w, h] = landscape ? [p.h, p.w] : [p.w, p.h];
  if (p.group === "a-series")
    return { name: p.id, sub: `${Math.round(w * 25.4)}×${Math.round(h * 25.4)} mm` };
  return { name: `${w}×${h}`, sub: `${toWholeCm(w)}×${toWholeCm(h)} cm` };
}

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);
const BackIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m12 19-7-7 7-7M19 12H5" />
  </svg>
);

/**
 * F6's poster frame picker: ten poster chips or a typed size, with or without a mat, portrait or
 * landscape, the answer and a drawing to one scale. One render for both layouts: CSS places the
 * answer beside the controls or under them.
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-widget-opens-on-a-24x36-poster-without-a-mat}
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-chips-name-each-poster-in-both-units}
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-a-desktop-shows-the-controls-beside-the-answer-a-phone-one-column}
 */
export function PosterFrames() {
  const unit = useUnit();
  useUnitSettled(unit);
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const id = useId();

  // {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-typed-size-converts}
  // INITIAL holds inches; a client-side visit may first render in cm, which converts it then.
  const lastUnit = useRef<Unit>("in");
  useLayoutEffect(() => {
    if (lastUnit.current === unit) return;
    dispatch({ type: "unit", from: lastUnit.current, to: unit });
    lastUnit.current = unit;
  }, [unit]);

  const custom = state.mode === "custom";
  const picked = poster(state, unit);
  const frames = "size" in picked ? posterFrames(picked.size) : undefined;
  const sized = "size" in picked ? picked : undefined;
  const answer =
    sized && frames
      ? {
          in: describe(sized, frames, state.mat, state.pick, "in"),
          cm: describe(sized, frames, state.mat, state.pick, "cm"),
        }
      : undefined;
  const draw = sized && frames ? drawing(sized, frames, state.mat, state.pick) : undefined;
  const error = "error" in picked ? picked.error : undefined;
  const message = `${id}-m`;
  const hint = `${id}-hint`;

  return (
    <section className="fs-widget mc pf" aria-labelledby={`${id}-t`}>
      <header className="mc-head">
        <h2 className="mc-title" id={`${id}-t`}>
          Find the frame for your poster
        </h2>
      </header>

      <div className="mc-body">
        <div className="mc-main">
          {custom ? (
            <div className="pf-grp">
              <button type="button" className="pf-back" onClick={() => dispatch({ type: "chips" })}>
                <BackIcon />
                Back to standard sizes
              </button>
              <fieldset className="pf-custom">
                <legend className="mc-label">Custom size</legend>
                <div className="mc-fields">
                  {FIELDS.map((f) => (
                    <div key={f} className="mc-f">
                      <label className="mc-label" htmlFor={`${id}-${f}`}>
                        {LABELS[f]}
                      </label>
                      <div className="mc-in">
                        <input
                          id={`${id}-${f}`}
                          className="mc-input"
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          spellCheck={false}
                          placeholder={unit === "cm" ? "0.0" : "0"}
                          value={state.fields[f]}
                          aria-invalid={error?.[f] ? true : undefined}
                          aria-describedby={error ? message : hint}
                          onChange={(e) =>
                            dispatch({ type: "type", field: f, text: e.target.value })
                          }
                        />
                        <span className="mc-suf" aria-hidden="true">
                          <U in="in" cm="cm" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {error ? (
                  <span className="mc-error" id={message}>
                    <ErrorIcon />
                    Enter a width and a height above 0.
                  </span>
                ) : (
                  <p className="mc-hint" id={hint}>
                    <U
                      in="Fractions work: 13 1/2, 13.5 or 13½."
                      cm="Centimetres, to one decimal, like 33.5."
                    />
                  </p>
                )}
              </fieldset>
            </div>
          ) : (
            <div className="pf-grp">
              <span className="mc-label" aria-hidden="true">
                Poster size
              </span>
              <div className="pf-chips" role="group" aria-label="Poster size">
                {POSTERS.map((p) => {
                  const t = chipText(p.id, state.landscape);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className="mc-chip pf-chip"
                      aria-pressed={state.poster === p.id}
                      onClick={() => dispatch({ type: "poster", id: p.id })}
                    >
                      <span className="pf-chip-n">{t.name}</span>{" "}
                      <span className="pf-chip-s">{t.sub}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="mc-chip pf-cchip"
                  aria-pressed={false}
                  onClick={() => dispatch({ type: "custom" })}
                >
                  Custom size
                </button>
              </div>
            </div>
          )}

          <div className="pf-segs">
            <div className="pf-grp pf-mat">
              <span className="mc-label" aria-hidden="true">
                Mat
              </span>
              <SegmentedControl
                label="Mat"
                options={MAT}
                value={state.mat ? "yes" : "no"}
                onChange={(v) => dispatch({ type: "mat", on: v === "yes" })}
              />
            </div>
            {custom ? (
              <p className="pf-orient-note">
                Width first. A size wider than it is tall is landscape.
              </p>
            ) : (
              <div className="pf-grp">
                <span className="mc-label" aria-hidden="true">
                  Orientation
                </span>
                <SegmentedControl
                  label="Orientation"
                  options={ORIENTATION}
                  value={state.landscape ? "landscape" : "portrait"}
                  onChange={(v) => dispatch({ type: "landscape", on: v === "landscape" })}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mc-side">
          <h3 className="mc-sh">Your answer</h3>
          {/* {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-answer-is-announced-and-drawn-to-one-scale} */}
          <div className="mc-live pf-answer" aria-live="polite">
            {answer ? (
              <Result
                a={answer}
                onPick={(i) => dispatch({ type: "pick", i })}
                onMat={(on) => dispatch({ type: "mat", on })}
              />
            ) : (
              <p className="mc-empty">
                {error
                  ? "Fix the size above to see a frame."
                  : "Type the poster's width and height. The frame shows here."}
              </p>
            )}
          </div>
        </div>

        {draw ? <PosterDrawing draw={draw} /> : null}
      </div>
    </section>
  );
}

/** The answer in both units: the head, the frame size, how it was found, the cards and the box. */
function Result({
  a,
  onPick,
  onMat,
}: {
  a: { in: Answer; cm: Answer };
  onPick: (i: number) => void;
  onMat: (on: boolean) => void;
}) {
  const { in: i, cm: c } = a;
  return (
    <div className="mc-res">
      <p className="mc-res-h">
        <U in={i.head} cm={c.head} />
      </p>
      <div className="mc-result">
        <span className="mc-label">{i.label}</span>
        <span className="mc-result-value">
          <U in={i.value} cm={c.value} />
        </span>
        <span className="mc-result-sub">
          <U in={i.sub} cm={c.sub} />
        </span>
      </div>
      {i.use ? <p className="pf-use">{i.use}</p> : null}
      <p className="mc-how">
        <U in={i.how} cm={c.how} />
      </p>
      <div className="mc-opts">
        {i.cards.map((card, n) => {
          const other = c.cards[n];
          const head = (
            <span className="pf-k">
              <span className="mc-label">{card.title}</span>
              {card.selected ? <span className="pf-drawn">In the drawing</span> : null}
            </span>
          );
          const rows = card.rows.map((r, k) => {
            const o = other?.rows[k];
            return (
              <span key={k} className="pf-row">
                <span className="pf-line">
                  <span className={r.custom ? "mc-xchip" : "mc-fchip"}>
                    <U in={r.chip} cm={o?.chip ?? r.chip} />
                  </span>
                  {r.badge ? (
                    <span className={`pf-badge ${r.badge.pre ? "pf-pre" : "pf-cut"}`}>
                      <CheckIcon />
                      {r.badge.text}
                    </span>
                  ) : null}
                </span>
                {r.border ? (
                  <span className="pf-bd font-mono">
                    <U in={r.border} cm={o?.border ?? r.border} />
                  </span>
                ) : null}
                {r.note ? (
                  <span className="pf-note">
                    <U in={r.note} cm={o?.note ?? r.note} />
                  </span>
                ) : null}
              </span>
            );
          });
          const pick = card.pick;
          return pick === undefined ? (
            <div key={card.title} className="mc-opt">
              {head}
              {rows}
            </div>
          ) : (
            <button
              key={card.title}
              type="button"
              className="mc-opt pf-pick"
              aria-pressed={!!card.selected}
              onClick={() => onPick(pick)}
            >
              {head}
              {rows}
            </button>
          );
        })}
      </div>
      {i.calculator ? (
        <p className="pf-link">
          <PageLink id="F5">Try other mat widths in the frame and mat calculator</PageLink>
        </p>
      ) : null}
      {i.box && c.box ? (
        <div className="pf-more">
          <p>
            <U in={i.box.text} cm={c.box.text} />
          </p>
          <Button variant="secondary" onClick={() => onMat(i.box?.mat ?? true)}>
            {i.box.button}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
