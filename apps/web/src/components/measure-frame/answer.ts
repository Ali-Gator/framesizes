import {
  CATALOG,
  type Frame,
  frameMeasurements,
  type Identified,
  inEighths,
  LIP,
  MAT_OVERLAP,
  MEASURE_TOLERANCE,
  type Size,
  toCm,
  type Unit,
  writeEighths,
  writeSize,
} from "@framesizes/sizes";

import type { PageId } from "@/lib/site-map";

import { type Kind, writeLength } from "./state";

/** "an" before a size read aloud with a vowel sound: 8, 11, 18, 80, A4. */
export const article = (text: string) => (/^(8|11(?!\d)|18(?!\d)|A)/.test(text) ? "an" : "a");
const withArticle = (text: string) => `${article(text)} ${text}`;

/** A size in the visitor's unit: eighths of an inch, or centimetres with one decimal kept. */
export const writeIn = (size: Size, unit: Unit) =>
  unit === "cm" ? `${toCm(size.w).toFixed(1)} × ${toCm(size.h).toFixed(1)} cm` : writeEighths(size);

/** The ⅜ in allowance; 0.95 cm, so "about 1 cm" in centimetres. */
const allowance = (unit: Unit) =>
  unit === "cm" ? "about 1 cm" : `${inEighths(MEASURE_TOLERANCE)} in`;

const id = (size: Size) => writeSize(size, "search");
const upright = (f: Frame) => (f.w <= f.h ? id(f) : `${f.h}x${f.w}`);
const same = (a: Size, b: Size) => Math.abs(a.w - b.w) < 1e-6 && Math.abs(a.h - b.h) < 1e-6;

export interface AnswerLink {
  page: PageId;
  href: string;
  text: string;
}

export interface Answer {
  /** "Frame size", "Custom size" or "Print size". */
  label: string;
  head: string;
  value: string;
  how: string;
  /** What a standard or metric frame holds. */
  holds?: string;
  link?: AnswerLink;
  /** A custom size's closest standard sizes. */
  nearest?: readonly { id: string; text: string }[];
  /** A mat: the frames sold with it. */
  mat?: { label: string; frames: readonly string[]; text: string };
}

/** "½ in narrower", or "the same width" when the sides match. */
const side = (d: number, unit: Unit, more: string, same: string) =>
  Math.abs(d) < 1e-9 ? `the same ${same}` : `${writeLength(Math.abs(d), unit)} ${more}`;

/**
 * The answer's sentences in one unit, from the engine's answer and the measured numbers.
 * {@link openspec/specs/measure-frame/spec.md#requirement-a-standard-size-answer-says-how-it-was-found}
 * {@link openspec/specs/measure-frame/spec.md#requirement-a-metric-size-answer-names-the-metric-frame}
 * {@link openspec/specs/measure-frame/spec.md#requirement-a-custom-size-answer-names-the-closest-standard-sizes}
 * {@link openspec/specs/measure-frame/spec.md#requirement-a-mat-answer-names-the-print-and-the-frames-sold-with-that-mat}
 */
