import {
  ABOVE_SOFA,
  CATALOG,
  CENTRE_LINE,
  DOOR,
  findFrame,
  framesFor,
  MOULDING,
  SOFA,
  toCm,
  toWholeCm,
  writeSize,
} from "@framesizes/sizes";
import type { ReactNode } from "react";

import { RelatedTools } from "@/components/frame-chart/related-tools";
import { outsideSize } from "@/components/frames-on-wall/display";
import { FramesOnWall } from "@/components/frames-on-wall/frames-on-wall";
import { IfLive, PageLink } from "@/components/site/page-link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FAQ } from "@/components/ui/faq";
import { SizeTable } from "@/components/ui/size-table";
import { U } from "@/components/ui/u";
import { breadcrumbJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";
import { livePage } from "@/lib/site-map";

import "./wall.css";

const F2 = livePage("F2");

export const metadata = pageMetadata(F2);

/** The top of the hanging gap above furniture; ABOVE_SOFA is its bottom. */
const GAP_TOP = 10;
/** Art about two-thirds as wide as the furniture below it. */
const TWO_THIRDS = Math.round((SOFA.width * 2) / 3);

/** A length in inches in both units, whole centimetres, in mono. */
function Len({ inches, mono = true }: { inches: number; mono?: boolean }) {
  const text = <U in={`${inches} in`} cm={`${toWholeCm(inches)} cm`} />;
  return mono ? <span className="font-mono">{text}</span> : text;
}

/** "8 to 10 in" / "20 to 25 cm". */
const Gap = () => (
  <span className="font-mono">
    <U
      in={`${ABOVE_SOFA} to ${GAP_TOP} in`}
      cm={`${toWholeCm(ABOVE_SOFA)} to ${toWholeCm(GAP_TOP)} cm`}
    />
  </span>
);

/** A frame size in both units, one-decimal centimetres. */
const Size = ({ w, h }: { w: number; h: number }) => (
  <U in={writeSize({ w, h }, "in")} cm={writeSize({ w, h }, "cm")} />
);

const Mono = ({ children }: { children: ReactNode }) => (
  <span className="font-mono">{children}</span>
);

const Moulding = () => <U in={`${MOULDING} in`} cm={`${toCm(MOULDING)} cm`} />;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="h2">{title}</h2>
      {children}
    </section>
  );
}

function Rule({
  label,
  value,
  children,
}: {
  label: string;
  value: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="wp-rule">
      <span className="fs-label">{label}</span>
      <span className="wp-rule-v font-mono">{value}</span>
      <p>{children}</p>
    </div>
  );
}

/** The wall table's sizes and where each one works, from the canvas. */
const WALL_SIZES = [
  ["5x7", "A shelf, a desk or part of a group"],
  ["8x10", "A narrow wall or part of a group"],
  ["11x14", "Beside a door or in a hallway"],
  ["16x20", "Above a small table, or in a pair"],
  ["18x24", "Above a dresser or a desk"],
  ["24x36", "Above a sofa or a bed"],
] as const;

const RECTANGULAR = framesFor("portrait");
const SMALLEST = RECTANGULAR[0]?.id ?? "";
const LARGEST = RECTANGULAR.at(-1)?.id ?? "";
const EXAMPLE = { w: 16, h: 20 };
const EXAMPLE_OUT = outsideSize(EXAMPLE);

const QUESTIONS = [
  {
    q: "What are standard wall frame sizes?",
    a: (
      <p>
        The common ones are 8x10, 11x14, 16x20, 18x24 and 24x36 inches. On the wall each one takes
        up <Len inches={2 * MOULDING} mono={false} /> more each way with a <Moulding /> moulding, so
        a 16x20 covers <Size {...EXAMPLE_OUT} />.
      </p>
    ),
  },
  {
    q: "What size frame goes above a sofa?",
    a: (
      <p>
        Aim for art about two-thirds as wide as the sofa: about{" "}
        <U
          in={`${TWO_THIRDS} in over an ${SOFA.width} in sofa`}
          cm={`${toWholeCm(TWO_THIRDS)} cm over a ${toWholeCm(SOFA.width)} cm sofa`}
        />
        . Two 24x36 frames side by side, or three 16x20s in a row, come close. Hang the bottom edge{" "}
        <U
          in={`${ABOVE_SOFA} to ${GAP_TOP} in`}
          cm={`${toWholeCm(ABOVE_SOFA)} to ${toWholeCm(GAP_TOP)} cm`}
        />{" "}
        above the back.
      </p>
    ),
  },
  {
    q: "How high should I hang a frame?",
    a: (
      <p>
        Put its centre <Len inches={CENTRE_LINE} mono={false} /> from the floor. Over furniture,
        keep{" "}
        <U
          in={`${ABOVE_SOFA} to ${GAP_TOP} in`}
          cm={`${toWholeCm(ABOVE_SOFA)} to ${toWholeCm(GAP_TOP)} cm`}
        />{" "}
        between the furniture and the frame instead.
        <IfLive page="G3">
          {" "}
          The <PageLink id="G3">hanging height calculator</PageLink> works it out for your frame.
        </IfLive>
      </p>
    ),
  },
  {
    q: "How accurate is a frame size from a photo?",
    a: (
      <p>
        The longer the thing you mark, the closer the sizes. A door or the whole wall works best. A
        credit card is small, so a slip of a couple of pixels matters more. Take the photo straight
        on: an angled photo shrinks the far side.
      </p>
    ),
  },
  {
    q: "Is my wall photo uploaded anywhere?",
    a: (
      <p>
        No. The photo stays on your device. The page opens it in your browser and sends it nowhere.
      </p>
    ),
  },
];

