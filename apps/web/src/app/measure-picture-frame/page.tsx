import {
  findFrame,
  frameMeasurements,
  LIP,
  MAT_OVERLAP,
  type Size,
  writeSize,
} from "@framesizes/sizes";
import type { ReactNode } from "react";

import { RelatedTools } from "@/components/frame-chart/related-tools";
import { article, writeIn } from "@/components/measure-frame/answer";
import { Diagram } from "@/components/measure-frame/diagram";
import { MeasureFrame } from "@/components/measure-frame/measure-frame";
import { writeLength } from "@/components/measure-frame/state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FAQ } from "@/components/ui/faq";
import { SizeTable } from "@/components/ui/size-table";
import { U } from "@/components/ui/u";
import { breadcrumbJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";
import { livePage } from "@/lib/site-map";

import "./measure-frame.css";

const F4 = livePage("F4");

export const metadata = pageMetadata(F4);

function frame(id: string) {
  const found = findFrame(id);
  if (!found) throw new Error(`no frame ${id}`);
  return found;
}

/** A size in both units, eighths of an inch and one-decimal centimetres. */
const S = ({ size }: { size: Size }) => (
  <span className="font-mono">
    <U in={writeIn(size, "in")} cm={writeIn(size, "cm")} />
  </span>
);
/** A size in both units with its article: "an 8 × 10 in", "a 20.3 × 25.4 cm". */
const AS = ({ size }: { size: Size }) => {
  const [inches, cm] = [writeIn(size, "in"), writeIn(size, "cm")];
  return (
    <U
      in={
        <>
          {article(inches)} <span className="font-mono">{inches}</span>
        </>
      }
      cm={
        <>
          {article(cm)} <span className="font-mono">{cm}</span>
        </>
      }
    />
  );
};
/** A length in both units. */
const L = ({ inches }: { inches: number }) => (
  <U in={writeLength(inches, "in")} cm={writeLength(inches, "cm")} />
);

const EIGHT_TEN = frameMeasurements(frame("8x10"));
const FACE = EIGHT_TEN.face;
const TABLE = ["4x6", "5x7", "8x10", "11x14", "16x20", "24x36"].map((id) => ({
  id,
  m: frameMeasurements(frame(id)),
}));

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
    art: "back",
    t: "Turn the frame over",
    p: "Lay it face down on a towel. Bend back the tabs and lift out the backing board if it comes out easily.",
  },
  {
    art: "inside",
    t: "Measure the inside, wall to wall",
    p: (
      <>
        Measure the width, then the height, of the glass or the recess it sits in. Read the tape to
        the nearest <U in="⅛ in" cm="0.1 cm" />.
      </>
    ),
  },
  {
    art: "result",
    t: "Enter the numbers",
    p: (
      <>
        Pick Inside, enter both sides and the wizard names the standard size. It allows{" "}
        <U in="⅜ in" cm="about 1 cm" /> either way.
      </>
    ),
  },
] as const;

/** {@link openspec/specs/measure-frame/spec.md#requirement-the-questions-answer-in-the-server-html} */
const QUESTIONS = [
  {
    q: "Is frame size measured inside or outside?",
    a: (
      <p>
        Inside. An 8x10 frame holds <AS size={EIGHT_TEN.inside} /> picture. The outside is bigger by
        the moulding: about <S size={EIGHT_TEN.outside} /> with a <L inches={FACE} /> moulding.
      </p>
    ),
  },
  {
    q: "Why is the opening smaller than my photo?",
    a: (
      <p>
        The lip at the front covers <L inches={LIP} /> of the photo on each side and holds it in
        place. An 8x10 frame shows <S size={EIGHT_TEN.front} /> of an 8x10 photo.
      </p>
    ),
  },
  {
    q: "Do I measure with the mat or without?",
    a: (
      <p>
        For the frame size, without: measure the inside at the back. Measure the mat opening only to
        find which print the mat takes.
      </p>
    ),
  },
  {
    q: "What size frame do I need for an 8x10 photo?",
    a: <p>An 8x10 frame with no mat, or an 11x14 frame with a mat cut for an 8x10 print.</p>,
  },
  {
    q: "My frame matches no standard size. What now?",
    a: (
      <p>
        First check that you measured the inside at the back: the front opening is{" "}
        <L inches={2 * LIP} /> smaller. If the numbers stand, it is a custom size. A frame shop can
        cut a print or a mat to fit it.
      </p>
    ),
  },
  {
    q: "How do I measure a frame with a rounded edge?",
    a: (
      <p>
        Turn it over and measure the inside, where the edges are square. If the back is sealed,
        measure the moulding flat as seen from the front, from the outermost point to the glass, not
        around the curve.
      </p>
    ),
  },
];

