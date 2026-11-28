import { DOOR, toWholeCm } from "@framesizes/sizes";
import type { CSSProperties, ReactNode } from "react";

import { RelatedTools } from "@/components/frame-chart/related-tools";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FAQ } from "@/components/ui/faq";
import { U } from "@/components/ui/u";
import { EDGE_EXTENSION_ID, EXTENSION_ID } from "@/lib/extension";
import { DEFAULT_LOCALE, localeByCode, localizedPath } from "@/lib/locales";
import { breadcrumbJsonLd, breadcrumbTrail, jsonLdScript } from "@/lib/seo";
import { builtPage } from "@/lib/site-map";

import { ByStore } from "./by-store";
import type { ExtensionCopy } from "./copy/en";
import { LayoutFigure, MenuFigure, NailFigure } from "./figures";
import { MODE_SCRIPT } from "./mode";
import { ModeSwitch } from "./mode-switch";
import { PinPicture } from "./pin-picture";
import { storeScript } from "./store";
import { StoreLink } from "./store-link";

const X1 = builtPage("X1");

/** X1 builds both stores: Edge's how-to needs no store id. */
const BUILT = ["chrome", "edge"] as const;

/** The extension's own words, shown in English in every language, and the door height. */
const RICH = /(Gallery Wall Layout Generator|Try on my wall|\{door\})/;

/**
 * A sentence with the extension's English words marked `lang="en"` and `{door}` filled in.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-extensions-own-words-stay-in-english}
 */
function rich(text: string): ReactNode {
  const parts = text.split(RICH);
  if (parts.length === 1) return text;
  // Odd indexes are the matches.
  return parts.map((part, i) =>
    i % 2 === 0 ? (
      part || null
    ) : part === "{door}" ? (
      <U key={i} in={`${DOOR.height} in`} cm={`${toWholeCm(DOOR.height)} cm`} />
    ) : (
      <span key={i} lang="en">
        {part}
      </span>
    ),
  );
}

/** The system stack for scripts Schibsted Grotesk lacks; one face per sentence. */
const SYSTEM_FONT = {
  "--font-sans": "system-ui, sans-serif",
  fontFamily: "var(--font-sans)",
} as CSSProperties;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="h2">{title}</h2>
      {children}
    </section>
  );
}

/**
 * X1's body in one language: the English route and every `[locale]` route render it. Usage mode is
 * the server HTML; pin mode comes from `?pinned=0` or `#pin` (mode.ts).
 * {@link openspec/specs/extension-site/spec.md#requirement-the-extension-pages-server-html-is-the-how-to}
 * {@link openspec/specs/extension-site/spec.md#requirement-the-page-shows-one-mode-at-a-time}
 * {@link openspec/specs/extension-site/spec.md#requirement-each-mode-links-to-the-other}
 * {@link openspec/specs/extension-site/spec.md#requirement-the-page-says-what-the-extension-can-see}
 * {@link openspec/specs/extension-site/spec.md#requirement-the-extension-page-exists-in-every-site-language}
 * {@link openspec/specs/localization/spec.md#requirement-a-language-version-marks-its-own-language}
 * {@link openspec/specs/extension-site/spec.md#requirement-each-stores-lines-sit-in-the-html-once}
 * {@link openspec/specs/extension-site/spec.md#requirement-edge-visitors-get-edges-how-to}
 */
