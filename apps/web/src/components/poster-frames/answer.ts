import {
  type ActualSize,
  inEighths,
  MAT_OVERLAP,
  MAT_WIDTH,
  MEASURE_TOLERANCE,
  oneDecimal,
  POSTER_BORDER,
  posterFrames,
  type PosterFrames,
  POSTERS,
  type Size,
  toCm,
  type Unit,
} from "@framesizes/sizes";

import { article } from "@/components/measure-frame/answer";

import type { Picked } from "./state";

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const withArticle = (text: string) => `${article(text)} ${text}`;
const same = (a: Size, b: Size) => Math.abs(a.w - b.w) < 1e-6 && Math.abs(a.h - b.h) < 1e-6;
/** "27x40", "18x24 or 20x24", "12x18, 16x20 or 18x24". */
const or = (ids: readonly string[]) =>
  ids.length > 1 ? `${ids.slice(0, -1).join(", ")} or ${ids.at(-1)}` : (ids[0] ?? "");

/** A length with no unit: eighths of an inch, or centimetres to one decimal with no trailing ".0". */
const num = (x: number, unit: Unit) => (unit === "cm" ? String(toCm(x)) : inEighths(x));
export const len = (x: number, unit: Unit) => `${num(x, unit)} ${unit}`;
export const size = (s: Size, unit: Unit) => `${num(s.w, unit)} × ${num(s.h, unit)} ${unit}`;
/** An A-series size: inches to one decimal. */
const aSize = (s: Size, unit: Unit) =>
  unit === "cm" ? size(s, "cm") : `${oneDecimal(s.w)} × ${oneDecimal(s.h)} in`;
const sizeOf = (s: Size, isA: boolean, unit: Unit) => (isA ? aSize(s, unit) : size(s, unit));
const mm = (s: Size) => `${Math.round(s.w * 25.4)} × ${Math.round(s.h * 25.4)} mm`;
const pair = (side: number, top: number, unit: Unit) =>
  `${num(side, unit)} / ${num(top, unit)} ${unit}`;
const other = (unit: Unit): Unit => (unit === "in" ? "cm" : "in");

/** The metric or A-series frame the poster is named without a mat. */
function metricOf(frames: PosterFrames): { record: ActualSize; isA: boolean } | undefined {
  if (frames.aFrame) return { record: frames.aFrame, isA: true };
  if (frames.bare.kind === "metric")
    return { record: frames.bare.metric, isA: /^A\d/.test(frames.bare.metric.id) };
  return undefined;
}

/** A frame's name as the box says it: `27x40`, `A2`, `40 × 50 cm`; none for a custom size. */
function bareName(frames: PosterFrames): string | undefined {
  if (frames.bare.kind === "standard") return frames.bare.frame.id;
  return metricOf(frames)?.record.label;
}

export interface Row {
  chip: string;
  /** A custom size: a dashed chip. */
  custom?: boolean;
  badge?: { pre: boolean; text: string };
  border?: string;
  note?: string;
}

export interface Card {
  title: string;
  rows: readonly Row[];
  /** A with-a-mat frame the visitor can draw: its index. */
  pick?: number;
  selected?: boolean;
}

export interface Answer {
  head: string;
  label: string;
  value: string;
  /** The value in the other unit, or in inches under millimetres. */
  sub: string;
  use?: string;
  how: string;
  cards: readonly Card[];
  /** The other mat choice: its text, button and the mat it switches to. */
  box?: { text: string; button: string; mat: boolean };
  /** Links to the frame and mat calculator. */
  calculator?: boolean;
}

const badge = (pre: boolean) => ({
  pre,
  text: pre ? "Pre-cut mat included" : "Mat cut to order",
});

/** "Too small: 1 in narrower and 1 in shorter.", "the same width" for a side that matches. */
const diff = (d: number, unit: Unit, more: string, side: string) =>
  Math.abs(d) < 1e-9 ? `the same ${side}` : `${len(Math.abs(d), unit)} ${more}`;

