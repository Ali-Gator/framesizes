import {
  type Frame,
  findFrame,
  inEighths,
  MAT_OVERLAP,
  matBorders,
  type MatAnswer,
  MEASURE_TOLERANCE,
  type Size,
  toCm,
  type Unit,
  writeSize,
} from "@framesizes/sizes";

import { article, writeIn } from "@/components/measure-frame/answer";
import { writeLength } from "@/components/measure-frame/state";

import type { From } from "./state";

const id = (size: Size) => writeSize(size, "search");
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const withArticle = (text: string) => `${article(text)} ${text}`;
const same = (a: Size, b: Size) => Math.abs(a.w - b.w) < 1e-6 && Math.abs(a.h - b.h) < 1e-6;

/** One frame or print in a card: its chip, the border it gives, a note under it. */
export interface Row {
  chip: string;
  /** A custom size, drawn with a dashed chip. */
  custom?: boolean;
  border?: string;
  note?: string;
}

export interface Card {
  title: string;
  rows: readonly Row[];
  text?: string;
}

export interface Answer {
  head: string;
  /** "Frame size" or "Largest print". */
  label: string;
  value: string;
  opening: string;
  how: string;
  cards: readonly Card[];
}

/** "Mat border 2 in all round.", or the sides and the top and bottom when they differ. */
function borderText(b: { side: number; top: number }, unit: Unit): string {
  const side = writeLength(b.side, unit);
  const top = writeLength(b.top, unit);
  return side === top
    ? `Mat border ${side} all round.`
    : `Mat border ${side} at the sides, ${top} at the top and bottom.`;
}

/**
 * The answer's sentences in one unit, from the engine's answer and the mat border in inches.
 * {@link openspec/specs/frame-mat-calculator/spec.md#requirement-a-standard-frame-answer-says-how-it-was-found}
 * {@link openspec/specs/frame-mat-calculator/spec.md#requirement-a-metric-frame-answer-names-the-metric-frame}
 * {@link openspec/specs/frame-mat-calculator/spec.md#requirement-a-custom-frame-answer-offers-the-exact-size-and-ready-made-frames}
 * {@link openspec/specs/frame-mat-calculator/spec.md#requirement-a-reverse-answer-gives-the-largest-print-and-the-frames-own-mat}
 */
