import {
  CATALOG,
  commonFrames,
  findFrame,
  MAT_OVERLAP,
  MAT_WIDTH,
  type MattedFrame,
  oneDecimal,
  POSTER_BORDER,
  type Poster,
  posterFrames,
  type PosterFrames,
  POSTERS,
  type Size,
  toCm,
} from "@framesizes/sizes";
import type { ReactNode } from "react";

import { RelatedTools } from "@/components/frame-chart/related-tools";
import { article } from "@/components/measure-frame/answer";
import { len, pair as pairOf, size } from "@/components/poster-frames/answer";
import { PosterFrames as Widget } from "@/components/poster-frames/poster-frames";
import { IfLive, PageLink } from "@/components/site/page-link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FAQ } from "@/components/ui/faq";
import { SizeTable } from "@/components/ui/size-table";
import { U } from "@/components/ui/u";
import { breadcrumbJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";
import { livePage } from "@/lib/site-map";

import "../frame-mat-calculator/frame-mat.css";
import "./poster-frames.css";

const F6 = livePage("F6");

export const metadata = pageMetadata(F6);

const withArticle = (text: string) => `${article(text)} ${text}`;
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
/** "27x40", "18x24 or 20x24", "12x18, 16x20 or 18x24". */
const or = (ids: readonly string[]) =>
  ids.length > 1 ? `${ids.slice(0, -1).join(", ")} or ${ids.at(-1)}` : (ids[0] ?? "");
const and = (ids: readonly string[]) =>
  ids.length > 1 ? `${ids.slice(0, -1).join(", ")} and ${ids.at(-1)}` : (ids[0] ?? "");
const mm = (s: Size) => `${Math.round(s.w * 25.4)} × ${Math.round(s.h * 25.4)} mm`;
const aIn = (s: Size) => `${oneDecimal(s.w)} × ${oneDecimal(s.h)} in`;

/** A size in both units. */
const S = ({ size: s }: { size: Size }) => (
  <span className="font-mono">
    <U in={size(s, "in")} cm={size(s, "cm")} />
  </span>
);
/** A length in both units. */
const L = ({ inches }: { inches: number }) => <U in={len(inches, "in")} cm={len(inches, "cm")} />;
const pair = (m: { side: number; top: number }, unit: "in" | "cm") => pairOf(m.side, m.top, unit);

// Every number below comes from the engine: the answer, the table, the cards and the questions.
const ROWS = POSTERS.map((p) => {
  const frames = posterFrames(p);
  if (!frames) throw new Error(`${p.id} has no frames`);
  return { p, frames };
});
function row(id: string): { p: Poster; frames: PosterFrames } {
  const found = ROWS.find((r) => r.p.id === id);
  if (!found) throw new Error(`no poster ${id}`);
  return found;
}
const ids = (frames: PosterFrames) => frames.matted.map((m) => m.frame.id);
function only(frames: PosterFrames): MattedFrame {
  const [m] = frames.matted;
  if (!m || frames.matted.length !== 1) throw new Error("expected one frame for a mat");
  return m;
}
function customFrame(frames: PosterFrames): Size {
  if (frames.matted.length || !frames.customFrame) throw new Error("expected no frame for a mat");
  return frames.customFrame;
}

const P11 = row("11x17");
const P18 = row("18x24");
const P24 = row("24x36");
const P27 = row("27x40");
const A2 = row("A2");
const SMALL = ["11x17", "12x18", "16x20"].map(row);
const LARGE = ["18x24", "20x30", "24x36", "27x40"].map(row);
const A_SERIES = ROWS.filter((r) => r.p.group === "a-series");
const US = ROWS.filter((r) => r.p.group === "us").map((r) => r.p.id);
// The large group's sentence holds only while each takes one frame with a mat and 27x40 none.
for (const r of LARGE.slice(0, -1)) only(r.frames);
customFrame(P27.frames);

/** "The border is 1¼ in at the sides and 3¼ in at the top and bottom." */
const BorderSentence = ({ m }: { m: { side: number; top: number } }) => (
  <>
    The border is <L inches={m.side} /> at the sides and <L inches={m.top} /> at the top and bottom.
  </>
);

/** A size group card's sentence about the frames with a mat, from the engine. */
function WithMat({ p, frames }: { p: Poster; frames: PosterFrames }) {
  const list = frames.matted;
  if (!list.length)
    return (
      <>
        No standard frame takes it with a mat. A <L inches={MAT_WIDTH} /> mat needs a custom frame,{" "}
        <S size={customFrame(frames)} />.
      </>
    );
  if (list.length === 1) {
    const m = only(frames);
    return (
      <>
        With a mat: {m.frame.id}
        {m.preCut ? `, sold with a pre-cut mat for ${p.id}` : ""}. <BorderSentence m={m} />
      </>
    );
  }
  const pre = list.filter((m) => m.preCut);
  if (pre.length === list.length)
    return (
      <>
        With a mat: {or(ids(frames))}. {list.length === 2 ? "Both are" : "All are"} sold with a
        pre-cut mat for {p.id}.
      </>
    );
  if (!pre.length)
    return (
      <>
        With a mat: {or(ids(frames))}. No frame is sold with a pre-cut mat for {p.id}.
      </>
    );
  return (
    <>
      With a mat:{" "}
      {list.map((m, i) => (
        <span key={m.frame.id}>
          {i === 0 ? "" : i === list.length - 1 ? " or " : ", "}
          {m.frame.id}
          {m.preCut ? (
            <>
              {" "}
              (sold with a pre-cut mat,{" "}
              {m.side === m.top ? (
                <L inches={m.side} />
              ) : (
                <U in={pair(m, "in")} cm={pair(m, "cm")} />
              )}{" "}
              border)
            </>
          ) : null}
        </span>
      ))}
      .
    </>
  );
}

/** An A-series card's sentence: the US sizes either side when none matches, then the mat. */
function ASeriesMat({ p, frames }: { p: Poster; frames: PosterFrames }) {
  const near = frames.bare.kind === "custom" ? frames.bare : undefined;
  return (
    <>
      {near?.below && near.above
        ? `No US frame size matches ${p.id}: ${near.below.id} is smaller, ${near.above.id} is bigger. `
        : ""}
      With a mat: {or(ids(frames))}.
    </>
  );
}

function Case({ p, frames, children }: { p: Poster; frames: PosterFrames; children?: ReactNode }) {
  return (
    <article className="f5-case">
      <h3 className="f5-case-t">{p.id} poster</h3>
      {children}
      <span className="f5-case-v font-mono">{p.id} frame</span>
      <p>
        {p.group === "a-series" ? (
          <ASeriesMat p={p} frames={frames} />
        ) : (
          <WithMat p={p} frames={frames} />
        )}
      </p>
      <p className="f5-case-m">{p.use}</p>
    </article>
  );
}

/** The chart table's cells. */
function PosterCell({ p }: { p: Poster }) {
  if (p.group === "a-series")
    return (
      <>
        <span className="pt-l">
          {p.id} ({mm(p)})
        </span>
        <span className="pt-l pt-use">
          <U in={aIn(p)} cm={size(p, "cm")} />
        </span>
        <span className="pt-use">{p.use}</span>
      </>
    );
  return (
    <>
      <span className="pt-l">
        <U in={size(p, "in")} cm={size(p, "cm")} />
      </span>
      <span className="pt-use">{p.use}</span>
    </>
  );
}
function BareCell({ frames }: { frames: PosterFrames }) {
  const { bare, aFrame } = frames;
  if (aFrame)
    return (
      <>
        <span className="pt-l">
          {aFrame.id} frame ({mm(aFrame)})
        </span>
        <span className="pt-use">No US size</span>
      </>
    );
  if (bare.kind === "metric")
    return (
      <span className="pt-l">
        {bare.metric.label} frame ({mm(bare.metric)})
      </span>
    );
  if (bare.kind !== "standard") throw new Error("a picker poster has a frame of its own size");
  return (
    <span className="pt-l">
      <U in={size(bare.frame, "in")} cm={size(bare.frame, "cm")} />
    </span>
  );
}
function MatCell({ frames }: { frames: PosterFrames }) {
  if (!frames.matted.length) {
    const cf = customFrame(frames);
    return (
      <>
        <span className="pt-none">No standard frame</span>
        <span className="pt-l">
          <U
            in={`Custom ${size(cf, "in")} for a ${len(MAT_WIDTH, "in")} mat`}
            cm={`Custom ${size(cf, "cm")} for a ${len(MAT_WIDTH, "cm")} mat`}
          />
        </span>
      </>
    );
  }
  const cell = (m: MattedFrame, unit: "in" | "cm") =>
    `${size(m.frame, unit)}${m.preCut ? ", pre-cut" : ""} · ${pair(m, unit)}`;
  return (
    <>
      {frames.matted.map((m) => (
        <span key={m.frame.id} className="pt-l">
          <U in={cell(m, "in")} cm={cell(m, "cm")} />
        </span>
      ))}
    </>
  );
}

const PAINTINGS = ["11x14", "16x20", "18x24", "24x36"].map((id) => {
  const f = findFrame(id);
  if (!f) throw new Error(`no frame ${id}`);
  return f;
});
const RECTANGLES = CATALOG.filter((f) => f.orientation !== "square");
const FIRST = RECTANGLES[0];
const LAST = RECTANGLES.at(-1);
if (!FIRST || !LAST) throw new Error("the catalog has no rectangles");
const SMALLER = commonFrames()
  .map((f) => f.id)
  .filter((id) => !US.includes(id));
const NOT_BIG = P11.frames.matted[1];
if (!NOT_BIG) throw new Error("expected a second frame for an 11x17 with a mat");
const A2_MAT = only(A2.frames);
const A2_FRAME = A2.frames.aFrame;
if (!A2_FRAME) throw new Error("A2 is named its A-series frame");
function ownFrame({ frames }: { frames: PosterFrames }): string {
  if (frames.bare.kind !== "standard") throw new Error("expected a standard frame");
  return frames.bare.frame.id;
}
const P18_FRAME = ownFrame(P18);

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="h2">{title}</h2>
      {children}
    </section>
  );
}