/**
 * The answer's sentences in one unit, for a poster, the engine's frames for it, the mat choice and
 * the with-a-mat frame drawn.
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-a-poster-without-a-mat-takes-a-frame-of-its-own-size}
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-a-metric-or-a-series-poster-is-named-its-metric-frame}
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-a-custom-size-without-a-mat-offers-the-exact-size-and-the-closest-standard-sizes}
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-each-answer-offers-the-other-mat-choice}
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-with-a-mat-the-answer-lists-the-standard-frames-that-hold-the-poster}
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-a-poster-with-no-standard-frame-for-a-mat-gets-the-frame-for-a-2-inch-mat}
 */
export function describe(
  p: Picked,
  frames: PosterFrames,
  mat: boolean,
  pick: number,
  unit: Unit,
): Answer {
  const tol = len(MEASURE_TOLERANCE, unit);
  const psz = sizeOf(p.size, p.isA, unit);
  const forP = p.name ? `${withArticle(p.name)} poster` : "your poster";
  const base = p.use ? { use: p.use } : {};
  const { bare, matted } = frames;
  const ids = matted.map((m) => m.frame.id);

  if (!mat) {
    if (bare.kind === "standard" && !frames.aFrame) {
      const f = bare.frame;
      return {
        ...base,
        head: `Use ${withArticle(f.id)} frame.`,
        label: "Frame size",
        value: size(f, unit),
        sub: size(f, other(unit)),
        how: `Without a mat, the frame is the poster's own size${same(p.size, f) ? `. ${f.id} is a standard US frame size.` : `: ${psz}, within ${tol} of the standard ${f.id}.`}`,
        cards: [
          {
            title: "Ready-made frame",
            rows: [{ chip: `${f.id} frame`, note: "No mat. The poster fills the frame." }],
          },
        ],
        box: {
          text: ids.length
            ? `With a mat it takes a bigger frame: ${or(ids)}.`
            : "No standard frame takes it with a mat.",
          button: "See frames with a mat",
          mat: true,
        },
      };
    }
    const metric = metricOf(frames);
    if (metric) {
      const { record: m, isA } = metric;
      const near = bare.kind === "custom" && bare.below && bare.above ? bare : undefined;
      const close = bare.kind === "metric" ? bare.close : undefined;
      const how = isA
        ? `${m.label} frames are sold under the paper's name. No US frame size is within ${tol} of it${near?.below && near.above ? `: ${near.below.id} is smaller, ${near.above.id} is bigger.` : "."}`
        : `A metric frame size. ${close ? `${cap(withArticle(close.id))} frame is within ${tol} of it too.` : `No US frame size is within ${tol} of it.`}`;
      const cards: Card[] = [
        {
          title: "Metric frame",
          rows: [{ chip: `${m.label} frame`, note: isA ? mm(m) : size(m, unit) }],
        },
      ];
      if (matted.length)
        cards.push({
          title: "US frames, with a mat",
          rows: matted.map((x) => ({
            chip: `${x.frame.id} frame`,
            badge: badge(x.preCut),
            border: `Border ${pair(x.side, x.top, unit)}`,
          })),
        });
      return {
        ...base,
        head: `Use ${withArticle(m.label)} frame${isA ? ` (${mm(m)})` : ""}.`,
        label: "Frame size",
        value: isA ? mm(m) : size(m, unit),
        sub: isA ? aSize(m, unit) : size(m, other(unit)),
        how,
        cards,
      };
    }
    const near = bare.kind === "custom" ? bare : undefined;
    const closest: Row[] = [];
    if (near?.below)
      closest.push({
        chip: `${near.below.id} frame`,
        note: `Too small: ${diff(p.size.w - near.below.w, unit, "narrower", "width")} and ${diff(p.size.h - near.below.h, unit, "shorter", "height")}.`,
      });
    if (near?.above)
      closest.push({
        chip: `${near.above.id} frame`,
        note: `${cap(diff(near.above.w - p.size.w, unit, "wider", "width"))} and ${diff(near.above.h - p.size.h, unit, "taller", "height")} than the poster.`,
      });
    const cards: Card[] = [
      {
        title: "Order this size",
        rows: [{ chip: psz, custom: true, note: "A custom frame, made to this size." }],
      },
    ];
    if (closest.length) cards.push({ title: "Closest standard sizes", rows: closest });
    return {
      ...base,
      head: `Not a standard size: ${psz}.`,
      label: "Frame size, custom",
      value: psz,
      sub: sizeOf(p.size, p.isA, other(unit)),
      how: `Without a mat, the frame is the poster's own size. No standard frame is within ${tol} of it.`,
      cards,
      ...(ids.length
        ? {
            box: {
              text: `With a mat it fits a standard frame: ${or(ids)}.`,
              button: "See frames with a mat",
              mat: true,
            },
          }
        : {}),
    };
  }

  if (matted.length) {
    const n = matted.length;
    const sel = Math.min(Math.max(pick, 0), n - 1);
    const drawn = matted[sel];
    if (!drawn) throw new Error("no frame to draw");
    return {
      ...base,
      head:
        n === 1
          ? `${cap(withArticle(drawn.frame.id))} frame fits ${forP} with a mat.`
          : `${n} standard frames fit ${forP} with a mat.`,
      label: n === 1 ? "Frame size" : "Frame in the drawing",
      value: size(drawn.frame, unit),
      sub: size(drawn.frame, other(unit)),
      how: `Borders are sides / top and bottom. The mat overlaps the poster by ${len(MAT_OVERLAP, unit)} on each side.${n > 1 ? " Tap a frame to draw it." : ""}`,
      cards: matted.map((x, i) => ({
        title: n > 1 ? `Frame ${i + 1} of ${n}` : "Frame",
        rows: [
          {
            chip: `${x.frame.id} frame`,
            badge: badge(x.preCut),
            border: `Border ${pair(x.side, x.top, unit)}`,
            note: x.preCut ? `Sold with a mat cut for ${forP}.` : `Have the mat cut for ${forP}.`,
          },
        ],
        ...(n > 1 ? { pick: i, selected: i === sel } : {}),
      })),
    };
  }

  const cf = frames.customFrame;
  if (!cf) throw new Error("no frame for a mat");
  const name = bareName(frames);
  return {
    ...base,
    head: `No standard frame fits ${forP} with a mat.`,
    label: "Custom frame",
    value: size(cf, unit),
    sub: size(cf, other(unit)),
    how: `No standard frame leaves a ${len(POSTER_BORDER.min, unit)} to ${len(POSTER_BORDER.max, unit)} border on every side. For a ${len(MAT_WIDTH, unit)} mat, order a custom frame.`,
    cards: [
      {
        title: "Custom frame",
        rows: [
          {
            chip: size(cf, unit),
            custom: true,
            border: `Border ${pair(MAT_WIDTH, MAT_WIDTH, unit)}`,
            note: "Made to order, with the mat cut to fit.",
          },
        ],
      },
    ],
    calculator: true,
    ...(name
      ? {
          box: {
            text: `Without a mat it takes ${withArticle(name)} frame.`,
            button: "See it without a mat",
            mat: false,
          },
        }
      : {}),
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
  /** The moulding, the frame size and the poster; with a mat, the opening too. */
  boxes: { oak: Box; frame: Box; poster: Box; opening?: Box };
  /** A custom frame: the moulding is dashed. */
  dashed: boolean;
  /** With a mat: where the side and top borders are written, and what. */
  borders?: {
    sideAt: { l: number; t: number };
    topAt: { l: number; t: number };
    side: Both;
    top: Both;
  };
  label: string;
  legend: readonly { name: string; value: Both; swatch: string }[];
  caption: string;
}

/** The stage's shape in px (`.mt-stage`'s aspect ratio), its padding and the drawn moulding. */
const W = 440;
const H = 320;
const PAD = 16;
const FACE = 1.5;

/**
 * The longest side of the largest frame the page names, with its moulding: every picker poster's
 * frames, with and without a mat. One scale fits it in the stage.
 */
const LONGEST = Math.max(
  ...POSTERS.flatMap((p) => {
    const f = posterFrames(p);
    if (!f) throw new Error(`${p.id} has no frames`);
    const sizes: Size[] = [f.bare.size, ...f.matted.map((m) => m.frame)];
    if (f.bare.kind === "standard") sizes.push(f.bare.frame);
    if (f.aFrame) sizes.push(f.aFrame);
    if (f.customFrame) sizes.push(f.customFrame);
    return sizes.map((s) => Math.max(s.w, s.h) + 2 * FACE);
  }),
);
const SCALE = Math.min(W - 2 * PAD, H - 2 * PAD) / LONGEST;

const both = (write: (unit: Unit) => string): Both => ({ in: write("in"), cm: write("cm") });
const inBoth = (s: Size, isA = false) => `${sizeOf(s, isA, "in")} (${sizeOf(s, isA, "cm")})`;
const lenBoth = (x: number) => `${len(x, "in")} (${len(x, "cm")})`;

/**
 * The drawing for an answer: the frame drawn, the poster and, with a mat, the mat's opening and
 * borders, at one scale for every size unless the frame is too big for it.
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-answer-is-announced-and-drawn-to-one-scale}
 */
export function drawing(p: Picked, frames: PosterFrames, mat: boolean, pick: number): Drawing {
  const metric = metricOf(frames);
  let frame: Size;
  let frameIsA = false;
  let dashed = false;
  let border: { side: number; top: number } | undefined;
  if (!mat) {
    if (frames.bare.kind === "standard" && !frames.aFrame) frame = frames.bare.frame;
    else if (metric) {
      frame = metric.record;
      frameIsA = metric.isA;
    } else {
      frame = p.size;
      frameIsA = p.isA;
      dashed = true;
    }
  } else if (frames.matted.length) {
    const m = frames.matted[Math.min(Math.max(pick, 0), frames.matted.length - 1)];
    if (!m) throw new Error("no frame to draw");
    frame = m.frame;
    border = { side: m.side, top: m.top };
  } else {
    if (!frames.customFrame) throw new Error("no frame for a mat");
    frame = frames.customFrame;
    dashed = true;
    border = { side: MAT_WIDTH, top: MAT_WIDTH };
  }

  const outer = { w: frame.w + 2 * FACE, h: frame.h + 2 * FACE };
  const fits = outer.w * SCALE <= W - 2 * PAD + 1e-9 && outer.h * SCALE <= H - 2 * PAD + 1e-9;
  const k = fits ? SCALE : Math.min((W - 2 * PAD) / outer.w, (H - 2 * PAD) / outer.h);
  const box = (s: Size): Box => ({
    l: ((W - s.w * k) / 2 / W) * 100,
    t: ((H - s.h * k) / 2 / H) * 100,
    w: ((s.w * k) / W) * 100,
    h: ((s.h * k) / H) * 100,
  });
  const caption = fits
    ? "Drawn to scale. Every size on this page uses the same scale."
    : "Drawn smaller than the other sizes, to fit.";
  const kind = dashed ? "custom frame" : "frame";
  const frameName = dashed ? "Frame, custom" : "Frame";
  const frameRow = {
    name: frameName,
    value: both((u) => sizeOf(frame, frameIsA, u)),
    swatch: dashed ? "dash" : "oak",
  };
  const fBoth = inBoth(frame, frameIsA);
  const pBoth = inBoth(p.size, p.isA);

  if (!border) {
    return {
      boxes: { oak: box(outer), frame: box(frame), poster: box(p.size) },
      dashed,
      label: `Drawn to scale: ${withArticle(pBoth)} poster in ${withArticle(fBoth)} ${kind}, no mat.`,
      legend: [
        frameRow,
        { name: "Poster", value: both((u) => sizeOf(p.size, p.isA, u)), swatch: "tape" },
      ],
      caption,
    };
  }

  const { side, top } = border;
  const opening = { w: frame.w - 2 * side, h: frame.h - 2 * top };
  return {
    boxes: { oak: box(outer), frame: box(frame), poster: box(p.size), opening: box(opening) },
    dashed,
    borders: {
      sideAt: { l: ((W / 2 - ((opening.w + side) * k) / 2) / W) * 100, t: 50 },
      topAt: { l: 50, t: ((H / 2 - ((opening.h + top) * k) / 2) / H) * 100 },
      side: both((u) => len(side, u)),
      top: both((u) => len(top, u)),
    },
    label: `Drawn to scale: ${withArticle(fBoth)} ${kind} with a mat around ${withArticle(pBoth)} poster. The border is ${lenBoth(side)} at the sides and ${lenBoth(top)} at the top and bottom.`,
    legend: [
      frameRow,
      { name: "Poster, seen in the mat", value: both((u) => size(opening, u)), swatch: "tape" },
      { name: "Border, sides / top", value: both((u) => pair(side, top, u)), swatch: "mat" },
    ],
    caption,
  };
}
