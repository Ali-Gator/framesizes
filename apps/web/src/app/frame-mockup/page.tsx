import {
  ABOVE_SOFA,
  CATALOG,
  CENTRE_LINE,
  EXPORT_LONG_SIDE,
  feetAndInches,
  findFrame,
  framesFor,
  hangMockup,
  MAT_WIDTH,
  mockupView,
  POSTERS,
  type Size,
  toWholeCm,
} from "@framesizes/sizes";
import type { ReactNode } from "react";

import { RelatedTools } from "@/components/frame-chart/related-tools";
import { dims, len, pngSize } from "@/components/frame-mockup/copy";
import { FrameMockup } from "@/components/frame-mockup/frame-mockup";
import { MockupPicture } from "@/components/frame-mockup/mockup-picture";
import { scene, WALL } from "@/components/frame-mockup/scene";
import { INITIAL, type State } from "@/components/frame-mockup/state";
import { IfLive, PageLink } from "@/components/site/page-link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FAQ } from "@/components/ui/faq";
import { SizeTable } from "@/components/ui/size-table";
import { U } from "@/components/ui/u";
import { breadcrumbJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";
import { livePage } from "@/lib/site-map";

import "../frame-mat-calculator/frame-mat.css";
import "./frame-mockup.css";

const F7 = livePage("F7");

export const metadata = pageMetadata(F7);

// Every number below comes from the engine: the steps, the table, the cards and the questions.

/** A length in both units. */
const L = ({ inches }: { inches: number }) => <U in={len(inches, "in")} cm={len(inches, "cm")} />;
/** A size in both units. */
const S = ({ size }: { size: Size }) => (
  <span className="font-mono">
    <U in={dims(size, "in")} cm={dims(size, "cm")} />
  </span>
);
/** A whole-centimetre length for a rounded measure in a sentence: `57 in` / `145 cm`. */
const Round = ({ inches }: { inches: number }) => (
  <U in={`${inches} in`} cm={`${toWholeCm(inches)} cm`} />
);
const px = (n: number) => n.toLocaleString("en-US");
const and = (ids: readonly string[]) =>
  ids.length > 1 ? `${ids.slice(0, -1).join(", ")} and ${ids.at(-1)}` : (ids[0] ?? "");

/** The shape table: catalog sizes grouped by reduced ratio, groups of two or more, plus A-series. */
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const ratioOf = ({ w, h }: Size) => {
  const [a, b] = [Math.round(w * 2), Math.round(h * 2)];
  const g = gcd(a, b);
  return `${a / g}:${b / g}`;
};
const GROUPS = new Map<string, string[]>();
for (const f of CATALOG) GROUPS.set(ratioOf(f), [...(GROUPS.get(ratioOf(f)) ?? []), f.id]);
const group = (ratio: string) => GROUPS.get(ratio) ?? [];
const A_IDS = POSTERS.filter((p) => p.group === "a-series").map((p) => p.id);
const SHAPES = [
  { shape: "2:3", sizes: group("2:3") },
  { shape: "3:4", sizes: group("3:4") },
  { shape: "4:5", sizes: group("4:5") },
  { shape: "A-series, 1:1.41", sizes: A_IDS },
  { shape: "Square, 1:1", sizes: group("1:1") },
];
// The copy names these shapes; a catalog change that adds or drops a shared shape must change it.
const shared = [...GROUPS].filter(([, ids]) => ids.length > 1).map(([r]) => r);
if (shared.sort().join() !== ["1:1", "2:3", "3:4", "4:5"].join())
  throw new Error(`shared frame shapes changed: ${shared.join(", ")}`);

/** A static mockup for a keyword section. */
type Shot = Pick<State, "art" | "size" | "mat" | "focus" | "placement" | "view" | "finish">;
const shot = (patch: Partial<Shot>): Shot => ({ ...INITIAL, ...patch });
const PHOTO = { url: "/frame-mockup/photo.svg", width: 2000, height: 3000, sample: false };
const LANDSCAPE = { url: "/frame-mockup/landscape.svg", width: 3000, height: 2000, sample: false };
const CLOSE = shot({ view: "close" });
const PORTRAIT_PHOTO = shot({
  art: PHOTO,
  size: "8x10",
  mat: true,
  finish: "oak",
  placement: "plain",
  view: "close",
});
const WALL_ART = shot({ art: LANDSCAPE, size: "36x24", finish: "walnut" });

function Picture({ s, alt }: { s: Shot; alt: string }) {
  return <MockupPicture scene={scene(s)} finish={s.finish} src={s.art.url} label={alt} />;
}

const CLOSE_WALL = mockupView(hangMockup({ w: 24, h: 36 }, "sofa"), "close");
const preCut = (id: string) => {
  const mat = findFrame(id)?.mat;
  if (!mat) throw new Error(`${id} is not sold with a mat`);
  return `${mat.w}x${mat.h}`;
};
const RECTANGLES = CATALOG.filter((f) => f.orientation !== "square");
const FIRST = RECTANGLES[0];
const LAST = RECTANGLES.at(-1);
if (!FIRST || !LAST) throw new Error("the catalog has no rectangles");
const SQUARES = framesFor("square").map((f) => f.id);
const WHOLE_PNG = pngSize(INITIAL);
const CLOSE_PNG = pngSize(CLOSE);
const WALL_FT = `${feetAndInches(WALL.w).replace(" ft", "")} × ${feetAndInches(WALL.h)}`;
const WALL_CM = `${toWholeCm(WALL.w)} × ${toWholeCm(WALL.h)} cm`;

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
    t: "Upload your artwork",
    p: "Choose a JPEG or PNG, or drop it on the drop area. It opens in your browser and stays on your device. Until you upload, a sample artwork is in the frame.",
  },
  {
    t: "Pick a frame size",
    p: "Each size shows how much of your artwork it cuts. The mockup opens on the size that cuts least.",
  },
  {
    t: "Pick a style and a mat",
    p: (
      <>
        Black, white, light oak or walnut. With a mat, a frame sold with a pre-cut mat uses it; any
        other frame gets a <L inches={MAT_WIDTH} /> mat.
      </>
    ),
  },
  {
    t: "Pick a wall",
    p: "Above the sofa or a plain wall, as the whole wall or a close-up. Drag the artwork to choose which part the frame cuts.",
  },
  {
    t: "Download the PNG",
    p: `The PNG saves the view on screen, ${px(EXPORT_LONG_SIDE)} px on its longer side. No account and no watermark.`,
  },
] as const;

