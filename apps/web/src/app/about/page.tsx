import { CHECK } from "@framesizes/sizes";

import { CompanyPage, Section } from "@/components/company/company-page";
import { PageLink } from "@/components/site/page-link";
import { addressLine, COMPANY } from "@/lib/company";
import { EDGE_EXTENSION_ID, STORE_URL, STORES } from "@/lib/extension";
import { pageMetadata } from "@/lib/seo";
import { livePage } from "@/lib/site-map";

export const metadata = pageMetadata(livePage("A1"));

const names = CHECK.sources.map((s) => s.name);
const SOURCES = `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
const CHECKED = new Date(`${CHECK.date}T00:00:00Z`).toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * A1: who runs Frame Sizes and how its sizes are checked.
 * {@link openspec/specs/company-pages/spec.md#requirement-the-five-company-pages-exist-at-their-own-urls}
 * {@link openspec/specs/company-pages/spec.md#scenario-the-about-and-contact-pages-show-the-same-details}
 */
export default function AboutPage() {
  return (
    <CompanyPage
      id="A1"
      schema="AboutPage"
      lead={
        <p className="max-w-prose md:body-lg">
          Frame Sizes is a free set of tools that show frames, posters and prints at their real
          size, on a real wall, before you buy or hang anything.
        </p>
      }
    >
      <Section title="What you can do here">
        <p>
          Each page answers one question with one tool. The{" "}
          <PageLink id="F1">frame size chart</PageLink> lists every standard picture frame size and
          shows it next to a sofa, a door or a person.{" "}
          <PageLink id="F2">Frame sizes on your wall</PageLink> puts those sizes on a photo of your
          own wall. The <PageLink id="G1">gallery wall planner</PageLink> lays out a group of frames
          and gives you the measurements and nail positions.
        </p>
      </Section>

      <Section title="How we check sizes">
        <p>
          The frame sizes are the common US ready-made sizes, checked against {SOURCES} (last
          checked {CHECKED}). Every size is nominal: it names the print the frame is made for, such
          as 8x10 inches, and we show it in inches and centimetres. Frames vary a little between
          makers, so measure your frame&apos;s opening before you order a print.
        </p>
        <p>
          The drawings are to scale. When a size or a drawing is wrong, tell us and we will fix it.
        </p>
      </Section>

      <Section title="The browser extension">
        <p>
          The Gallery Wall Layout Generator extension plans a gallery wall in your browser&apos;s
          side panel. Get it from the <a href={STORE_URL}>Chrome Web Store</a> or from{" "}
          <a href={STORES.edge.pageUrl(EDGE_EXTENSION_ID)}>Microsoft Edge Add-ons</a>. On a shop
          page, right-click a print and choose &ldquo;Try on my wall&rdquo; to see it on your wall
          at its real size. Your wall stays on your computer.
        </p>
      </Section>

      <Section title="Free to use">
        <p>
          The site and the extension are free and need no account. We do not sell frames or prints,
          and we are not tied to any retailer.
        </p>
      </Section>

      <Section title="Who runs Frame Sizes">
        <p>
          Frame Sizes is run by {COMPANY.legalName}, {addressLine()}.
        </p>
        <p>
          Email us at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>, or see the{" "}
          <PageLink id="A2">contact page</PageLink> for what to include.
        </p>
      </Section>
    </CompanyPage>
  );
}
