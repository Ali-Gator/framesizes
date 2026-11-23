import {
  CATALOG,
  DIPLOMA,
  type Frame,
  inEighths,
  LIP,
  MAT_OVERLAP,
  MAT_WIDTH,
  MAT_WIDTHS,
  type MatAnswer,
  matBorders,
  matSizes,
  preCutFrames,
  type Size,
  toCm,
  writeSize,
} from "@framesizes/sizes";
import type { ReactNode } from "react";

import { RelatedTools } from "@/components/frame-chart/related-tools";
import { drawing } from "@/components/frame-mat/answer";
import { FrameMat } from "@/components/frame-mat/frame-mat";
import { MatDrawing } from "@/components/frame-mat/mat-drawing";
import { article, writeIn } from "@/components/measure-frame/answer";
import { writeLength } from "@/components/measure-frame/state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FAQ } from "@/components/ui/faq";
import { SizeTable } from "@/components/ui/size-table";
import { U } from "@/components/ui/u";
import { breadcrumbJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";
import { livePage } from "@/lib/site-map";

import "./frame-mat.css";

const F5 = livePage("F5");

export const metadata = pageMetadata(F5);

const id = (size: Size) => writeSize(size, "search");
const join = (ids: readonly string[]) =>
  ids.length > 1 ? `${ids.slice(0, -1).join(", ")} and ${ids.at(-1)}` : (ids[0] ?? "");

function fromPrint(print: Size, width = MAT_WIDTH): MatAnswer {
  const found = matSizes({ from: "print", print, width });
  if (!found) throw new Error(`no answer for ${id(print)}`);
  return found;
}
function fromFrame(frame: Size, width = MAT_WIDTH): MatAnswer {
  const found = matSizes({ from: "frame", frame, width });
  if (!found) throw new Error(`no answer for ${id(frame)}`);
  return found;
}
const frameOf = (fid: string): Frame => {
  const found = CATALOG.find((f) => f.id === fid);
  if (!found) throw new Error(`no frame ${fid}`);
  return found;
};

/** A size in both units, eighths of an inch and one-decimal centimetres. */
const S = ({ size }: { size: Size }) => (
  <span className="font-mono">
    <U in={writeIn(size, "in")} cm={writeIn(size, "cm")} />
  </span>
);
/** A length in both units. */
const L = ({ inches }: { inches: number }) => (
  <U in={writeLength(inches, "in")} cm={writeLength(inches, "cm")} />
);
/** A length with no unit: eighths of an inch, or centimetres to one decimal. */
const n = (inches: number, unit: "in" | "cm") =>
  unit === "cm" ? toCm(inches).toFixed(1) : inEighths(inches);
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const withArticle = (text: string) => `${article(text)} ${text}`;
/** "1½ in at the sides, 1¾ in at the top and bottom", or "2¼ in all round". */
function Borders({ frame, print }: { frame: Size; print: Size }) {
  const b = matBorders(frame, print);
  if (writeLength(b.side, "in") === writeLength(b.top, "in"))
    return (
      <>
        <L inches={b.side} /> all round
      </>
    );
  return (
    <>
      <L inches={b.side} /> at the sides, <L inches={b.top} /> at the top and bottom
    </>
  );
}

// Every number below comes from the engine: the formula examples, the table, the cases, the FAQ.
const EIGHT_TEN = frameOf("8x10");
const EXAMPLE = fromPrint(EIGHT_TEN);
const ELEVEN_FOURTEEN = frameOf("11x14");
const REVERSE = fromFrame(ELEVEN_FOURTEEN);
const MATTED = CATALOG.filter((f) => f.mat);
const NO_MAT = CATALOG.filter((f) => !f.mat).map((f) => f.id);
const BORDERS = MATTED.flatMap((f) => {
  const b = matBorders(f, f.mat as Size);
  return [
    { f, w: b.side },
    { f, w: b.top },
  ];
});
const NARROWEST = BORDERS.reduce((a, b) => (b.w < a.w ? b : a));
const WIDEST = BORDERS.reduce((a, b) => (b.w > a.w ? b : a));

const P11 = { w: 11, h: 14 };
const P16 = { w: 16, h: 20 };
const CASE_11 = fromPrint(P11);
const CASE_16 = fromPrint(P16);
const between = (a: MatAnswer) =>
  a.frameMatch.kind === "custom" ? [a.frameMatch.below?.id, a.frameMatch.above?.id] : [];
const WIDER = preCutFrames(DIPLOMA.print).filter((f) => f.id !== DIPLOMA.frame.id);

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
    t: "Pick a direction",
    p: "Start from a print to get the frame, or from a frame to get the print. The Reverse button between them swaps the two.",
  },
  {
    t: "Enter the width and height",
    p: (
      <>
        Inches take fractions: 8 1/2, 8.5 or 8½. In cm, use one decimal, like{" "}
        {toCm(EIGHT_TEN.w).toFixed(1)}.
      </>
    ),
  },
  {
    t: "Pick a mat border",
    p: (
      <>
        Tap{" "}
        <U
          in={`${join(MAT_WIDTHS.map((w) => n(w, "in"))).replace(" and ", " or ")} in`}
          cm={`${join(MAT_WIDTHS.map((w) => n(w, "cm"))).replace(" and ", " or ")} cm`}
        />
        , or type your own. It is the board cut on each side. The frame&apos;s lip covers about{" "}
        <L inches={LIP} /> of it.
      </>
    ),
  },
  {
    t: "Read the answer",
    p: "This mat size calculator gives the frame size and the mat opening. Under them it lists the frames sold with a pre-cut mat for your print and the border each one gives.",
  },
] as const;

