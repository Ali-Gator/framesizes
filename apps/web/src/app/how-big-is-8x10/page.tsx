import {
  ACTUAL_SIZES,
  CHECK_OBJECTS,
  CM_PER_INCH,
  oneDecimal,
  writeActual,
} from "@framesizes/sizes";
import type { ReactNode } from "react";

import { ActualSizeViewer } from "@/components/actual-size/actual-size";
import { RelatedTools } from "@/components/frame-chart/related-tools";
import { PageLink } from "@/components/site/page-link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FAQ } from "@/components/ui/faq";
import { U } from "@/components/ui/u";
import { breadcrumbJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";
import { livePage } from "@/lib/site-map";

import "./actual-size.css";

const F3 = livePage("F3");

export const metadata = pageMetadata(F3);

const byId = (id: string) => {
  const found = ACTUAL_SIZES.find((s) => s.id === id);
  if (!found) throw new Error(`no actual size ${id}`);
  return found;
};
const EIGHT_TEN = byId("8x10");
const A4 = byId("A4");
const A3 = byId("A3");
const BY_AREA = [...ACTUAL_SIZES].sort((a, b) => a.w * a.h - b.w * b.h);
const AREA = EIGHT_TEN.w * EIGHT_TEN.h;

/** A size in both units, as the viewer writes it. */
const Both = ({ w, h }: { w: number; h: number }) => (
  <U in={writeActual({ w, h }, "in")} cm={writeActual({ w, h }, "cm")} />
);
/** A length in both units, one decimal. */
const Len = ({ inches }: { inches: number }) => (
  <span className="font-mono">
    <U in={`${oneDecimal(inches)} in`} cm={`${(inches * CM_PER_INCH).toFixed(1)} cm`} />
  </span>
);
/** "1×" for 8x10, one decimal for the rest. */
const times = (s: { w: number; h: number }) => `${oneDecimal((s.w * s.h) / AREA)}×`;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="h2">{title}</h2>
      {children}
    </section>
  );
}

const LETTER = { w: CHECK_OBJECTS.letter.short, h: CHECK_OBJECTS.letter.long };
const A4_SHEET = { w: CHECK_OBJECTS.a4.short, h: CHECK_OBJECTS.a4.long };
const CARD = { w: CHECK_OBJECTS.card.long, h: CHECK_OBJECTS.card.short };
const CARDS = Math.round(AREA / (CARD.w * CARD.h));

const THINGS = [
  {
    name: "Letter sheet",
    size: LETTER,
    text: (
      <>
        An 8x10 is <Len inches={LETTER.w - EIGHT_TEN.w} /> narrower and{" "}
        <Len inches={LETTER.h - EIGHT_TEN.h} /> shorter than printer paper.
      </>
    ),
  },
  {
    name: "A4 sheet",
    size: A4_SHEET,
    text: (
      <>
        A little wider than an 8x10 and <Len inches={A4_SHEET.h - EIGHT_TEN.h} /> longer, so an A4
        print does not fit an 8x10 frame.
      </>
    ),
  },
  {
    name: "Credit card",
    size: CARD,
    text: <>About {CARDS} cards laid flat cover one 8x10.</>,
  },
];

/** The drawing's scale, px per inch, and its shared bottom-left corner. */
const DRAW = { k: 13, x: 20, bottom: 276 };

/**
 * The seven sizes from one corner at one scale, 8x10 filled.
 * {@link openspec/specs/actual-size/spec.md#requirement-the-comparison-table-and-drawing-come-from-the-size-engine}
 */
