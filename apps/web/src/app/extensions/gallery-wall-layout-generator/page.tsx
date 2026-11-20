import { DOOR, toWholeCm } from "@framesizes/sizes";
import type { ReactNode } from "react";

import { LayoutFigure, MenuFigure, NailFigure } from "@/components/extension/figures";
import { MODE_SCRIPT } from "@/components/extension/mode";
import { ModeSwitch } from "@/components/extension/mode-switch";
import { PinPicture } from "@/components/extension/pin-picture";
import { StoreLink } from "@/components/extension/store-link";
import { RelatedTools } from "@/components/frame-chart/related-tools";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FAQ } from "@/components/ui/faq";
import { U } from "@/components/ui/u";
import { EXTENSION_ID } from "@/lib/extension";
import { breadcrumbJsonLd, breadcrumbTrail, jsonLdScript, pageMetadata } from "@/lib/seo";
import { builtPage } from "@/lib/site-map";

import "./extension.css";

const X1 = builtPage("X1");

export const metadata = pageMetadata(X1);

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
    title: "Plan a gallery wall",
    figure: <LayoutFigure label="Five frames above a sofa in the sample room" />,
    text: "Pick one of five templates, set the gap and move the frames around. The sample room works right away; your own wall photo takes a minute.",
  },
  {
    title: "Try a print from a shop",
    figure: (
      <MenuFigure label="The right-click menu on a shop's print, with Try on my wall picked" />
    ),
    text: "Right-click a print, pick “Try on my wall” and choose the size the shop lists. It hangs on your wall at true size.",
  },
  {
    title: "Get the nail marks",
    figure: <NailFigure label="Five frames with a numbered nail in each" />,
    text: "Type how far the hanger sits below the top of the frame. Every nail gets a number and a spot, measured from one corner.",
  },
];

const QUESTIONS = [
  {
    q: "Does it work on every shop?",
    a: (
      <p>
        On any page with an image you can right-click. If the page lists no size, type the width and
        height yourself.
      </p>
    ),
  },
  {
    q: "Why isn't the button in my toolbar?",
    a: (
      <p>
        Chrome puts new extensions behind the puzzle-piece button. Pin it once and it stays in the
        toolbar.
      </p>
    ),
  },
  {
    q: "Which browsers does it run on?",
    a: <p>Chrome 116 or newer, on a computer. It opens in Chrome&apos;s side panel.</p>,
  },
];

/**
 * X1: the page the Chrome extension opens after install. Usage mode is the server HTML; pin mode
 * comes from `?pinned=0` or `#pin` (components/extension/mode.ts).
 * {@link openspec/specs/extension-site/spec.md#requirement-the-extension-pages-server-html-is-the-how-to}
 * {@link openspec/specs/extension-site/spec.md#requirement-the-page-shows-one-mode-at-a-time}
 * {@link openspec/specs/extension-site/spec.md#requirement-each-mode-links-to-the-other}
 * {@link openspec/specs/extension-site/spec.md#requirement-the-page-says-what-the-extension-can-see}
 */
export default function ExtensionPage() {
  return (
    <div className="page flex flex-col gap-12">
      <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
      <ModeSwitch extensionId={EXTENSION_ID} />
      <div className="flex flex-col gap-3">
        <Breadcrumbs
          items={breadcrumbTrail(X1).map((crumb) => ({ href: crumb.path, label: crumb.name }))}
        />
        <h1 className="display md:display-xl">{X1.seo.h1}</h1>
        {/* {@link openspec/specs/extension-site/spec.md#scenario-the-answer-paragraph} */}
        <p className="max-w-prose md:body-lg">
          Click the extension&apos;s button in Chrome&apos;s toolbar to open the side panel and plan
          a gallery wall. On any shop, right-click a print and pick “Try on my wall” to hang it on
          your wall at true size.
        </p>
        <StoreLink />
        <p className="ext-usage small text-ink-muted">
          Don&apos;t see the button? <a href="#pin">Show how to pin it</a>
        </p>
      </div>

      <section id="pin" className="ext-pin">
        <h2 className="h2" tabIndex={-1}>
          Pin it to your toolbar
        </h2>
        <p className="max-w-prose">
          Chrome keeps new extensions behind the puzzle-piece button. Click the puzzle piece (1) at
          the top right of Chrome, then the pin (2) next to Gallery Wall Layout Generator. Its
          button then stays in the toolbar.
        </p>
        <PinPicture />
        <p>
          Already pinned? <a href="#usage">See how to use it</a>
        </p>
      </section>

      <div id="usage" className="ext-usage flex flex-col gap-12">
        <section className="flex flex-col gap-4">
          <h2 className="h2" tabIndex={-1}>
            What you can do in the side panel
          </h2>
          <div className="ext-steps">
            {STEPS.map((step) => (
              <div key={step.title} className="ext-step">
                {step.figure}
                <h3 className="h3">{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <Section title="Use your own wall">
          <p className="max-w-prose">
            Take a photo of the wall straight on, then mark one thing you know the size of. The
            panel scales everything from it:
          </p>
          <ul className="ext-list">
            <li>the wall&apos;s width</li>
            <li>
              a door (
              <U in={`${DOOR.height} in`} cm={`${toWholeCm(DOOR.height)} cm`} /> tall in the US)
            </li>
            <li>a sofa or a bed you&apos;ve measured</li>
            <li>a Letter or A4 sheet taped to the wall</li>
            <li>a credit card</li>
          </ul>
        </Section>

        {/* {@link openspec/specs/extension-site/spec.md#scenario-the-framesizesapp-row} */}
        <Section title="What the extension can see">
          <dl className="ext-perm">
            <dt>Right-click menu</dt>
            <dd>Adds “Try on my wall” when you right-click an image.</dd>
            <dt>The tab you click in</dt>
            <dd>
              It reads that page once, when you pick “Try on my wall”: the image and any sizes in
              its text. Nothing else on that site.
            </dd>
            <dt>framesizes.app</dt>
            <dd>Can ask whether the extension is installed and pinned. Nothing else is shared.</dd>
          </dl>
          <p className="ext-tip">Your wall photo stays on this computer.</p>
        </Section>

        <Section title="Questions">
          <FAQ items={QUESTIONS} />
        </Section>

        <RelatedTools current="X1" outside={["F2"]} />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd(X1)) }}
      />
    </div>
  );
}
