"use client";

import { inEighths, LIP, MAT_OVERLAP, toCm, type Unit } from "@framesizes/sizes";
import Link from "next/link";
import { type ReactNode, useEffect, useId, useReducer, useRef } from "react";

import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { U } from "@/components/ui/u";
import { page } from "@/lib/site-map";
import { setUnit, useUnit, useUnitSettled } from "@/lib/unit";

import { type Box, describe, drawing } from "./answer";
import { Diagram } from "./diagram";
import {
  type Action,
  type Field,
  fieldsOf,
  fieldValue,
  INITIAL,
  type Kind,
  KINDS,
  outcome,
  reducer,
  type Step,
  writeLength,
} from "./state";

const UNITS = [
  { value: "in", label: "in" },
  { value: "cm", label: "cm" },
] as const satisfies readonly { value: Unit; label: string }[];

/** A length in both units for server-rendered copy. */
const L = ({ inches }: { inches: number }) => (
  <U in={writeLength(inches, "in")} cm={writeLength(inches, "cm")} />
);

/** Each choice: its card's title and line, step 2's phone heading and the reminder under it. */
const KIND: Record<Kind, { t: string; s: string; h: string; hint: ReactNode }> = {
  inside: {
    t: "Inside, at the back",
    s: "The glass, the backing board or the recess they sit in. This is the frame size.",
    h: "Measure the inside at the back",
    hint: "Turn the frame over. Measure the glass or the backing board, or the recess they sit in, wall to wall.",
  },
  front: {
    t: "Front opening, no mat",
    s: "The opening you see from the front, on a frame with no mat.",
    h: "Measure the front opening",
    hint: (
      <>
        From the frame&apos;s inner edge on one side to the other. The frame covers{" "}
        <L inches={LIP} /> of the picture on each side, so we add <L inches={2 * LIP} />.
      </>
    ),
  },
  mat: {
    t: "Mat opening",
    s: "The opening cut in the mat. Gives the print size and the frames sold with that mat.",
    h: "Measure the mat opening",
    hint: (
      <>
        From one cut edge of the mat to the other. The mat covers <L inches={MAT_OVERLAP} /> of the
        print on each side, so we add <L inches={2 * MAT_OVERLAP} />.
      </>
    ),
  },
  outside: {
    t: "Outside, edge to edge",
    s: "Plus the moulding width seen from the front. For a frame you can't open.",
    h: "Measure the outside and the moulding",
    hint: "Outside: outer edge to outer edge. Moulding: from the outer edge to the glass, seen from the front.",
  },
};

const LABELS: Record<Field, string> = { w: "Width", h: "Height", f: "Moulding width" };
const GLYPHS = ["0", "⅛", "¼", "⅜", "½", "⅝", "¾", "⅞"];
const STEP_NO: Record<Step, number> = { pick: 1, enter: 2, result: 3 };

const place = (b: Box) => ({
  left: `${b.l}%`,
  top: `${b.t}%`,
  width: `${b.w}%`,
  height: `${b.h}%`,
});

/** Phone width: below the site's 768 px breakpoint, where each step is its own screen. */
const isPhone = () =>
  typeof window !== "undefined" && window.matchMedia?.("(max-width: 767px)").matches;

/**
 * F4's wizard: what the visitor measures, the sizes, and the standard, metric or custom size, or a
 * mat's print. One render for both layouts: CSS shows one step at a time below 768 px.
 * {@link openspec/specs/measure-frame/spec.md#requirement-the-wizard-offers-four-measurements-inside-first}
 * {@link openspec/specs/measure-frame/spec.md#requirement-a-desktop-shows-the-steps-and-the-answer-together}
 */