/**
 * F4: how to measure a picture frame, with the measuring wizard.
 * {@link openspec/specs/measure-frame/spec.md#requirement-the-page-follows-the-approved-outline}
 * {@link openspec/specs/measure-frame/spec.md#requirement-the-page-carries-its-head-values-and-breadcrumbs}
 */
export default function MeasurePictureFrame() {
  return (
    <div className="page flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: F4.name }]} />
        <h1 className="display md:display-xl">{F4.seo.h1}</h1>
        {/* {@link openspec/specs/measure-frame/spec.md#requirement-the-first-paragraph-answers-with-the-frames-dimensions} */}
        <p className="max-w-prose md:body-lg">
          Picture frame dimensions are the inside of the frame: the size of the glass and the
          picture it holds. Measure the inside at the back, or the front opening, the mat opening or
          the outside, and the wizard names the standard size you have. An 8x10 frame is{" "}
          <S size={EIGHT_TEN.inside} /> inside, <S size={EIGHT_TEN.front} /> at the front opening
          and about <S size={EIGHT_TEN.outside} /> outside.
        </p>
      </div>

      <MeasureFrame />

      <Section title="How to measure picture frame size">
        <ol className="f4-steps">
          {STEPS.map((s, i) => (
            <li key={s.t} className="f4-step">
              <div className="f4-step-art">
                <Diagram kind={s.art} />
              </div>
              <span className="label text-ink-muted">Step {i + 1}</span>
              <h3 className="f4-step-t">{s.t}</h3>
              <p>{s.p}</p>
            </li>
          ))}
        </ol>
        <figure className="f4-xs">
          <div className="f4-xs-art">
            <Diagram kind="xsec" />
          </div>
          <figcaption>
            One edge of a frame, cut through, front at the top. The lip covers <L inches={LIP} /> of
            the picture on each side, so the front opening is <L inches={2 * LIP} /> smaller than
            the inside.
          </figcaption>
        </figure>
        <p className="max-w-prose">
          Can&apos;t open the frame? Measure the front opening if there is no mat, or the outside
          and the moulding width. On a rounded edge, measure flat as seen from the front, not around
          the curve.
        </p>
      </Section>

      {/* {@link openspec/specs/measure-frame/spec.md#requirement-the-table-gives-six-frames-four-measurements} */}
      <Section title="8x10 frame measurements and other sizes">
        <SizeTable
          title="Picture frame dimensions by size"
          meta={
            <>
              Outside with a <L inches={FACE} /> moulding
            </>
          }
          selectable={false}
          columns={[
            { label: "Frame" },
            { label: "Inside (frame size)", num: true },
            { label: "Front opening", num: true },
            { label: "Outside", num: true },
            { label: "Mat opening", num: true },
            { label: "Mat holds" },
          ]}
          rows={TABLE.map(({ id, m }) => ({
            id,
            label: id,
            cells: [
              <S key="i" size={m.inside} />,
              <S key="f" size={m.front} />,
              <S key="o" size={m.outside} />,
              m.mat ? <S key="m" size={m.mat.opening} /> : "—",
              m.mat ? `${writeSize(m.mat.print, "search")} print` : "—",
            ],
          }))}
        />
        <p className="max-w-prose">
          Frame dimensions are always the inside: an 8x10 frame holds <AS size={EIGHT_TEN.inside} />{" "}
          print. The front opening is <L inches={2 * LIP} /> smaller because the lip overlaps the
          picture, and the outside depends on the moulding. A frame with a mat shows less again: the
          mat opening is <L inches={2 * MAT_OVERLAP} /> smaller than the print it holds.
        </p>
      </Section>

      <Section title="Questions about frame dimensions">
        <FAQ items={QUESTIONS} />
      </Section>

      <RelatedTools current="F4" outside={["PH1"]} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd(F4)) }}
      />
    </div>
  );
}
