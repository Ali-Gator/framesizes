"use client";

import { inEighths, LIP, MAT_WIDTHS, toCm, type Unit } from "@framesizes/sizes";
import { useId, useLayoutEffect, useReducer, useRef } from "react";

import { writeLength } from "@/components/measure-frame/state";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { U } from "@/components/ui/u";
import { setUnit, useUnit, useUnitSettled } from "@/lib/unit";

import { describe, drawing } from "./answer";
import { MatDrawing } from "./mat-drawing";
import { type Field, FIELDS, INITIAL, inches, outcome, reducer } from "./state";

const UNITS = [
  { value: "in", label: "in" },
  { value: "cm", label: "cm" },
] as const satisfies readonly { value: Unit; label: string }[];

const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

/**
 * F5's calculator: from a print and a mat border to the frame, or from a frame to the print, with
 * Reverse between them. One render for both layouts: CSS places the answer beside or under.
 * {@link openspec/specs/frame-mat-calculator/spec.md#requirement-the-calculator-starts-from-a-print-with-a-2-inch-border}
 * {@link openspec/specs/frame-mat-calculator/spec.md#requirement-a-desktop-shows-the-inputs-beside-the-answer-a-phone-one-column}
 */
export function FrameMat() {
  const unit = useUnit();
  useUnitSettled(unit);
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const id = useId();
  const field = (f: Field) => `${id}-${f}`;

  // {@link openspec/specs/frame-mat-calculator/spec.md#requirement-switching-the-unit-converts-the-numbers-already-typed}
  // INITIAL holds inches; a client-side visit may first render in cm, which converts it then.
  const lastUnit = useRef<Unit>("in");
  useLayoutEffect(() => {
    if (lastUnit.current === unit) return;
    dispatch({ type: "unit", from: lastUnit.current, to: unit });
    lastUnit.current = unit;
  }, [unit]);

  const { from } = state;
  const isPrint = from === "print";
  const out = outcome(state, unit);
  const errors = state.submitted && "errors" in out ? out.errors : {};
  const result = state.submitted && "answer" in out ? out : undefined;
  const answer = result && describe(result, from, unit);
  const other = result && describe(result, from, unit === "in" ? "cm" : "in");
  const draw = drawing(result, from, unit);
  const border = inches(state.fields.m, unit);
  const findLabel = isPrint ? "Find my frame size" : "Find the print that fits";
  const labels: Record<Field, string> = isPrint
    ? { w: "Print width", h: "Print height", m: "Mat border" }
    : { w: "Frame width", h: "Frame height", m: "Mat border" };

  function find() {
    dispatch({ type: "find" });
    const now = outcome(state, unit);
    if ("errors" in now) {
      const first = FIELDS.find((f) => now.errors[f]);
      if (first) document.getElementById(field(first))?.focus();
    }
  }

  const input = (f: Field, describedBy?: string) => (
    <div className="mc-in">
      <input
        id={field(f)}
        className="mc-input"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        placeholder={unit === "cm" ? "0.0" : "0"}
        value={state.fields[f]}
        aria-invalid={errors[f] ? true : undefined}
        aria-describedby={describedBy}
        onChange={(e) => dispatch({ type: "type", field: f, text: e.target.value })}
      />
      <span className="mc-suf" aria-hidden="true">
        <U in="in" cm="cm" />
      </span>
    </div>
  );
  const error = (f: Field) =>
    errors[f] ? (
      <span className="mc-error" id={`${field(f)}-d`}>
        <ErrorIcon />
        {errors[f]}
      </span>
    ) : null;

  return (
    <section className="fs-widget mc" aria-labelledby={`${id}-t`}>
      <header className="mc-head">
        <h2 className="mc-title" id={`${id}-t`}>
          Frame and mat calculator
        </h2>
        <SegmentedControl
          label="Units"
          size="sm"
          className="fs-units"
          options={UNITS}
          value={unit}
          onChange={setUnit}
        />
      </header>

      <div className="mc-body">
        <div className="mc-main">
          <div className="mc-dir" role="group" aria-label="Direction">
            <div className="mc-end is-from">
              <span className="mc-end-k">You enter</span>
              <span className="mc-end-t">{isPrint ? "Print size" : "Frame size"}</span>
            </div>
            <button
              type="button"
              className="mc-swap"
              aria-label={isPrint ? "Reverse: start from a frame" : "Reverse: start from a print"}
              title="Reverse"
              onClick={() =>
                dispatch({
                  type: "swap",
                  carry: result ? (isPrint ? result.answer.frame : result.answer.print) : undefined,
                  unit,
                })
              }
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" />
              </svg>
            </button>
            <div className="mc-end">
              <span className="mc-end-k">You get</span>
              <span className="mc-end-t">{isPrint ? "Frame size" : "Print size"}</span>
            </div>
          </div>

          <div className="mc-fields">
            {(["w", "h"] as const).map((f) => (
              <div key={f} className="mc-f">
                <label className="mc-label" htmlFor={field(f)}>
                  {labels[f]}
                </label>
                {input(f, errors[f] ? `${field(f)}-d` : `${id}-frac`)}
                {error(f)}
              </div>
            ))}
          </div>
          <p className="mc-hint" id={`${id}-frac`}>
            <U
              in="Fractions work: 8 1/2, 8.5 or 8½."
              cm="Centimetres, to one decimal, like 20.3."
            />
          </p>

          <div className="mc-mat">
            <div className="mc-f">
              <label className="mc-label" htmlFor={field("m")}>
                Mat border
              </label>
              {input("m", `${field("m")}-d`)}
              {error("m") ?? (
                <span className="mc-hint" id={`${field("m")}-d`}>
                  The cut width on each side. The frame&apos;s lip covers about{" "}
                  <U in={writeLength(LIP, "in")} cm={writeLength(LIP, "cm")} /> of it.
                </span>
              )}
            </div>
            <div className="mc-chips" role="group" aria-label="Common mat borders">
              {MAT_WIDTHS.map((w) => (
                <button
                  key={w}
                  type="button"
                  className="mc-chip"
                  aria-pressed={border !== undefined && Math.abs(border - w) < 0.02}
                  onClick={() => dispatch({ type: "preset", inches: w, unit })}
                >
                  <U in={`${inEighths(w)} in`} cm={`${toCm(w).toFixed(1)} cm`} />
                </button>
              ))}
            </div>
          </div>

          <div className="mc-bar">
            <Button onClick={find}>{findLabel}</Button>
            {answer ? (
              <Button variant="ghost" onClick={() => dispatch({ type: "reset", unit })}>
                Start over
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mc-side">
          <h3 className="mc-sh">Your answer</h3>
          {/* {@link openspec/specs/frame-mat-calculator/spec.md#requirement-the-answer-is-announced-and-drawn} */}
          <div className="mc-live" aria-live="polite">
            {answer && other ? (
              <>
                <p className="mc-res-h">{answer.head}</p>
                <div className="mc-result">
                  <span className="mc-label">{answer.label}</span>
                  <span className="mc-result-value">{answer.value}</span>
                  <span className="mc-result-sub">{other.value}</span>
                </div>
              </>
            ) : (
              <p className="mc-empty">
                {state.submitted
                  ? "Check the marked fields, then try again."
                  : isPrint
                    ? "Enter your print size and a mat border. The frame size and mat opening show here."
                    : "Enter your frame size and a mat border. The largest print that fits shows here."}
              </p>
            )}
          </div>
          {answer ? (
            <div className="mc-res">
              <p className="mc-open">
                <span className="mc-label">Mat opening</span>
                <b>{answer.opening}</b>
              </p>
              <p className="mc-how">{answer.how}</p>
              <div className="mc-opts">
                {answer.cards.map((c) => (
                  <div key={c.title} className="mc-opt">
                    <span className="mc-label">{c.title}</span>
                    {c.rows.map((r) => (
                      <div key={r.chip} className="mc-row">
                        <span className={r.custom ? "mc-xchip" : "mc-fchip"}>{r.chip}</span>
                        {r.border ? <p className="mc-bd">{r.border}</p> : null}
                        {r.note ? <p className="mc-note">{r.note}</p> : null}
                      </div>
                    ))}
                    {c.text ? <p className="mc-opt-p">{c.text}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <MatDrawing draw={draw} className="mc-fig" />
      </div>
    </section>
  );
}