/** {@link openspec/specs/frame-mockup/spec.md#requirement-the-questions-answer-in-the-server-html} */
const QUESTIONS = [
  {
    q: "Is my artwork uploaded?",
    a: (
      <p>
        No. Your artwork opens in your browser and stays on your device. The PNG is made in your
        browser too, and you need no account.
      </p>
    ),
  },
  {
    q: "Why is part of my artwork cut off?",
    a: (
      <p>
        The artwork fills the frame opening edge to edge and is never stretched. When the frame has
        another shape, part of the artwork is cut, and each size shows how much. Drag the artwork,
        or use the arrow keys, to choose which part.
      </p>
    ),
  },
  {
    q: "What size is the PNG?",
    a: (
      <p>
        {px(EXPORT_LONG_SIDE)} px on its longer side. The whole wall saves as {px(WHOLE_PNG.w)} ×{" "}
        {px(WHOLE_PNG.h)} px; a 24x36 close-up saves as {px(CLOSE_PNG.w)} × {px(CLOSE_PNG.h)} px.
        There is no watermark.
      </p>
    ),
  },
  {
    q: "Can I use the mockup in my shop listing?",
    a: (
      <p>
        The PNG has no watermark, and the room and the frames are drawings made for this site. The
        artwork in it is yours, so you need the rights to show it.
      </p>
    ),
  },
  {
    q: "Which frame sizes can I try?",
    a: (
      <p>
        The standard frame sizes from {FIRST.id} to {LAST.id}, plus {and(A_IDS)}, turned to your
        artwork&apos;s shape. Square artwork gets the {SQUARES.length} square sizes, {SQUARES[0]} to{" "}
        {SQUARES.at(-1)}.
      </p>
    ),
  },
  {
    q: "Can I see it on my own wall?",
    a: (
      <p>
        Yes, on <PageLink id="F2">Frames on your wall</PageLink>. Upload a photo of your wall, set
        the scale with a door or a sheet of paper, and hang any standard frame on it at true size. A{" "}
        <U in={WALL_FT} cm={WALL_CM} /> sample room is there too.
      </p>
    ),
  },
];

/**
 * F7: the poster and frame mockup generator, the how-to, the shape table, the keyword sections
 * and the questions.
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-page-follows-the-tool-outline}
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-page-carries-its-head-values-and-breadcrumbs}
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-page-links-only-to-live-pages}
 */