export function MeasureFrame() {
  const unit = useUnit();
  useUnitSettled(unit);
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const id = useId();
  const field = (f: Field) => `${id}-${f}`;

  // {@link openspec/specs/measure-frame/spec.md#requirement-switching-the-unit-converts-the-numbers-already-typed}
  const lastUnit = useRef(unit);
  useEffect(() => {
    if (lastUnit.current === unit) return;
    dispatch({ type: "unit", from: lastUnit.current, to: unit });
    lastUnit.current = unit;
  }, [unit]);

  // On a phone a step change moves focus to the new step's heading.
  const headings = useRef<Partial<Record<Step, HTMLElement | null>>>({});
  const focusStep = useRef(false);
  useEffect(() => {
    if (!focusStep.current) return;
    focusStep.current = false;
    headings.current[state.step]?.focus();
  }, [state.step]);
  const go = (action: Action) => {
    focusStep.current = isPhone();
    dispatch(action);
  };

  const { kind } = state;
  const needs = fieldsOf(kind);
  const out = outcome(state, unit);
  const errors = state.submitted && "errors" in out ? out.errors : {};
  const result = state.submitted && "answer" in out ? out : undefined;
  const answer = result && describe(result, kind, unit);
  const other = result && describe(result, kind, unit === "in" ? "cm" : "in");
  const typed = {
    w: fieldValue(state, "w", unit),
    h: fieldValue(state, "h", unit),
    f: fieldValue(state, "f", unit),
  };
  const draw = drawing(kind, unit, typed, result);
  const findLabel = kind === "mat" ? "Find my print size" : "Find my frame size";
  const active = needs.includes(state.active) ? state.active : "w";
  const activeValue = fieldValue(state, active, "in");

  function find() {
    const now = outcome(state, unit);
    if ("errors" in now) {
      dispatch({ type: "find", unit });
      const first = needs.find((f) => now.errors[f]);
      if (first) document.getElementById(field(first))?.focus();
      return;
    }
    go({ type: "find", unit });
  }

  return (
    <section className="fs-widget mf" data-step={state.step} aria-labelledby={`${id}-t`}>
      <header className="mf-head">
        <button
          type="button"
          className="fs-btn fs-btn-ghost mf-backbtn"
          data-phone="enter"
          data-phone-only=""
          aria-label="Back to step 1"
          onClick={() => go({ type: "back" })}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div className="mf-head-t">
          <span className="mf-stepno" data-phone-only="">
            Step {STEP_NO[state.step]} of 3
          </span>
          <h2 className="mf-title" id={`${id}-t`}>
            Measure your frame
          </h2>
        </div>
        <SegmentedControl
          label="Units"
          size="sm"
          className="fs-units"
          options={UNITS}
          value={unit}
          onChange={setUnit}
        />
      </header>

      <div className="mf-body">
        <div className="mf-main">
          <fieldset className="mf-pick">
            <legend
              className="mf-sh"
              tabIndex={-1}
              ref={(el) => {
                headings.current.pick = el;
              }}
            >
              <span data-desk-only="">1. </span>What are you measuring?
            </legend>
            <div className="mf-opts">
              {KINDS.map((k) => (
                <label key={k} className={`mf-opt${k === kind ? " is-on" : ""}`}>
                  <input
                    type="radio"
                    name={`${id}-kind`}
                    value={k}
                    checked={k === kind}
                    onChange={() => dispatch({ type: "pick", kind: k })}
                  />
                  <span className="mf-dot" aria-hidden="true" />
                  <span className="mf-opt-art">
                    <Diagram kind={k} decorative />
                  </span>
                  <span className="mf-opt-tx">
                    <span className="mf-opt-t">
                      {KIND[k].t}
                      {k === "inside" ? <span className="mf-best">Most exact</span> : null}
                    </span>
                    <span className="mf-opt-s">{KIND[k].s}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mf-enter">
            <h3
              className="mf-sh"
              tabIndex={-1}
              ref={(el) => {
                headings.current.enter = el;
              }}
            >
              <span data-desk-only="">2. Enter the sizes</span>
              <span data-phone-only="">{KIND[kind].h}</span>
            </h3>
            {state.kept ? (
              <p className="mf-kept">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Your numbers are kept. Change what you need.
              </p>
            ) : null}
            <div className="mf-rem">
              <span className="mf-rem-art" data-phone-only="">
                <Diagram kind={kind} decorative />
              </span>
              <p className="mf-rem-p">{KIND[kind].hint}</p>
            </div>
            <div className="mf-fields">
              {needs.map((f) => {
                const error = errors[f];
                const hint =
                  f === "f" ? "Seen from the front: outer edge to the glass." : undefined;
                const eighths = state.fields[f].eighths;
                return (
                  <div
                    key={f}
                    className={`mf-f${f === "f" ? " is-wide" : ""}${f === active ? " is-act" : ""}`}
                  >
                    <label className="mf-label" htmlFor={field(f)}>
                      {LABELS[f]}
                    </label>
                    <div className="mf-in">
                      <input
                        id={field(f)}
                        className="mf-input"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder={unit === "cm" ? "0.0" : "0"}
                        value={state.fields[f].text}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error || hint ? `${field(f)}-d` : undefined}
                        onChange={(e) => dispatch({ type: "type", field: f, text: e.target.value })}
                        onFocus={() => dispatch({ type: "focus", field: f })}
                        onBlur={() => dispatch({ type: "blur", field: f, unit })}
                      />
                      <span className="mf-suf" aria-hidden="true">
                        {eighths ? <b className="u-in">{GLYPHS[eighths]}</b> : null}
                        <U in="in" cm="cm" />
                      </span>
                    </div>
                    {error ? (
                      <span className="mf-error" id={`${field(f)}-d`}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v4M12 16h.01" />
                        </svg>
                        {error}
                      </span>
                    ) : hint ? (
                      <span className="mf-hint" id={`${field(f)}-d`}>
                        {hint}
                      </span>
                    ) : null}
                    {f === "f" ? (
                      <details className="mf-round">
                        <summary>Rounded edge?</summary>
                        <Diagram kind="round" />
                        <p>
                          Measure it flat, as seen from the front: from the outermost point to the
                          glass. A tape bent around the curve reads long.
                        </p>
                      </details>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="u-in">
              <div
                className="mf-eighths"
                role="group"
                aria-label={`Eighths of an inch for the ${LABELS[active].toLowerCase()}`}
              >
                <p className="mf-8l">
                  <span>Add eighths to the {LABELS[active].toLowerCase()}</span>
                  <b>{activeValue ? `${inEighths(activeValue)} in` : "—"}</b>
                </p>
                <div className="mf-8grid">
                  {GLYPHS.map((g, n) => (
                    <button
                      key={g}
                      type="button"
                      className="mf-8"
                      aria-pressed={state.fields[active].eighths === n}
                      aria-label={n ? `${g} in` : "No fraction"}
                      onClick={() => dispatch({ type: "eighth", eighths: n })}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <span className="mf-hint" data-desk-only="">
                  Or type the whole number: 8 1/8 or 8.125.
                </span>
              </div>
            </div>
            <p className="mf-hint u-cm">
              Centimetres, to one decimal, like {toCm(8.125).toFixed(1)}.
            </p>
          </div>
        </div>

        <div className="mf-side">
          <h3
            className="mf-sh"
            tabIndex={-1}
            ref={(el) => {
              headings.current.result = el;
            }}
          >
            <span data-desk-only="">3. Your answer</span>
            <span data-phone-only="">{kind === "mat" ? "Your mat" : "Your frame"}</span>
          </h3>

          {/* {@link openspec/specs/measure-frame/spec.md#requirement-the-answer-is-announced-and-drawn} */}
          <div className="mf-live" aria-live="polite">
            {answer && other ? (
              <>
                <p className="mf-res-h">{answer.head}</p>
                <div className="mf-result">
                  <span className="mf-label">{answer.label}</span>
                  <span className="mf-result-value">{answer.value}</span>
                  <span className="mf-result-sub">{other.value}</span>
                </div>
              </>
            ) : (
              <p className="mf-empty">
                {state.submitted
                  ? "Check the marked fields, then try again."
                  : `Enter both sides and press ${findLabel}.`}
              </p>
            )}
          </div>

          {answer ? (
            <div className="mf-res">
              <p>{answer.how}</p>
              {answer.holds ? (
                <div className="mf-holds">
                  <span className="mf-label">What it holds</span>
                  <p>{answer.holds}</p>
                  {answer.link && page(answer.link.page).live ? (
                    <Link className="link" href={answer.link.href}>
                      {answer.link.text}
                    </Link>
                  ) : null}
                </div>
              ) : null}
              {answer.mat ? (
                <div className="mf-holds">
                  <span className="mf-label">{answer.mat.label}</span>
                  {answer.mat.frames.length ? (
                    <ul className="mf-frames">
                      {answer.mat.frames.map((f) => (
                        <li key={f} className="mf-fchip">
                          {f}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <p>{answer.mat.text}</p>
                </div>
              ) : null}
              {answer.nearest ? (
                <>
                  <div className="mf-near">
                    <span className="mf-label">Closest standard sizes</span>
                    <ul>
                      {answer.nearest.map((n) => (
                        <li key={n.id} className="mf-near-i">
                          <span className="mf-near-v">{n.id}</span>
                          <span className="mf-near-d">{n.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant="ghost"
                    className="mf-left"
                    onClick={() => go({ type: "checkSpot" })}
                  >
                    Check where to measure
                  </Button>
                </>
              ) : null}
            </div>
          ) : null}

          <figure className="mf-draw">
            <div className="mf-stage" role="img" aria-label={draw.label}>
              <div className="mf-r mf-oak" style={place(draw.outside)} />
              {kind === "inside" ? (
                <div className="mf-r mf-backing" style={place(draw.inside)}>
                  <span className="mf-bl">Backing board</span>
                </div>
              ) : null}
              {kind !== "mat" && draw.opening ? (
                <div className="mf-r mf-open" style={place(draw.opening)} />
              ) : null}
              {kind === "mat" && draw.opening && draw.window ? (
                <>
                  <div className="mf-r mf-mat" style={place(draw.opening)} />
                  <div className="mf-r mf-win" style={place(draw.window)} />
                </>
              ) : null}
              {kind !== "inside" ? (
                <div className="mf-r mf-hid" style={place(draw.inside)} />
              ) : null}
              {draw.tapes.map((t, i) => (
                <div key={`t${i}`} className={`mf-tp ${t.dir}`} style={place(t.box)} />
              ))}
              {draw.tapes.map((t, i) => (
                <span
                  key={`l${i}`}
                  className={`mf-tl mf-tl-${kind === "outside" ? "out" : "in"}${i}`}
                  style={{ left: `${t.at.l}%`, top: `${t.at.t}%` }}
                >
                  {t.text}
                </span>
              ))}
              <span className="mf-view">{draw.view}</span>
            </div>
            {draw.legend.length ? (
              <ul className="mf-legend">
                {draw.legend.map((g) => (
                  <li key={g.name} className={g.on ? "is-on" : undefined}>
                    <span className={`mf-sw ${g.swatch}`} aria-hidden="true" />
                    <span>{g.name}</span>
                    <span className="v">{g.value}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <figcaption>{draw.caption}</figcaption>
          </figure>
        </div>
      </div>

      <div className="mf-bar">
        <Button data-phone="pick" data-phone-only="" onClick={() => go({ type: "enter" })}>
          Enter the sizes
        </Button>
        <Button data-phone="enter" onClick={find}>
          {findLabel}
        </Button>
        <Button
          variant="secondary"
          data-phone="result"
          data-phone-only=""
          onClick={() => go({ type: "change" })}
        >
          Change measurement
        </Button>
        {answer || state.step === "result" ? (
          <Button variant="ghost" data-phone="result" onClick={() => go({ type: "reset" })}>
            Measure another frame
          </Button>
        ) : null}
      </div>
    </section>
  );
}