export function describe(
  { answer, width }: { answer: MatAnswer; width: number },
  from: From,
  unit: Unit,
): Answer {
  const sz = (s: Size) => writeIn(s, unit);
  const ln = (x: number) => writeLength(x, unit);
  const bd = (frame: Size, print: Size) => borderText(matBorders(frame, print), unit);
  const { print, opening, frame, printMatch, frameMatch, preCut } = answer;
  const tol = ln(MEASURE_TOLERANCE);

  if (from === "frame") {
    const own = frameMatch.kind === "standard" ? frameMatch.frame : undefined;
    const ownMat = own?.mat ? id(own.mat) : undefined;
    const soldWith: Card =
      own && own.mat && ownMat
        ? {
            title: "Sold with this frame",
            rows: [{ chip: `${ownMat} print`, border: bd(frame, own.mat) }],
            text: `${cap(withArticle(own.id))} frame comes with a mat pre-cut for ${withArticle(ownMat)} print.`,
          }
        : own
          ? {
              title: "Sold with this frame",
              rows: [],
              text: `${own.id} frames are usually sold without a mat.`,
            }
          : {
              title: "Sold with this frame",
              rows: [],
              text: "No frame this size is sold with a pre-cut mat.",
            };
    const base = {
      label: "Largest print",
      value: sz(print),
      opening: sz(opening),
      how: `The opening is your frame less the ${ln(width)} border on each side. The print is ${ln(MAT_OVERLAP)} bigger on each side, under the mat.`,
    };
    if (printMatch.kind === "standard") {
      const p = printMatch.frame;
      const own = ownMat === p.id;
      return {
        ...base,
        head: `${cap(withArticle(p.id))} print fits.`,
        cards: [
          {
            title: "Standard print that fits",
            rows: [{ chip: `${p.id} print`, border: bd(frame, p) }],
            text:
              own && frameMatch.kind === "standard"
                ? `${cap(withArticle(frameMatch.frame.id))} frame is sold with this mat pre-cut.`
                : undefined,
          },
          ...(own ? [] : [soldWith]),
        ],
      };
    }
    if (printMatch.kind === "metric") {
      const m = printMatch.metric;
      return {
        ...base,
        head: `${cap(withArticle(m.label))} print fits, a metric size.`,
        cards: [
          { title: "Metric print", rows: [{ chip: `${m.label} print`, border: bd(frame, m) }] },
          soldWith,
        ],
      };
    }
    const near = printMatch.kind === "custom" ? printMatch : undefined;
    const below = near?.below;
    const above = near?.above;
    return {
      ...base,
      head: `Largest print: ${sz(print)}. Not a standard print size.`,
      cards: [
        below
          ? {
              title: "Standard print that fits",
              rows: [{ chip: `${below.id} print`, border: bd(frame, below) }],
              text: above
                ? `The next print up, ${above.id}, is too big for a ${ln(width)} border.`
                : undefined,
            }
          : {
              title: "Standard print that fits",
              rows: [],
              text: "No standard print is this small.",
            },
        soldWith,
      ],
    };
  }

  const forPrint =
    printMatch.kind === "standard" ? `${withArticle(printMatch.frame.id)} print` : "your print";
  const preRows = (nextUp?: Frame): Row[] =>
    preCut.map((f) => ({
      chip: `${f.id} frame`,
      border: bd(f, print),
      note: nextUp && f.id === nextUp.id ? "Also the next size up." : undefined,
    }));
  const preText =
    preCut.length === 0
      ? `No frame is sold with a pre-cut mat for ${forPrint}. Have one cut to size.`
      : `${preCut.length === 1 ? "Sold" : preCut.length === 2 ? "Both are sold" : "All are sold"} with a mat cut for ${forPrint}.`;
  const how = `The opening is your print less ${ln(MAT_OVERLAP)} on each side. The frame adds the ${ln(width)} border on each side: ${sz(frame)}.`;
  const base = { label: "Frame size", opening: sz(opening) };

  if (frameMatch.kind === "standard") {
    const f = frameMatch.frame;
    const sold = preCut.some((x) => x.id === f.id);
    const others = preCut.filter((x) => x.id !== f.id);
    const cards: Card[] = [
      {
        title: "Ready-made frame",
        rows: [{ chip: `${f.id} frame`, border: bd(f, print) }],
        text: sold
          ? `Sold with this mat pre-cut, for ${forPrint}.`
          : "Have the mat cut to this border.",
      },
    ];
    if (others.length)
      cards.push({
        title: "Also sold with a pre-cut mat",
        rows: others.map((x) => ({ chip: `${x.id} frame`, border: bd(x, print) })),
      });
    else if (!sold)
      cards.push({ title: "Ready-made, with a pre-cut mat", rows: [], text: preText });
    return {
      ...base,
      head: `Use ${withArticle(f.id)} frame.`,
      value: sz(f),
      how: `${how} ${same(frame, f) ? `That is the standard ${f.id}.` : `That is within ${tol} of ${f.id}.`}`,
      cards,
    };
  }

  if (frameMatch.kind === "metric") {
    const m = frameMatch.metric;
    return {
      ...base,
      head: `Use ${withArticle(m.label)} frame, a metric size.`,
      value: sz(m),
      how: `${how} ${frameMatch.close ? `${frameMatch.close.id} is close too, but ${m.label} is closer.` : `No US size is within ${tol} of it; ${m.label} is.`}`,
      cards: [
        {
          title: "Metric frame",
          rows: [{ chip: `${m.label} frame`, border: bd(m, print) }],
          text: `${m.label} frames are sold in the US too. Have the mat cut for ${forPrint}.`,
        },
        { title: "Ready-made, with a pre-cut mat", rows: preRows(), text: preText },
      ],
    };
  }

  const near = frameMatch.kind === "custom" ? frameMatch : undefined;
  const above = near?.above;
  const cards: Card[] = [
    {
      title: "Order this size",
      rows: [{ chip: sz(frame), custom: true, border: bd(frame, print) }],
      text: "A custom frame with the mat cut to fit. Frame shops and online framers cut any size.",
    },
    { title: "Ready-made, with a pre-cut mat", rows: preRows(above), text: preText },
  ];
  if (above && !preCut.some((x) => x.id === above.id))
    cards.push({
      title: "Next size up",
      rows: [{ chip: `${above.id} frame`, border: bd(above, print) }],
      text: `With a mat cut for ${forPrint}.`,
    });
  if (near?.squareAbove)
    cards.push({
      title: "Square frames",
      rows: [{ chip: `${near.squareAbove.id} frame`, border: bd(near.squareAbove, print) }],
      text: near.squareBelow ? `${near.squareBelow.id} is too small for this mat.` : undefined,
    });
  return {
    ...base,
    head: `Your frame: ${sz(frame)}. Not a standard size.`,
    value: sz(frame),
    how: `${how} No standard frame is within ${tol} of it.`,
    cards,
  };
}

/** A box on the drawing's stage, in percent of its width and height. */
export interface Box {
  l: number;
  t: number;
  w: number;
  h: number;
}

/** A text in both units, for server-rendered copy. */
export interface Both {
  in: string;
  cm: string;
}

export interface Drawing {
  frame: Size;
  opening: Size;
  print: Size;
  /** The moulding, the mat (less the lip), the opening and the print's edge. */
  boxes: { oak: Box; mat: Box; opening: Box; print: Box };
  /** Where the side and top borders are written on the mat. */
  sideAt: { l: number; t: number };
  topAt: { l: number; t: number };
  side: Both;
  top: Both;
  label: string;
  legend: readonly { name: string; value: Both; swatch: string }[];
  caption: string;
}

