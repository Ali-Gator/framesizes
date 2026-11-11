import { pageMetadata, siteJsonLd } from "@/lib/seo";
import { livePage } from "@/lib/site-map";

const HOME = livePage("F1");

export const metadata = pageMetadata(HOME);

/**
 * The home page. Its body stays a placeholder until t2-frame-size-chart.
 * {@link openspec/specs/seo-base/spec.md#requirement-a-page-has-one-h1-taken-from-its-site-map-entry}
 */
export default function Home() {
  return (
    <div className="mx-auto max-w-content px-4 pt-8 md:px-8 md:pt-16">
      <h1 className="display md:display-xl">{HOME.seo.h1}</h1>
      <p className="mt-4 body-lg max-w-prose text-ink-muted">
        The frame size chart is coming soon.
      </p>
      <script
        type="application/ld+json"
        // `<` escaped so the JSON can never close the script element.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