export function describe(
  { answer, measured, face }: { answer: Identified; measured: Size; face?: number },
  kind: Kind,
  unit: Unit,
): Answer {
  const sz = (s: Size) => writeIn(s, unit);
  const ln = (x: number) => writeLength(x, unit);

  if (answer.kind === "mat") {
    const print = answer.size;
    const frames = answer.frames;
    const pid = frames[0]?.mat ? id(frames[0].mat) : undefined;
    const ids = frames.map((f) => f.id);
    let text =
      "No frame in our list is sold with a pre-cut mat this size. The mat was likely cut to order.";
    if (pid && ids.length === 1)
      text = `Mats for ${withArticle(pid)} print are sold in ${withArticle(ids[0] ?? "")} frame.`;
    else if (pid)
      text = `Mats for ${withArticle(pid)} print are sold in ${ids.slice(0, -1).join(", ")} and ${ids.at(-1)} frames. To tell which one you have, measure the inside at the back.`;
    return {
      label: "Print size",
      head: pid
        ? `This mat holds ${withArticle(pid)} print.`
        : `This mat holds ${withArticle(sz(print))} print.`,
      value: sz(print),
      how: `The mat opening is ${sz(measured)}. The mat covers ${ln(MAT_OVERLAP)} of the print on each side, so the print is ${sz(print)}.`,
      mat: {
        label: ids.length ? "Frames sold with this mat" : "Frames sold with this mat: none",
        frames: ids.map((f) => `${f} frame`),
        text,
      },
    };
  }

  const size = answer.size;
  const how = (target: Size, name: string) => {
    const tol = same(size, target) ? "" : ` Each side is within ${allowance(unit)} of ${name}.`;
    if (kind === "front")
      return `You measured ${withArticle(sz(measured))} opening. The frame covers ${ln(LIP)} of the picture on each side, so the inside is ${sz(size)}.${tol}`;
    if (kind === "outside")
      return `${sz(measured)} outside, less two ${ln(face ?? 0)} mouldings, plus the ${ln(LIP)} lip on each side, gives ${sz(size)}.${tol}`;
    return `You measured ${sz(measured)}.${tol}`;
  };

  if (answer.kind === "standard") {
    const f = answer.frame;
    const up = upright(f);
    const mat = f.mat ? id(f.mat) : undefined;
    return {
      label: "Frame size",
      head: `Your frame is ${withArticle(f.id)}${f.orientation === "landscape" ? ` (landscape ${up})` : ""}.`,
      value: sz(f),
      how: how(f, `the standard ${sz(f)}`),
      holds: `It holds ${withArticle(f.id)} print with no mat${mat ? `, or ${withArticle(mat)} print with a pre-cut mat.` : "."}`,
      link:
        up === "8x10"
          ? { page: "F3", href: "/how-big-is-8x10", text: "See 8x10 at actual size" }
          : { page: "F1", href: `/?size=${f.id}`, text: `Find ${f.id} in the frame size chart` },
    };
  }

  if (answer.kind === "metric") {
    const m = answer.metric;
    const name = m.label;
    const close = answer.close ? ` ${answer.close.id} is close too, but ${name} is closer.` : "";
    return {
      label: "Frame size",
      head: `Your frame is ${withArticle(name)}, a metric size.`,
      value: sz(m),
      how: `${how(m, name)}${close}`,
      holds: `It holds ${withArticle(name)} print. Look for frames sold as ${name}.`,
      link:
        name === "A4" || name === "A3"
          ? {
              page: "F3",
              href: "/how-big-is-8x10",
              text: `Compare ${name} and 8x10 at actual size`,
            }
          : undefined,
    };
  }

  const below = (f: Frame) => ({
    id: f.id,
    text: `${side(size.w - f.w, unit, "narrower", "width")} and ${side(size.h - f.h, unit, "shorter", "height")}. Too small to fill your frame.`,
  });
  const above = (f: Frame) => ({
    id: f.id,
    text: `Next size up: ${side(f.w - size.w, unit, "wider", "width")} and ${side(f.h - size.h, unit, "taller", "height")}. Your picture fits with a mat cut to size.`,
  });
  return {
    label: "Custom size",
    head: `No standard frame matches ${sz(size)}.`,
    value: sz(size),
    how: `No standard size is within ${allowance(unit)} of it on both sides, so it is likely a custom size. Before you buy, check where you measured: the front opening is ${ln(2 * LIP)} smaller than the inside.`,
    nearest: [
      ...(answer.below ? [below(answer.below)] : []),
      ...(answer.above ? [above(answer.above)] : []),
      ...(answer.squareBelow ? [below(answer.squareBelow)] : []),
      ...(answer.squareAbove ? [above(answer.squareAbove)] : []),
    ],
  };
}

/** A box on the drawing's stage, in percent of its width and height. */
export interface Box {
  l: number;
  t: number;
  w: number;
  h: number;
}

export interface Drawing {
  view: "Back of the frame" | "Front of the frame";
  label: string;
  caption: string;
  outside: Box;
  /** The frame size: the backing board seen from the back, a dashed outline from the front. */
  inside: Box;
  /** The front opening, or the mat board around a mat's window. */
  opening?: Box;
  window?: Box;
  tapes: readonly { box: Box; dir: "h" | "v"; text: string; at: Box }[];
  legend: readonly { name: string; value: string; swatch: string; on: boolean }[];
}

/** The stage's size in px, for the layout maths; the stage keeps this 4:3 shape. */
const W = 400;
const H = 300;
const pct = (b: { l: number; t: number; w: number; h: number }): Box => ({
  l: (b.l / W) * 100,
  t: (b.t / H) * 100,
  w: (b.w / W) * 100,
  h: (b.h / H) * 100,
});

const NAMES: Record<Kind, string> = {
  inside: "the inside, at the back",
  front: "the front opening",
  mat: "the mat opening",
  outside: "the outside edges and the moulding",
};
/** The example moulding seen from the front, the same on every catalog frame. */
const FACE = frameMeasurements(CATALOG[0] as Frame).face;

/**
 * The live drawing: the frame from the back (inside) or the front, the yellow tape where the
 * visitor measures labelled with what they typed, and once there is an answer a legend.
 * {@link openspec/specs/measure-frame/spec.md#requirement-the-answer-is-announced-and-drawn}
 */