/** {@link openspec/specs/frame-mat-calculator/spec.md#requirement-the-questions-answer-in-the-server-html} */
const QUESTIONS = [
  {
    q: "What size frame for 11x14 print do I need?",
    a: (
      <p>
        {cap(withArticle(join(CASE_11.preCut.map((f) => f.id))))} frame. It is sold with a pre-cut
        mat for 11x14, with a border of <Borders frame={CASE_11.preCut[0] as Size} print={P11} />.
      </p>
    ),
  },
  {
    q: "What size frame for diploma certificates?",
    a: (
      <p>
        {cap(withArticle(DIPLOMA.frame.id))} frame. Diploma frames come with a mat cut for{" "}
        {article(id(DIPLOMA.print))} {id(DIPLOMA.print)} diploma:{" "}
        <Borders frame={DIPLOMA.frame} print={DIPLOMA.print} />.
        {WIDER.map((f) => (
          <span key={f.id}>
            {" "}
            For a wider border, {article(f.id)} {f.id} frame comes with a pre-cut{" "}
            {id(DIPLOMA.print)} mat: <Borders frame={f} print={DIPLOMA.print} />.
          </span>
        ))}
      </p>
    ),
  },
  {
    q: "How much bigger than the print is the frame?",
    a: (
      <p>
        With a <L inches={MAT_WIDTH} /> mat, <L inches={2 * MAT_WIDTH - 2 * MAT_OVERLAP} /> bigger
        each way: the mat adds <L inches={2 * MAT_WIDTH} /> and overlaps the print by{" "}
        <L inches={2 * MAT_OVERLAP} />. An 8x10 print needs an <S size={EXAMPLE.frame} /> frame.
      </p>
    ),
  },
  {
    q: "Why is the mat opening smaller than the print?",
    a: (
      <p>
        The mat overlaps the print by <L inches={MAT_OVERLAP} /> on each side, so the print
        can&apos;t slip through. The opening is <L inches={2 * MAT_OVERLAP} /> smaller each way.
      </p>
    ),
  },
  {
    q: "How wide is a pre-cut mat?",
    a: (
      <p>
        It depends on the frame: from <L inches={NARROWEST.w} /> ({article(NARROWEST.f.id)}{" "}
        {NARROWEST.f.id} frame with {article(id(NARROWEST.f.mat as Size))}{" "}
        {id(NARROWEST.f.mat as Size)} mat) to <L inches={WIDEST.w} /> ({article(WIDEST.f.id)}{" "}
        {WIDEST.f.id} frame with {article(id(WIDEST.f.mat as Size))} {id(WIDEST.f.mat as Size)}{" "}
        mat). The Mat board sizes table lists each one.
      </p>
    ),
  },
  {
    q: "Does the frame cover part of the mat?",
    a: (
      <p>
        Yes. The frame&apos;s lip covers about <L inches={LIP} /> on each side, so a{" "}
        <L inches={MAT_WIDTH} /> border shows about <L inches={MAT_WIDTH - LIP} />.
      </p>
    ),
  },
  {
    q: "Can I use centimetres?",
    a: (
      <p>
        Yes. Switch to cm at the top of the calculator. An 8x10 print is{" "}
        <span className="font-mono">{writeIn(EIGHT_TEN, "cm")}</span>.
      </p>
    ),
  },
];

