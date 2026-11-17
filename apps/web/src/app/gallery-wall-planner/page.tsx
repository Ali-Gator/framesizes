import {
  ABOVE_SOFA,
  CENTRE_LINE,
  GALLERY_GAP,
  MOULDING,
  SOFA,
  toCm,
  toWholeCm,
} from "@framesizes/sizes";
import type { ReactNode } from "react";

import { RelatedTools } from "@/components/frame-chart/related-tools";
import { writeNumber } from "@/components/frames-on-wall/display";
import { TEMPLATE_FRAMES } from "@/components/gallery-wall/copy";
import { GalleryWall } from "@/components/gallery-wall/gallery-wall";
import { templateTable } from "@/components/gallery-wall/state";
import { IfLive, PageLink } from "@/components/site/page-link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FAQ } from "@/components/ui/faq";
import { SizeTable } from "@/components/ui/size-table";
import { U } from "@/components/ui/u";
import { breadcrumbJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";
import { livePage } from "@/lib/site-map";

import "../frame-sizes-on-wall/wall.css";
import "./gallery.css";

const G1 = livePage("G1");

export const metadata = pageMetadata(G1);

/** The top of the hanging gap above furniture; ABOVE_SOFA is its bottom. */
const GAP_TOP = 10;
/** The usual gap between frames: from 2 in to the planner's default. */
const GAP_LOW = 2;
/** A group about two-thirds as wide as the furniture below it. */
const TWO_THIRDS = Math.round((SOFA.width * 2) / 3);

const Mono = ({ children }: { children: ReactNode }) => (
  <span className="font-mono">{children}</span>
);

/** A length in inches in both units, whole centimetres, in mono. */
const Len = ({ inches }: { inches: number }) => (
  <Mono>
    <U in={`${inches} in`} cm={`${toWholeCm(inches)} cm`} />
  </Mono>
);
/** "2 to 3 in" / "5 to 8 cm". */
const Spacing = () => (
  <Mono>
    <U
      in={`${GAP_LOW} to ${GALLERY_GAP} in`}
      cm={`${toWholeCm(GAP_LOW)} to ${toWholeCm(GALLERY_GAP)} cm`}
    />
  </Mono>
);
/** "8 to 10 in" / "20 to 25 cm". */
const Above = () => (
  <Mono>
    <U
      in={`${ABOVE_SOFA} to ${GAP_TOP} in`}
      cm={`${toWholeCm(ABOVE_SOFA)} to ${toWholeCm(GAP_TOP)} cm`}
    />
  </Mono>
);

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

const QUESTIONS = [
  {
    q: "How far apart should frames be in a gallery wall?",
    a: (
      <p>
        <Spacing />. Keep the same gap between every frame, and the group looks planned.
      </p>
    ),
  },
  {
    q: "How high should a gallery wall hang?",
    a: (
      <p>
        Over a sofa or a bed, leave <Above /> between the furniture and the lowest frame. On an open
        wall, put the centre of the whole group <Len inches={CENTRE_LINE} /> from the floor.
        <IfLive page="G3">
          {" "}
          The <PageLink id="G3">hanging height calculator</PageLink> does it for one frame.
        </IfLive>
      </p>
    ),
  },
  {
    q: "How big should a gallery wall be?",
    a: (
      <p>
        About two-thirds as wide as the furniture below it: about{" "}
        <U
          in={`${TWO_THIRDS} in over an ${SOFA.width} in sofa`}
          cm={`${toWholeCm(TWO_THIRDS)} cm over a ${toWholeCm(SOFA.width)} cm sofa`}
        />
        .
      </p>
    ),
  },
  {
    q: "How do I know where the nails go?",
    a: (
      <p>
        Measure the drop on the back of each frame: from the top edge to the wire pulled tight, to
        the sawtooth, or to the D-rings. Type it in the planner and it numbers every nail and
        measures it from the group&apos;s top-left corner and from the floor.
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

/** "45 × 16 in" / "114 × 41 cm", each side rounded as a distance. */
const Dims = ({ w, h }: { w: number; h: number }) => (
  <U
    in={`${writeNumber(w, "in")} × ${writeNumber(h, "in")} in`}
    cm={`${writeNumber(w, "cm")} × ${writeNumber(h, "cm")} cm`}
  />
);

/**
 * G1: the gallery wall layout planner, with the gallery wall layout generator.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-planner-page-follows-the-approved-outline}
 */
export default function GalleryWallPlanner() {
  return (
    <div className="page flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: G1.name }]} />
        <h1 className="display md:display-xl">{G1.seo.h1}</h1>
        {/* {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-first-paragraph-answers-how-to-space-and-hang-a-gallery-wall} */}
        <p className="max-w-prose md:body-lg">
          A gallery wall layout looks planned when every frame sits the same distance from its
          neighbours, usually <Spacing />, and the group hangs <Len inches={ABOVE_SOFA} /> above the
          sofa, or with its centre <Len inches={CENTRE_LINE} /> from the floor on an open wall. Pick
          one of five templates, change the frame sizes and the gap, and the planner gives you the
          group&apos;s size and the spot for every nail.
        </p>
      </div>

      <GalleryWall />

      <Section title="How to use the gallery wall planner">
        <ol className="wp-steps">
          <li>
            Pick a template. Its frames go up on the sample wall, <Len inches={ABOVE_SOFA} /> above
            the sofa.
          </li>
          <li>
            Tap a frame to change its size, or drag it somewhere else. Set the gap between frames;{" "}
            <Spacing /> suits most walls.
          </li>
          <li>
            For your own wall, take a photo and mark one thing you know the size of: a door, the
            wall, the sofa, the bed, a Letter or A4 sheet, or a credit card.
          </li>
          <li>
            Turn a frame over and measure the drop from its top edge to the wire or hanger. Type it
            in, and every nail gets a number and a position.
          </li>
          <li>
            Mark the group&apos;s top-left corner on the wall, then measure each nail from that
            mark.
          </li>
        </ol>
      </Section>

      <Section title="Gallery wall templates">
        <p className="max-w-prose">
          Each template uses standard frame sizes, so you can buy the frames off the shelf.
        </p>
        {/* {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-template-table-lists-each-templates-size-on-the-wall} */}
        <div className="max-w-[760px]">
          <SizeTable
            title="Gallery wall layout with sizes"
            meta={
              <U
                in={`With a ${MOULDING} in moulding and a ${GALLERY_GAP} in gap`}
                cm={`With a ${toCm(MOULDING)} cm moulding and an ${toWholeCm(GALLERY_GAP)} cm gap`}
              />
            }
            selectable={false}
            columns={[
              { label: "Template" },
              { label: "Frames" },
              { label: "On the wall", num: true },
              { label: "Furniture it suits", num: true },
            ]}
            rows={templateTable().map((t) => ({
              id: t.id,
              label: t.name,
              cells: [
                TEMPLATE_FRAMES[t.id] ?? "",
                <Dims key="wall" w={t.w} h={t.h} />,
                <U
                  key="fits"
                  in={`about ${writeNumber(Math.round(t.fits), "in")} in wide`}
                  cm={`about ${writeNumber(t.fits, "cm")} cm wide`}
                />,
              ],
            }))}
          />
        </div>
        <p className="max-w-prose">
          The last column follows the two-thirds rule below. The{" "}
          <PageLink id="F1">frame size chart</PageLink> lists every size in inches and cm.
        </p>
      </Section>

      <Section title="Spacing and height">
        <div className="wp-rules">
          <Rule label="Gap" value={<Spacing />}>
            Keep one gap between all frames. With much wider gaps the frames stop reading as one
            group.
          </Rule>
          <Rule
            label="Height"
            value={
              <>
                <U in={`${ABOVE_SOFA} in`} cm={`${toWholeCm(ABOVE_SOFA)} cm`} /> above the sofa
              </>
            }
          >
            Over a sofa or a bed, leave <Above /> between it and the lowest frame. On an open wall,
            put the group&apos;s centre <Len inches={CENTRE_LINE} /> from the floor.
            <IfLive page="G3">
              {" "}
              The <PageLink id="G3">hanging height calculator</PageLink> works it out for a single
              frame.
            </IfLive>
          </Rule>
          <Rule label="Width" value="⅔ of the furniture">
            A group about two-thirds as wide as the sofa below it looks balanced. Over an{" "}
            <Len inches={SOFA.width} /> sofa, that&apos;s about <Len inches={TWO_THIRDS} />.
          </Rule>
        </div>
      </Section>

      <Section title="Questions about gallery wall layouts">
        <FAQ items={QUESTIONS} />
      </Section>

      <RelatedTools current="G1" outside={["F1", "F2"]} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd(G1)) }}
      />
    </div>
  );
}