export function drawing(
  kind: Kind,
  unit: Unit,
  typed: { w?: number; h?: number; f?: number },
  result?: { answer: Identified; measured: Size; face?: number },
): Drawing {
  const res = result?.answer;
  const out = kind === "outside";
  let frame: Size = { w: 8, h: 10 };
  let win: Size | undefined;
  let print: Size | undefined;
  if (kind === "mat") {
    const first = res?.kind === "mat" ? res.frames[0] : undefined;
    print = res ? res.size : { w: 8, h: 10 };
    win = result ? result.measured : { w: 7.5, h: 9.5 };
    frame = first ?? (res ? { w: print.w + 3, h: print.h + 3 } : { w: 11, h: 14 });
  } else if (res?.kind === "standard") frame = res.frame;
  else if (res?.kind === "metric") frame = res.metric;
  else if (res) frame = res.size;

  let face = FACE;
  let outside = { w: frame.w - 2 * LIP + 2 * face, h: frame.h - 2 * LIP + 2 * face };
  let inside = frame;
  if (out && result) {
    face = result.face ?? FACE;
    outside = result.measured;
    inside = res?.size ?? frame;
  }
  const opening = { w: outside.w - 2 * face, h: outside.h - 2 * face };

  const pad = out ? { l: 84, r: 40, t: 52, b: 20 } : { l: 28, r: 28, t: 28, b: 28 };
  const k = Math.min((W - pad.l - pad.r) / outside.w, (H - pad.t - pad.b) / outside.h);
  const cx = pad.l + (W - pad.l - pad.r) / 2;
  const cy = pad.t + (H - pad.t - pad.b) / 2;
  const at = (s: Size) => ({
    l: cx - (s.w * k) / 2,
    t: cy - (s.h * k) / 2,
    w: s.w * k,
    h: s.h * k,
  });
  const bO = at(outside);
  const bS = at(inside);
  const bOp = at(opening);
  const bW = win && at(win);
  const R = kind === "inside" ? bS : kind === "front" ? bOp : kind === "mat" && bW ? bW : bO;

  const lab = (x: number | undefined) => (x ? writeLength(x, unit) : "?");
  const tapes: Drawing["tapes"][number][] = out
    ? [
        {
          dir: "h",
          box: pct({ l: R.l, t: R.t - 22, w: R.w, h: 12 }),
          text: lab(typed.w),
          at: pct({ l: R.l + R.w / 2, t: R.t - 26, w: 0, h: 0 }),
        },
        {
          dir: "v",
          box: pct({ l: R.l - 22, t: R.t, w: 12, h: R.h }),
          text: lab(typed.h),
          at: pct({ l: R.l - 26, t: R.t + R.h / 2, w: 0, h: 0 }),
        },
        {
          dir: "h",
          box: pct({ l: bO.l, t: bO.t + bO.h * 0.62 - 6, w: face * k, h: 12 }),
          text: lab(typed.f),
          at: pct({ l: bO.l + (face * k) / 2, t: bO.t + bO.h * 0.62 + 10, w: 0, h: 0 }),
        },
      ]
    : [
        {
          dir: "h",
          box: pct({ l: R.l, t: R.t + R.h * 0.3 - 6, w: R.w, h: 12 }),
          text: lab(typed.w),
          at: pct({ l: R.l + R.w / 2, t: R.t + R.h * 0.3 - 10, w: 0, h: 0 }),
        },
        {
          dir: "v",
          box: pct({ l: R.l + R.w * 0.74 - 6, t: R.t, w: 12, h: R.h }),
          text: lab(typed.h),
          at: pct({ l: R.l + R.w * 0.74 + 12, t: R.t + R.h * 0.62, w: 0, h: 0 }),
        },
      ];

  const back = kind === "inside";
  const legend: Drawing["legend"][number][] = [];
  if (res) {
    const shown = res.kind === "standard" ? { w: res.frame.w, h: res.frame.h } : inside;
    const both = res.kind !== "mat" || res.frames.length > 0;
    if (both) {
      legend.push(
        {
          name: out ? "Outside" : `Outside, with a ${writeLength(FACE, unit)} moulding`,
          value: writeIn(outside, unit),
          swatch: "oak",
          on: out,
        },
        {
          name: "Inside: the frame size",
          value: writeIn(shown, unit),
          swatch: back ? "board" : "dash",
          on: back,
        },
      );
    }
    if (kind === "mat" && win && print) {
      legend.push(
        { name: "Mat opening", value: writeIn(win, unit), swatch: "open", on: true },
        { name: "Print, under the mat", value: writeIn(print, unit), swatch: "mat", on: false },
      );
    } else {
      legend.push({
        name: "Front opening",
        value: writeIn({ w: shown.w - 2 * LIP, h: shown.h - 2 * LIP }, unit),
        swatch: "open",
        on: kind === "front",
      });
    }
  }

  let caption =
    kind === "mat"
      ? "Example: an 11x14 frame with a mat for an 8x10 print. The yellow tape shows where to measure."
      : "Example: an 8x10 frame. The yellow tape shows where to measure.";
  if (res?.kind === "mat" && res.frames.length > 1)
    caption = `Drawn as the ${res.frames[0]?.id}. The ${res.frames[1]?.id} has a wider mat at the sides.`;
  else if (res?.kind === "custom" || (res?.kind === "mat" && !res.frames.length))
    caption = "Drawn at the size you measured.";
  else if (res) caption = "The yellow tape marks what you measured.";

  return {
    view: back ? "Back of the frame" : "Front of the frame",
    label: `Drawing of the ${back ? "back" : "front"} of the frame. The yellow tape shows where to measure: ${NAMES[kind]}.`,
    caption,
    outside: pct(bO),
    inside: pct(bS),
    opening: kind === "front" || out || kind === "mat" ? pct(bOp) : undefined,
    window: bW && pct(bW),
    tapes,
    legend,
  };
}
