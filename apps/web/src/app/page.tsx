import { FrameChart } from "@/components/frame-chart/frame-chart";
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
    <div className="page">
      <h1 className="display md:display-xl">{HOME.seo.h1}</h1>
      <div className="mt-12">
        <FrameChart footer={null} />
      </div>
      <script
        type="application/ld+json"
        // `<` escaped so the JSON can never close the script element.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