/**
 * F5: the frame and mat calculator, its formula, the mat board sizes and common prints.
 * {@link openspec/specs/frame-mat-calculator/spec.md#requirement-the-page-follows-the-approved-outline}
 * {@link openspec/specs/frame-mat-calculator/spec.md#requirement-the-page-carries-its-head-values-and-breadcrumbs}
 * {@link openspec/specs/frame-mat-calculator/spec.md#requirement-the-shop-block-stays-out-until-affiliate-links-are-wired}
 */
export default function FrameMatCalculator() {
  const overlap = 2 * MAT_OVERLAP;
  return (
    <div className="page flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: F5.name }]} />
        <h1 className="display md:display-xl">{F5.seo.h1}</h1>
        {/* {@link openspec/specs/frame-mat-calculator/spec.md#requirement-the-intro-sentence-names-the-head-keyword} */}
        <p className="max-w-prose md:body-lg">
          A picture frame size calculator for framing a print with a mat: enter the print and the
          mat border to get the frame size and the mat opening, or start from a frame to find the
          print that fits.
        </p>
      </div>

      <FrameMat />

      <Section title="How to use the frame and mat calculator">
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

      {/* {@link openspec/specs/frame-mat-calculator/spec.md#requirement-the-formula-section-gives-the-rules-and-the-mat-board-sizes} */}
      <Section title="Frame and mat size formula">
        <div className="f5-formula">
          <div className="f5-rules">
            <div className="f5-rule">
              <span className="label text-ink-muted">From a print</span>
              <span className="f5-rule-v font-mono">
                frame = print − <L inches={overlap} /> + 2 × mat border
              </span>
              <p>
                <U
                  in={`An 8x10 print with a ${writeLength(MAT_WIDTH, "in")} mat: ${EIGHT_TEN.w} − ${n(overlap, "in")} + ${n(2 * MAT_WIDTH, "in")} = ${n(EXAMPLE.frame.w, "in")} and ${EIGHT_TEN.h} − ${n(overlap, "in")} + ${n(2 * MAT_WIDTH, "in")} = ${n(EXAMPLE.frame.h, "in")}. The frame is ${writeIn(EXAMPLE.frame, "in")}.`}
                  cm={`An 8x10 print (${writeIn(EIGHT_TEN, "cm")}) with a ${writeLength(MAT_WIDTH, "cm")} mat needs a ${writeIn(EXAMPLE.frame, "cm")} frame.`}
                />
              </p>
            </div>
            <div className="f5-rule">
              <span className="label text-ink-muted">From a frame</span>
              <span className="f5-rule-v font-mono">
                print = frame − 2 × mat border + <L inches={overlap} />
              </span>
              <p>
                <U
                  in={`An 11x14 frame with a ${writeLength(MAT_WIDTH, "in")} mat: ${ELEVEN_FOURTEEN.w} − ${n(2 * MAT_WIDTH, "in")} + ${n(overlap, "in")} = ${n(REVERSE.print.w, "in")} and ${ELEVEN_FOURTEEN.h} − ${n(2 * MAT_WIDTH, "in")} + ${n(overlap, "in")} = ${n(REVERSE.print.h, "in")}. The largest print is ${writeIn(REVERSE.print, "in")}.`}
                  cm={`An 11x14 frame (${writeIn(ELEVEN_FOURTEEN, "cm")}) with a ${writeLength(MAT_WIDTH, "cm")} mat takes a print up to ${writeIn(REVERSE.print, "cm")}.`}
                />
              </p>
            </div>
            <div className="f5-rule">
              <span className="label text-ink-muted">Mat opening</span>
              <span className="f5-rule-v font-mono">
                opening = print − <L inches={overlap} />
              </span>
              <p>
                The mat overlaps the print by <L inches={MAT_OVERLAP} /> on each side. An 8x10 print
                needs a <S size={EXAMPLE.opening} /> opening.
              </p>
            </div>
          </div>
          <MatDrawing
            className="f5-fig"
            draw={drawing({ answer: EXAMPLE, width: MAT_WIDTH }, "print", "in")}
            caption={
              <>
                An 8x10 print with a <L inches={MAT_WIDTH} /> mat border: frame{" "}
                <S size={EXAMPLE.frame} />, opening <S size={EXAMPLE.opening} />. The dashed line is
                the print&apos;s edge under the mat. The frame&apos;s lip covers about{" "}
                <L inches={LIP} /> of the border, so about <L inches={MAT_WIDTH - LIP} /> shows.
              </>
            }
          />
        </div>
        <SizeTable
          title="Mat board sizes"
          meta="Pre-cut mats sold with standard frames"
          selectable={false}
          columns={[
            { label: "Frame" },
            { label: "Mat opening", num: true },
            { label: "Print" },
            { label: "Mat border (sides / top)", num: true },
          ]}
          rows={MATTED.map((f) => {
            const print = f.mat as Size;
            const b = matBorders(f, print);
            const even = writeLength(b.side, "in") === writeLength(b.top, "in");
            return {
              id: f.id,
              label: f.id,
              cells: [
                <S key="o" size={{ w: print.w - overlap, h: print.h - overlap }} />,
                id(print),
                <span key="b" className="font-mono">
                  {even ? (
                    <L inches={b.side} />
                  ) : (
                    <U
                      in={`${n(b.side, "in")} / ${n(b.top, "in")} in`}
                      cm={`${n(b.side, "cm")} / ${n(b.top, "cm")} cm`}
                    />
                  )}
                </span>,
              ],
            };
          })}
        />
        <p className="max-w-prose">
          Frame mat sizes are named by the frame: an 11x14 mat fits an 11x14 frame and has an
          opening for {article(id(ELEVEN_FOURTEEN.mat as Size))} {id(ELEVEN_FOURTEEN.mat as Size)}{" "}
          print. Squares follow the same rule. Usually sold without a mat: {join(NO_MAT)} frames.
        </p>
      </Section>

      {/* {@link openspec/specs/frame-mat-calculator/spec.md#requirement-the-common-prints-section-answers-three-frame-questions} */}
      <Section title="Frame sizes for common prints">
        <div className="f5-cases">
          {[
            { print: P11, a: CASE_11 },
            { print: P16, a: CASE_16 },
          ].map(({ print, a }) => {
            const pid = id(print);
            const frames = a.preCut;
            return (
              <article key={pid} className="f5-case">
                <h3 className="f5-case-t">
                  What size frame for {article(pid)} {pid} print?
                </h3>
                <span className="f5-case-v font-mono">
                  {frames.map((f) => f.id).join(" or ")} frame
                </span>
                <p>
                  {frames.length === 1 ? "It is" : "Both are"} sold with a pre-cut mat for {pid}.
                  {frames.map((f) => (
                    <span key={f.id}>
                      {" "}
                      {frames.length === 1 ? "The border is" : `The ${f.id} gives`}{" "}
                      <Borders frame={f} print={print} />.
                    </span>
                  ))}
                </p>
                <p className="f5-case-m">
                  With a <L inches={MAT_WIDTH} /> mat cut to order: <S size={a.frame} />, between{" "}
                  {between(a).join(" and ")}.
                </p>
              </article>
            );
          })}
          <article className="f5-case">
            <h3 className="f5-case-t">What size frame for a diploma?</h3>
            <span className="f5-case-v font-mono">{DIPLOMA.frame.id} frame</span>
            <p>
              Diploma frames come with a mat cut for {article(id(DIPLOMA.print))}{" "}
              {id(DIPLOMA.print)} diploma: <Borders frame={DIPLOMA.frame} print={DIPLOMA.print} />.
            </p>
            {WIDER.map((f) => (
              <p key={f.id} className="f5-case-m">
                For a wider border, {article(f.id)} {f.id} frame comes with a pre-cut{" "}
                {id(DIPLOMA.print)} mat: <Borders frame={f} print={DIPLOMA.print} />.
              </p>
            ))}
          </article>
        </div>
      </Section>

      <Section title="Questions about frame and mat sizes">
        <FAQ items={QUESTIONS} />
      </Section>

      <RelatedTools current="F5" outside={["PH2"]} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd(F5)) }}
      />
    </div>
  );
}