function Comparison() {
  const rects = [...BY_AREA].reverse().map((s) => ({
    s,
    w: Math.round(s.w * DRAW.k),
    h: Math.round(s.h * DRAW.k),
  }));
  return (
    <svg
      viewBox="0 0 300 296"
      role="img"
      aria-label={`Seven frame sizes drawn to one scale from a shared bottom-left corner: ${BY_AREA.map(
        (s) => s.id,
      )
        .join(", ")
        .replace(/, ([^,]*)$/, " and $1")}`}
    >
      {rects.map(({ s, w, h }) => {
        const top = DRAW.bottom - h;
        const current = s.id === EIGHT_TEN.id;
        return (
          <g key={s.id}>
            <rect
              x={DRAW.x}
              y={top}
              width={w}
              height={h}
              fill={current ? "#FFC21A" : "none"}
              stroke={current ? "#14181C" : "#868D85"}
              strokeWidth="2"
            />
            <text
              x={current ? DRAW.x + 6 : DRAW.x + w + 4}
              y={current ? top + 16 : top + 12}
              fontFamily="IBM Plex Mono, monospace"
              fontSize="12"
              fontWeight="500"
              fill="#14181C"
            >
              {s.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const QUESTIONS = [
  {
    q: "How big is 11x14?",
    a: (
      <p>
        <U in="11 by 14 inches" cm={writeActual(byId("11x14"), "cm")} />, almost twice the area of
        an 8x10. It is the usual frame for an 8x10 photo with a mat around it.
      </p>
    ),
  },
  {
    q: "How big is a 16x20 frame?",
    a: (
      <p>
        It holds a <U in="16 by 20 inch" cm={writeActual(byId("16x20"), "cm")} /> print, four times
        the area of an 8x10. The moulding makes the frame itself bigger.
      </p>
    ),
  },
  {
    q: "What size is an A4 frame?",
    a: (
      <p>
        An A4 frame holds a <Both {...A4} /> print, the size of an A4 sheet. It is a little bigger
        than an 8x10.
      </p>
    ),
  },
  {
    q: "What size is an A3 frame?",
    a: (
      <p>
        An A3 frame holds a <Both {...A3} /> print: two A4 sheets side by side.
      </p>
    ),
  },
  {
    q: "Is 8x10 the same as A4?",
    a: (
      <p>
        No. A4 is <Both {...A4} />, about <Len inches={A4.h - EIGHT_TEN.h} /> longer than an 8x10,
        so an A4 print needs an A4 frame.
      </p>
    ),
  },
  {
    q: "How exact is the actual size view?",
    a: (
      <p>
        It depends on your check. Once a card or a sheet lines up with the outline, the sizes match
        it, as long as the page zoom stays at 100%. Before a check the page guesses from your
        screen. That guess can be well off, so the box says the scale is not checked yet.
      </p>
    ),
  },
];

/**
 * F3: how big is 8x10, with the actual size viewer.
 * {@link openspec/specs/actual-size/spec.md#requirement-the-page-follows-the-approved-outline}
 */
export default function HowBigIs8x10() {
  return (
    <div className="page flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: F3.name }]} />
        <h1 className="display md:display-xl">{F3.seo.h1}</h1>
        {/* {@link openspec/specs/actual-size/spec.md#requirement-the-first-paragraph-answers-how-big-8x10-is} */}
        <p className="max-w-prose md:body-lg">
          An 8x10 is{" "}
          <span className="font-mono">8 by 10 inches ({writeActual(EIGHT_TEN, "cm")})</span>, a
          little smaller than a sheet of Letter paper. Check your screen once with a credit card, a
          sheet of paper or your screen size, and the box below shows it at its real size. Switch to
          11x14, 16x20, A4 or A3 to compare.
        </p>
      </div>

      <ActualSizeViewer />

      <Section title="How to see a frame size at actual size">
        <ol className="max-w-prose list-decimal pl-6 flex flex-col gap-2.5">
          <li>
            Check the scale. Hold a credit card against the screen and drag until the outline
            matches it, or pick your screen size. You do this once on each device.
          </li>
          <li>
            Pick a size and see it at 1:1, with rulers along the top and the left. On a phone it
            fills the whole screen.
          </li>
          <li>
            If the size is bigger than your screen, drag to see the rest. The small map shows the
            whole frame and the part on screen.
          </li>
        </ol>
      </Section>

      <Section title="How big is 8x10 next to things you know">
        <div className="f3-things">
          {THINGS.map((t) => (
            <div key={t.name} className="f3-thing">
              <span className="label text-ink-muted">{t.name}</span>
              <span className="f3-thing-v">
                <Both {...t.size} />
              </span>
              <p>{t.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="8x10 picture frame sizes compared">
        <div className="f3-cmp">
          <figure className="f3-cmp-fig">
            <Comparison />
          </figure>
          <div className="f3-tw">
            <table className="f3-t">
              <caption>8x10 next to other frame sizes</caption>
              <thead>
                <tr>
                  <th scope="col">Size</th>
                  <th scope="col">
                    <U in="Inches" cm="Centimetres" />
                  </th>
                  <th scope="col">Area vs 8x10</th>
                </tr>
              </thead>
              <tbody>
                {BY_AREA.map((s) => (
                  <tr key={s.id} className={s.id === EIGHT_TEN.id ? "is-cur" : undefined}>
                    <td>{s.id}</td>
                    <td>
                      <Both {...s} />
                    </td>
                    <td>{times(s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="max-w-prose">
          A frame sold as 8x10 holds an 8x10 print. The moulding adds to the outside, so the frame
          on the wall is bigger. The <PageLink id="F1">frame size chart</PageLink> lists every
          standard size.
        </p>
      </Section>

      <Section title="Questions about frame sizes">
        <FAQ items={QUESTIONS} />
      </Section>

      <RelatedTools current="F3" outside={["PH1", "Q2", "G1"]} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd(F3)) }}
      />
    </div>
  );
}