const STEPS = [
  {
    t: "Measure the poster",
    p: (
      <>
        Width first, edge to edge. Most posters come in a standard size.
        <IfLive page="P1">
          {" "}
          The <PageLink id="P1">poster sizes</PageLink> page lists them.
        </IfLive>
      </>
    ),
  },
  {
    t: "Decide on a mat",
    p: (
      <>
        Without a mat, the frame is the poster&apos;s size. A mat adds a border, usually{" "}
        <U
          in={`${POSTER_BORDER.min} to ${len(POSTER_BORDER.max, "in")}`}
          cm={`${toCm(POSTER_BORDER.min)} to ${len(POSTER_BORDER.max, "cm")}`}
        />
        , and needs a bigger frame. Some pre-cut mats are narrower.
      </>
    ),
  },
  {
    t: "Pick the frame",
    p: "Find your poster in the chart. A frame sold with a pre-cut mat is ready to use. For any other frame, have the mat cut to size.",
  },
] as const;

/** {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-questions-answer-in-the-server-html} */
const QUESTIONS = [
  {
    q: "What are typical poster frame sizes?",
    a: (
      <p>
        In the US: {and(US)}. Without a mat, each poster takes a frame of the same size. A-series
        posters ({A_SERIES.map((r) => r.p.id).join(", ")}) take A-series frames.
      </p>
    ),
  },
  {
    q: "What are the standard print frame sizes?",
    a: (
      <p>
        Prints use the same frames as posters, plus smaller ones: {and(SMALLER)}. The{" "}
        <PageLink id="F1">frame size chart</PageLink> lists every standard size, from {FIRST.id} to{" "}
        {LAST.id}.
      </p>
    ),
  },
  {
    q: "Does a poster need a mat?",
    a: (
      <p>
        No. Without a mat, a poster takes a frame of its own size: {withArticle(P18.p.id)} poster
        takes {withArticle(P18_FRAME)} frame. A mat needs a bigger frame: {withArticle(P11.p.id)}{" "}
        poster takes {withArticle(NOT_BIG.frame.id)} frame, with a <L inches={NOT_BIG.side} />{" "}
        border at the sides.
      </p>
    ),
  },
  {
    q: "What size frame for an A2 poster?",
    a: (
      <p>
        An A2 frame, {mm(A2_FRAME)}. No US frame matches A2. With a mat it fits{" "}
        {withArticle(A2_MAT.frame.id)} frame, with <L inches={A2_MAT.side} /> at the sides and{" "}
        <L inches={A2_MAT.top} /> at the top and bottom.
      </p>
    ),
  },
  {
    q: "Is there a frame with a mat for a 27x40 poster?",
    a: (
      <p>
        Not in a standard size. A <L inches={MAT_WIDTH} /> mat needs a{" "}
        <S size={customFrame(P27.frames)} /> custom frame. The{" "}
        <PageLink id="F5">frame and mat calculator</PageLink> works out other mat widths.
      </p>
    ),
  },
  {
    q: "Can I use centimetres?",
    a: (
      <p>
        Yes. Switch to cm at the top of the page. {cap(withArticle(P24.p.id))} poster is{" "}
        <span className="font-mono">{size(P24.p, "cm")}</span>.
      </p>
    ),
  },
];