const both = (write: (unit: Unit) => string): Both => ({ in: write("in"), cm: write("cm") });
const number = (inches: number, unit: Unit) =>
  unit === "cm" ? toCm(inches).toFixed(1) : inEighths(inches);

/** The stage's shape in px, for the layout maths. */
const W = 440;
const H = 320;
const PAD = 20;

/** The example before an answer: the catalog's 11x14 with its pre-cut 8x10 mat. */
function example() {
  const frame = findFrame("11x14");
  if (!frame?.mat) throw new Error("the catalog has no 11x14 with a mat");
  const print = frame.mat;
  return {
    frame: { w: frame.w, h: frame.h },
    print,
    opening: { w: print.w - 2 * MAT_OVERLAP, h: print.h - 2 * MAT_OVERLAP },
    caption: `Example: ${withArticle(id(print))} print in ${withArticle(frame.id)} frame with a pre-cut mat.`,
  };
}

/**
 * The drawing: frame, mat, opening and the print's edge under the mat, its label in the visitor's
 * unit and its legend in both. Before an answer, the example 8x10 in an 11x14.
 * {@link openspec/specs/frame-mat-calculator/spec.md#requirement-the-answer-is-announced-and-drawn}
 */
export function drawing(
  result: { answer: MatAnswer; width: number } | undefined,
  from: From,
  unit: Unit,
): Drawing {
  let shown = example();
  if (result) {
    const { answer } = result;
    const m = answer.frameMatch;
    const frame =
      from === "print" && m.kind === "standard"
        ? m.frame
        : from === "print" && m.kind === "metric"
          ? m.metric
          : answer.frame;
    const caption =
      from === "frame"
        ? "Your frame, with the largest print under the mat."
        : m.kind === "standard"
          ? `Drawn as ${withArticle(m.frame.id)} frame, mat cut to fit.`
          : m.kind === "metric"
            ? `Drawn as ${withArticle(m.metric.label)} frame, mat cut to fit.`
            : "Drawn at the exact frame size.";
    shown = {
      frame: { w: frame.w, h: frame.h },
      print: answer.print,
      opening: answer.opening,
      caption,
    };
  }
  const { frame, print, opening, caption } = shown;
  const b = matBorders(frame, print);
  const even = inEighths(b.side) === inEighths(b.top);

  const face = Math.max(0.9, Math.min(frame.w, frame.h) * 0.07);
  const outer = { w: frame.w + 2 * face, h: frame.h + 2 * face };
  const k = Math.min((W - 2 * PAD) / outer.w, (H - 2 * PAD) / outer.h);
  const box = (s: Size): Box => ({
    l: ((W - s.w * k) / 2 / W) * 100,
    t: ((H - s.h * k) / 2 / H) * 100,
    w: ((s.w * k) / W) * 100,
    h: ((s.h * k) / H) * 100,
  });
  const lip = 2 * MAT_OVERLAP;
  const sideAt = { l: ((W / 2 - ((opening.w + b.side) * k) / 2) / W) * 100, t: 50 };
  const topAt = { l: 50, t: ((H / 2 - ((opening.h + b.top) * k) / 2) / H) * 100 };

  const w = number(frame.w, unit);
  const ln = (x: number) => writeLength(x, unit);
  const border = even
    ? `a ${ln(b.side)} mat border at the sides and at the top and bottom`
    : `a ${ln(b.side)} mat border at the sides and ${ln(b.top)} at the top and bottom`;
  const label = `Drawing of ${withArticle(w)} by ${number(frame.h, unit)} ${unit} frame with ${border}, and ${withArticle(number(opening.w, unit))} by ${number(opening.h, unit)} ${unit} opening. The print's edge is under the mat.`;

  return {
    frame,
    opening,
    print,
    boxes: {
      oak: box(outer),
      mat: box({ w: frame.w - lip, h: frame.h - lip }),
      opening: box(opening),
      print: box(print),
    },
    sideAt,
    topAt,
    side: both((u) => writeLength(b.side, u)),
    top: both((u) => writeLength(b.top, u)),
    label,
    legend: [
      { name: "Frame size", value: both((u) => writeIn(frame, u)), swatch: "oak" },
      { name: "Mat opening", value: both((u) => writeIn(opening, u)), swatch: "tape" },
      { name: "Print, edge under the mat", value: both((u) => writeIn(print, u)), swatch: "dash" },
      {
        name: even ? "Mat border" : "Mat border, sides / top",
        value: both((u) =>
          even ? writeLength(b.side, u) : `${number(b.side, u)} / ${number(b.top, u)} ${u}`,
        ),
        swatch: "mat",
      },
    ],
    caption,
  };
}
