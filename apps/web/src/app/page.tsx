import { commonFrames, framesFor, writeSize } from "@framesizes/sizes";
import type { ReactNode } from "react";

import { ChartFooter } from "@/components/frame-chart/chart-footer";
import { CommonSizes } from "@/components/frame-chart/common-sizes";
import { EXAMPLE_FRAME, EXAMPLE_IMAGE, FrameAnatomy } from "@/components/frame-chart/frame-anatomy";
import { FrameChart } from "@/components/frame-chart/frame-chart";
import { Questions } from "@/components/frame-chart/questions";
import { RelatedTools } from "@/components/frame-chart/related-tools";
import { IfLive, PageLink } from "@/components/site/page-link";
import { pageMetadata, siteJsonLd } from "@/lib/seo";
import { livePage } from "@/lib/site-map";

const HOME = livePage("F1");

export const metadata = pageMetadata(HOME);

/** A size in a sentence: the search form, in mono. */
function Size({ children }: { children: string }) {
  return <span className="font-mono font-medium">{children}</span>;
}

/** "a, b, c and d" in mono, the separators in the text face. */
function SizeList({ ids }: { ids: readonly string[] }) {
  return ids.map((id, i) => (
    <span key={id}>
      {i === 0 ? "" : i === ids.length - 1 ? " and " : ", "}
      <Size>{id}</Size>
    </span>
  ));
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="h2">{title}</h2>
      {children}
    </section>
  );
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="h3">{title}</h3>
      <p>{children}</p>
    </div>
  );
}

const ids = (frames: readonly { id: string }[]) => frames.map((f) => f.id);
const RECTANGULAR = framesFor("portrait");
/** The large sizes: 20 in wide and up. */
const LARGE = ids(RECTANGULAR.filter((f) => f.w >= 20));
const LARGEST = RECTANGULAR.at(-1)?.id ?? "";
const POSTER = RECTANGULAR.find((f) => f.use === "Large posters")?.id ?? "";
const IMAGE = writeSize(EXAMPLE_IMAGE, "search");
const FRAME = writeSize(EXAMPLE_FRAME, "search");
const TURNED = writeSize({ w: EXAMPLE_IMAGE.h, h: EXAMPLE_IMAGE.w }, "search");

/**
 * The home page: the standard frame size chart.
 * {@link openspec/specs/frame-size-chart/spec.md#requirement-the-page-follows-the-approved-outline}
 */
export default function Home() {
  const common = ids(commonFrames());
  return (
    <div className="page flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <h1 className="display md:display-xl">{HOME.seo.h1}</h1>
        {/* {@link openspec/specs/frame-size-chart/spec.md#requirement-the-first-paragraph-answers-with-the-six-common-sizes} */}
        <p className="body-lg max-w-prose">
          The standard frame sizes are <SizeList ids={common} /> inches. The chart lists every
          common size in inches and cm. Pick one to see it at true scale on a wall.
        </p>
      </div>

      <FrameChart footer={<ChartFooter />} />

      <Section title="The six most common frame sizes">
        <p className="-mt-4 max-w-prose">
          Most ready-made picture and photo frames come in these six sizes, shown here to the same
          scale.
        </p>
        <CommonSizes />
      </Section>

      <Section title="Frame size by image size">
        <div className="-mt-4 flex max-w-prose flex-col gap-2">
          <p>
            Without a mat, the frame size is the image size: an <Size>{IMAGE}</Size> photo fits an{" "}
            <Size>{IMAGE}</Size> frame. With a mat (a mount in the UK), take a frame one or two
            sizes larger. The chart&apos;s &ldquo;Image with a mat&rdquo; column gives the usual
            pairing.
            <IfLive page="F5">
              {" "}
              The <PageLink id="F5">frame and mat size calculator</PageLink> works out any other.
            </IfLive>
          </p>
          <p>
            A framed photo has four measurements. This example is an <Size>{IMAGE}</Size> photo with
            a mat in an <Size>{FRAME}</Size> frame.
          </p>
        </div>
        <FrameAnatomy />
      </Section>

      <Section title="Large, square and horizontal frame sizes">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8">
          <Column title="Large frame sizes">
            The common large frames are <SizeList ids={LARGE} /> inches. <Size>{POSTER}</Size> is
            the standard large poster, <Size>{LARGEST}</Size> the movie poster.
            <IfLive page="P1">
              {" "}
              See all <PageLink id="P1">poster sizes</PageLink>.
            </IfLive>
          </Column>
          <Column title="Square frame sizes">
            Square frames come in <SizeList ids={ids(framesFor("square"))} /> inches. Choose Square
            in the chart to compare them.
          </Column>
          <Column title="Horizontal frame sizes">
            A horizontal, or landscape, frame is the same frame turned on its side: an{" "}
            <Size>{IMAGE}</Size> becomes a <Size>{TURNED}</Size>. Check that the hanger on the back
            works both ways.
          </Column>
        </div>
      </Section>

      <Section title="How to choose a frame size">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8">
          <Column title="Start from the image">
            Measure the photo or print first. Without a mat, buy a frame the same size; with one, go
            one or two sizes up.
          </Column>
          <Column title="Check it against the wall">
            Above a sofa or a bed, a frame about two-thirds as wide as the furniture looks balanced.
            <IfLive page="F2">
              {" "}
              Try <PageLink id="F2">frame sizes on your wall</PageLink> with a photo of your room.
            </IfLive>
          </Column>
          <Column title="Stay with a standard size">
            Ready-made frames, mats and prints come in standard sizes. An odd size needs a custom
            frame, which costs more.
            <IfLive page="PH1">
              {" "}
              Order the print in one of the <PageLink id="PH1">standard photo print sizes</PageLink>
              .
            </IfLive>
          </Column>
        </div>
      </Section>

      <Section title="Frame size questions">
        <Questions />
      </Section>

      <RelatedTools />

      <script
        type="application/ld+json"
        // `<` escaped so the JSON can never close the script element.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