/**
 * F6: poster frame sizes, the picker, the chart, the size groups, paintings, the how-to and the
 * questions.
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-page-follows-the-chart-outline}
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-page-carries-its-head-values-and-breadcrumbs}
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-page-links-only-to-live-pages}
 */
export default function PosterFrameSizes() {
  const [first, second, third] = P11.frames.matted;
  if (!first || !second || !third || P11.frames.matted.length !== 3)
    throw new Error("expected three frames for an 11x17 with a mat");
  return (
    <div className="page flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: F6.name }]} />
        <h1 className="display md:display-xl">{F6.seo.h1}</h1>
        {/* {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-answer-paragraph-names-the-head-keyword-with-numbers} */}
        <p className="max-w-prose md:body-lg">
          Poster frame sizes match the poster when there is no mat: {withArticle(P18.p.id)} poster
          takes {withArticle(P18_FRAME)} frame. With a mat it takes a bigger frame:{" "}
          {withArticle(P11.p.id)} poster takes {article(first.frame.id)} {or(ids(P11.frames))}{" "}
          frame.
        </p>
      </div>

      <Widget />

      {/* {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-chart-table-maps-each-poster-to-its-frames} */}
      <Section title="Poster frame sizes chart">
        <p className="max-w-prose">
          One row per poster. Without a mat, the frame is the poster&apos;s size. With a mat, each
          frame shows its border at the sides and at the top and bottom. The mat overlaps the poster
          by <L inches={MAT_OVERLAP} /> on each side.
        </p>
        <SizeTable
          title="Standard poster frame sizes"
          meta="Borders: sides / top and bottom"
          selectable={false}
          columns={[
            { label: "Poster" },
            { label: "Without a mat", num: true },
            { label: "With a mat", num: true },
          ]}
          rows={ROWS.map(({ p, frames }) => ({
            id: p.id,
            label: <PosterCell p={p} />,
            cells: [<BareCell key="b" frames={frames} />, <MatCell key="m" frames={frames} />],
          }))}
        />
      </Section>

      {/* {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-size-groups-answer-each-poster-in-a-card} */}
      <Section title={`Frames for small posters: ${and(SMALL.map((r) => r.p.id))}`}>
        <p className="max-w-prose">
          A small poster takes a frame of its own size without a mat. With a mat, go up one or two
          sizes.
        </p>
        <div className="f6-sizes">
          {SMALL.map(({ p, frames }) => (
            <Case key={p.id} p={p} frames={frames} />
          ))}
        </div>
      </Section>

      <Section title={`Frames for large posters: ${LARGE[0]?.p.id} to ${LARGE.at(-1)?.p.id}`}>
        <p className="max-w-prose">
          Large posters also take a frame of their own size. With a mat, only one standard frame
          fits each, and {P27.p.id} has none.
        </p>
        <div className="f6-sizes">
          {LARGE.map(({ p, frames }) => (
            <Case key={p.id} p={p} frames={frames} />
          ))}
        </div>
      </Section>

      <Section title={`Frames for A-series posters: ${and(A_SERIES.map((r) => r.p.id))}`}>
        <p className="max-w-prose">
          A-series sizes are metric. Without a mat, use the frame sold under the paper&apos;s name.
          With a mat, they fit US frames.
        </p>
        <div className="f6-sizes">
          {A_SERIES.map(({ p, frames }) => (
            <Case key={p.id} p={p} frames={frames}>
              <span className="f6-mm font-mono">{mm(p)}</span>
            </Case>
          ))}
        </div>
      </Section>

      {/* {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-painting-section-names-canvas-frame-sizes} */}
      <Section title="Painting frame sizes">
        <p className="max-w-prose">
          A painting on canvas takes a frame of the canvas&apos;s own size. Canvas is framed with no
          mat and no glass, so measure the canvas edge to edge.
        </p>
        <ul className="f6-canv">
          {PAINTINGS.map((f) => (
            <li key={f.id}>
              <span className="k">
                <U in={size(f, "in")} cm={size(f, "cm")} />
              </span>
              <span className="v">{f.id} frame</span>
            </li>
          ))}
        </ul>
        <p className="max-w-prose">
          A painting on paper is framed like a poster, with or without a mat. Use the tool above.
        </p>
      </Section>

      {/* {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-how-to-links-to-poster-sizes-only-when-that-page-is-live} */}
      <Section title="How to choose a poster frame">
        <ol className="f5-steps">
          {STEPS.map((s, i) => (
            <li key={s.t} className="f5-step">
              <span className="f5-num" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="f5-step-t">{s.t}</h3>
              <p>{s.p}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Questions about poster frames">
        <FAQ items={QUESTIONS} />
      </Section>

      <RelatedTools current="F6" outside={["P1"]} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd(F6)) }}
      />
    </div>
  );
}