export default function FrameMockupPage() {
  return (
    <div className="page flex flex-col gap-12">
      {/* {@link openspec/specs/frame-mockup/spec.md#scenario-the-first-screen-on-a-phone} */}
      <div className="flex flex-col gap-4 md:gap-12">
        <div className="flex flex-col gap-3">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: F7.name }]} />
          <h1 className="display tracking-[-0.03em] md:display-xl">{F7.seo.h1}</h1>
          {/* {@link openspec/specs/frame-mockup/spec.md#requirement-the-answer-paragraph-names-the-head-keyword} */}
          <p className="max-w-prose md:body-lg">
            Make a poster mockup: upload a JPEG or PNG, see it framed on a wall at true size, and
            download a PNG. For designers, print sellers and anyone with a print to hang. Your file
            stays on your device.
          </p>
        </div>

        <FrameMockup />
      </div>

      <Section title="How to use the mockup generator">
        <ol className="f5-steps f7-steps">
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

      {/* {@link openspec/specs/frame-mockup/spec.md#requirement-the-shape-table-groups-frame-sizes-by-artwork-shape} */}
      <Section title="Frame sizes by artwork shape">
        <p className="max-w-prose">
          Frame sizes come in a few shapes. Export your design in the shape of the frame you plan to
          use. For any other size, the generator shows how much it cuts.
        </p>
        <div className="f7-shapes">
          <SizeTable
            title="Frame shapes"
            selectable={false}
            columns={[{ label: "Shape" }, { label: "Frame sizes" }]}
            rows={SHAPES.map((r) => ({
              id: r.shape,
              label: r.shape,
              cells: [<span key="s">{r.sizes.join(", ")}</span>],
            }))}
          />
        </div>
        {/* {@link openspec/specs/frame-mockup/spec.md#requirement-the-reference-section-links-only-to-live-print-pages} */}
        <IfLive page="PH2">
          <p className="max-w-prose">
            To pick a print size for your file, see <PageLink id="PH2">Art print sizes</PageLink>.
          </p>
        </IfLive>
        <IfLive page="Q2">
          <p className="max-w-prose">
            To check how sharp it will print, use the <PageLink id="Q2">DPI checker</PageLink>.
          </p>
        </IfLive>
      </Section>

      {/* {@link openspec/specs/frame-mockup/spec.md#requirement-each-secondary-keyword-has-its-own-section-with-a-drawing} */}
      <div className="f7-uses">
        <section className="f7-use">
          <h2 className="h3">Frame mockup: a close-up of the frame</h2>
          <Picture s={CLOSE} alt="A 24x36 black frame with the sample artwork, close-up" />
          <p>
            Pick Close-up to fill the picture with the frame. It shows the frame and a strip of wall
            around it, a quarter of the frame&apos;s longer side on each side. A 24x36 close-up
            covers <S size={CLOSE_WALL} /> of wall.
          </p>
        </section>
        <section className="f7-use">
          <h2 className="h3">Picture frame mockup for a photo</h2>
          <Picture
            s={PORTRAIT_PHOTO}
            alt="An 8x10 light oak frame with a white mat around a portrait photo, close-up"
          />
          <p>
            Small photos look finished with a mat. A 5x7 frame is sold with a mat cut for a{" "}
            {preCut("5x7")} photo, and an 8x10 with one for a {preCut("8x10")}. Switch the mat on to
            see it. The chips show how much of the photo the mat opening cuts.
          </p>
        </section>
        <section className="f7-use">
          <h2 className="h3">Wall art mockup in a room</h2>
          <Picture
            s={WALL_ART}
            alt="A 36x24 walnut frame with a landscape artwork above a sofa, the whole wall"
          />
          <p>
            Whole wall shows the frame at true size on a{" "}
            <span className="font-mono">
              <U in={WALL_FT} cm={WALL_CM} />
            </span>{" "}
            wall: <Round inches={ABOVE_SOFA} /> over a sofa, or centred{" "}
            <Round inches={CENTRE_LINE} /> above the floor on a plain wall. For your own wall, use{" "}
            <PageLink id="F2">Frames on your wall</PageLink>. To plan several frames, use the{" "}
            <PageLink id="G1">Gallery wall planner</PageLink>.
          </p>
        </section>
      </div>

      <Section title="Questions">
        <FAQ items={QUESTIONS} />
      </Section>

      <RelatedTools current="F7" outside={["P1", "G1"]} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd(F7)) }}
      />
    </div>
  );
}