export function ExtensionHowTo({ copy, locale }: { copy: ExtensionCopy; locale: string }) {
  const lang = localeByCode(locale);
  if (!lang) throw new Error(`Unknown locale ${locale}`);
  // {@link openspec/specs/extension-site/spec.md#requirement-a-translated-versions-breadcrumbs-are-translated}
  const trail = breadcrumbTrail(X1);
  const crumbs = trail.map((crumb, i) => ({
    // The last crumb is the version itself, so its `BreadcrumbList` item is its own canonical URL.
    path: i === trail.length - 1 ? localizedPath(locale, crumb.path) : crumb.path,
    name: i === 0 ? copy.crumbs.home : i === trail.length - 1 ? copy.crumbs.page : copy.crumbs.hub,
  }));
  const [plan, shop, nails] = copy.steps;
  const figures = [
    <LayoutFigure key="plan" label={plan?.figure ?? ""} />,
    <ByStore
      key="shop"
      as="div"
      stores={BUILT}
      chrome={
        <MenuFigure
          label={shop?.figure ?? ""}
          menu={{ copyImage: copy.chrome.copyImage, inspect: copy.chrome.inspect }}
          dir={lang.dir}
        />
      }
      edge={<MenuFigure label={shop?.figure ?? ""} store="edge" dir={lang.dir} />}
    />,
    <NailFigure key="nails" label={nails?.figure ?? ""} />,
  ];
  return (
    <div
      className="page flex flex-col gap-12"
      lang={lang.hreflang}
      dir={lang.dir}
      style={lang.font === "system" ? SYSTEM_FONT : undefined}
    >
      <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: storeScript(true) }} />
      <ModeSwitch extensionId={EXTENSION_ID} edgeId={EDGE_EXTENSION_ID} />
      <div className="flex flex-col gap-3">
        <Breadcrumbs items={crumbs.map((crumb) => ({ href: crumb.path, label: crumb.name }))} />
        <h1 className="display md:display-xl">{rich(copy.seo.h1)}</h1>
        {/* {@link openspec/specs/extension-site/spec.md#scenario-the-answer-paragraph} */}
        <p className="max-w-prose md:body-lg">
          <ByStore stores={BUILT} chrome={rich(copy.answer)} edge={rich(copy.edge.answer)} />
        </p>
        <StoreLink label={copy.store} edgeLabel={copy.edge.store} />
        <p className="ext-usage small text-ink-muted">
          {`${copy.noButton} `}
          <a href="#pin">{copy.showPin}</a>
        </p>
      </div>

      <section id="pin" className="ext-pin">
        <h2 className="h2" tabIndex={-1}>
          {copy.pin.title}
        </h2>
        <p className="max-w-prose">
          <ByStore stores={BUILT} chrome={rich(copy.pin.text)} edge={rich(copy.edge.pin.text)} />
        </p>
        <ByStore
          as="div"
          stores={BUILT}
          chrome={<PinPicture label={copy.pin.picture} chrome={copy.chrome} dir={lang.dir} />}
          edge={<PinPicture label={copy.edge.pin.picture} dir={lang.dir} store="edge" />}
        />
        <p>
          {`${copy.pin.pinned} `}
          <a href="#usage">{copy.pin.showUsage}</a>
        </p>
      </section>

      <div id="usage" className="ext-usage flex flex-col gap-12">
        <section className="flex flex-col gap-4">
          <h2 className="h2" tabIndex={-1}>
            {copy.usage}
          </h2>
          <div className="ext-steps">
            {copy.steps.map((step, i) => (
              <div key={step.title} className="ext-step">
                {figures[i]}
                <h3 className="h3">{step.title}</h3>
                <p>{rich(step.text)}</p>
              </div>
            ))}
          </div>
        </section>

        <Section title={copy.wall.title}>
          <p className="max-w-prose">{rich(copy.wall.text)}</p>
          <ul className="ext-list">
            {copy.wall.items.map((item) => (
              <li key={item}>{rich(item)}</li>
            ))}
          </ul>
        </Section>

        {/* {@link openspec/specs/extension-site/spec.md#scenario-the-framesizesapp-row} */}
        <Section title={copy.perm.title}>
          <dl className="ext-perm">
            {copy.perm.rows.map((row) => [
              <dt key={`t-${row.dt}`}>{row.dt}</dt>,
              <dd key={`d-${row.dt}`}>{rich(row.dd)}</dd>,
            ])}
          </dl>
          <p className="ext-tip">{copy.perm.tip}</p>
        </Section>

        <Section title={copy.faq.title}>
          <FAQ
            items={copy.faq.items.map((item, i) => ({
              q: item.q,
              // The second question, about the toolbar button, names the picked browser.
              a: (
                <p>
                  {i === 1 ? (
                    <ByStore
                      stores={BUILT}
                      chrome={rich(item.a)}
                      edge={rich(copy.edge.faqButton)}
                    />
                  ) : (
                    rich(item.a)
                  )}
                </p>
              ),
            }))}
          />
        </Section>

        {/* Every page Related tools links to is English only. */}
        {/* {@link openspec/specs/extension-site/spec.md#requirement-a-translated-version-leaves-out-related-tools} */}
        {locale === DEFAULT_LOCALE && <RelatedTools current="X1" outside={["F2"]} />}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd(X1, crumbs)) }}
      />
    </div>
  );
}