/**
 * F2: frame sizes on your wall, with the frame visualizer.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-the-page-follows-the-approved-outline}
 */
export default function FrameSizesOnWall() {
  return (
    <div className="page flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: F2.name }]} />
        <h1 className="display md:display-xl">{F2.seo.h1}</h1>
        {/* {@link openspec/specs/frames-on-wall/spec.md#requirement-the-first-paragraph-answers-how-big-a-frame-should-be} */}
        <p className="max-w-prose md:body-lg">
          A frame looks right on a wall when it is about two-thirds as wide as the furniture below
          it and hangs <Gap /> above it. Upload a photo of your wall and mark one thing you know the
          size of, or use the sample room, and the frame visualizer shows standard frame sizes on it
          at true size.
        </p>
      </div>

      <FramesOnWall />

      <Section title="How to see frame sizes on your wall">
        <ol className="wp-steps">
          <li>
            Take a photo of your wall, standing straight in front of it. Or skip this and use the
            sample room.
          </li>
          <li>
            Pick one thing in the photo you know the size of: a door, the wall, a sofa, a bed, a
            Letter or A4 sheet, or a credit card.
          </li>
          <li>
            Drag the two dots to its ends and check its length. A door is{" "}
            <U
              in={<Mono>{DOOR.height} in</Mono>}
              cm={
                <>
                  about <Mono>200 cm</Mono>
                </>
              }
            />{" "}
            tall unless yours is different.
          </li>
          <li>
            Add frames and drag them where you want them. Tap a frame to see and change its distance
            to the frames, furniture and edges around it.
          </li>
        </ol>
      </Section>

      <Section title="Picture frame sizes on a wall: how big to go">
        <div className="wp-rules">
          <Rule label="Width" value="⅔ of the furniture">
            Art over a sofa or a bed looks balanced at about two-thirds of the furniture&apos;s
            width. Over an <Len inches={SOFA.width} /> sofa, that&apos;s about{" "}
            <Len inches={TWO_THIRDS} /> of art.
          </Rule>
          <Rule label="Gap" value={<Gap />}>
            Leave <Gap /> between the top of the furniture and the bottom of the frame.
          </Rule>
          <Rule
            label="Height"
            value={
              <>
                <Len inches={CENTRE_LINE} mono={false} /> to the centre
              </>
            }
          >
            On an open wall, put the centre of the frame <Len inches={CENTRE_LINE} /> from the
            floor.
            <IfLive page="G3">
              {" "}
              The <PageLink id="G3">hanging height calculator</PageLink> works it out for your
              frame.
            </IfLive>
          </Rule>
        </div>
      </Section>

      <Section title="Wall photo frame sizes">
        <p className="max-w-prose">
          The size of a frame names the print it holds. The moulding adds to every side, so the
          frame covers more wall than its size. With a{" "}
          <Mono>
            <Moulding />
          </Mono>{" "}
          moulding, a <Mono>16x20</Mono> frame covers{" "}
          <Mono>
            <Size {...EXAMPLE_OUT} />
          </Mono>{" "}
          of wall.
        </p>
        {/* {@link openspec/specs/frames-on-wall/spec.md#requirement-the-wall-table-lists-the-space-six-sizes-take} */}
        <div className="max-w-[760px]">
          <SizeTable
            title="Wall art frame sizes and the space they take"
            meta={
              <>
                With a <Moulding /> moulding
              </>
            }
            selectable={false}
            columns={[
              { label: "Frame size", num: true },
              { label: "On the wall", num: true },
              { label: "Where it works" },
            ]}
            rows={WALL_SIZES.flatMap(([id, where]) => {
              const f = findFrame(id);
              if (!f) return [];
              return [
                {
                  id,
                  label: <Size w={f.w} h={f.h} />,
                  cells: [<Size key="out" {...outsideSize(f)} />, where],
                },
              ];
            })}
          />
        </div>
        <p className="max-w-prose">
          The visualizer has all {CATALOG.length} standard sizes from <Mono>{SMALLEST}</Mono> to{" "}
          <Mono>{LARGEST}</Mono>, square ones included. The{" "}
          <PageLink id="F1">frame size chart</PageLink> lists them in inches and cm.
        </p>
      </Section>

      <Section title="Questions about frames on a wall">
        <FAQ items={QUESTIONS} />
      </Section>

      <RelatedTools current="F2" outside={["C1", "G1"]} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd(F2)) }}
      />
    </div>
  );
}
