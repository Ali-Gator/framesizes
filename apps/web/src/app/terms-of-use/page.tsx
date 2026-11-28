import { CompanyPage, Section } from "@/components/company/company-page";
import { PageLink } from "@/components/site/page-link";
import { addressLine, COMPANY } from "@/lib/company";
import { pageMetadata } from "@/lib/seo";
import { livePage } from "@/lib/site-map";

export const metadata = pageMetadata(livePage("A4"));

const MAILTO = `mailto:${COMPANY.email}`;

/**
 * A4: numbered sections; the number is part of each `h2`'s text.
 * {@link openspec/specs/company-pages/spec.md#requirement-the-terms-of-use-name-the-provider-and-the-governing-law}
 */
export default function TermsOfUsePage() {
  const sections = [
    {
      title: "Who provides the service",
      body: (
        <p>
          Frame Sizes (framesizes.app) and the Gallery Wall Layout Generator browser extension are
          provided by {COMPANY.legalName}, {addressLine()} (&ldquo;we&rdquo;). By using the site or
          the extension you agree to these terms. If you do not agree, please do not use them.
        </p>
      ),
    },
    {
      title: "What the service is",
      body: (
        <p>
          Free tools that show frame, poster and print sizes at true scale and help you plan a wall.
          The sizes are nominal: a size names the print a frame is made for, and real frames vary a
          little between makers. Measure your frame, its opening and your wall before you order, cut
          or drill. On-screen and true-scale drawings depend on your screen and are a guide, not a
          measurement.
        </p>
      ),
    },
    {
      title: "Your licence to use it",
      body: (
        <p>
          You may use the site and the extension for your own personal and business planning, free
          of charge. The site&apos;s text, drawings, code, name and logo belong to us. Do not copy
          or republish them as your own, beyond a short quote with a link back.
        </p>
      ),
    },
    {
      title: "Acceptable use",
      body: (
        <p>
          Do not use the service to break the law, to attack or overload the site, to get around its
          limits, or to scrape it at a rate that slows it for others. Do not change the extension to
          harm other people or the sites they visit.
        </p>
      ),
    },
    {
      title: "Shop pages and trade names",
      body: (
        <p>
          The extension reads a shop page only when you ask it to. Pictures and names you bring in
          from a shop belong to that shop or its artists; keep them for your own planning. Shop and
          brand names mentioned on the site belong to their owners and do not mean they endorse us.
        </p>
      ),
    },
    {
      title: "Price",
      body: (
        <p>
          The site and the extension are free. If we ever add a paid feature, we will show its price
          before you pay, and our <PageLink id="A5">refund policy</PageLink> will apply.
        </p>
      ),
    },
    {
      title: "Your photos",
      body: (
        <p>
          Wall photos you add stay on your device; we do not receive them. You need the right to use
          any photo you add. The <PageLink id="A3">privacy policy</PageLink> explains what data we
          handle.
        </p>
      ),
    },
    {
      title: "Feedback",
      body: (
        <p>
          If you send us an idea or a correction, we may use it to improve the service without owing
          you anything for it.
        </p>
      ),
    },
    {
      title: "No warranty",
      body: (
        <p>
          We work to keep every size right, but the service is provided &ldquo;as is&rdquo; and
          &ldquo;as available&rdquo;, without any promise that it is accurate, complete, or free of
          errors or interruptions, to the extent the law allows.
        </p>
      ),
    },
    {
      title: "Limitation of liability",
      body: (
        <p>
          To the extent the law allows, we are not liable for any loss that comes from using the
          service, including a wrong purchase, a print that does not fit, or a hole in the wrong
          place. Nothing in these terms limits liability that the law does not allow us to limit.
        </p>
      ),
    },
    {
      title: "Links to other sites",
      body: (
        <p>
          The site may link to other sites, including shops. We do not control them and are not
          responsible for their content, products or privacy practices.
        </p>
      ),
    },
    {
      title: "Availability and changes",
      body: (
        <p>
          We may change, pause or stop any part of the site or the extension at any time, for
          example to fix a size or improve a tool.
        </p>
      ),
    },
    {
      title: "Ending use",
      body: (
        <p>
          You can stop using the service at any time; remove the extension to delete its saved wall.
          We may block use that breaks these terms.
        </p>
      ),
    },
    {
      title: "Governing law",
      body: (
        <p>
          These terms are governed by the laws of Hong Kong, and the courts of Hong Kong have
          jurisdiction over any dispute. If you use the service as a consumer, you keep the
          protection of the mandatory consumer laws of the country where you live.
        </p>
      ),
    },
    {
      title: "Changes to these terms",
      body: (
        <p>
          We may update these terms. The date at the top shows the latest version, and using the
          service after a change means you accept it.
        </p>
      ),
    },
    {
      title: "Contact",
      body: (
        <p>
          Questions about these terms: <a href={MAILTO}>{COMPANY.email}</a>, or write to{" "}
          {COMPANY.legalName}, {addressLine()}.
        </p>
      ),
    },
  ];
  return (
    <CompanyPage id="A4" updated>
      {sections.map((s, i) => (
        <Section key={s.title} title={`${i + 1}. ${s.title}`}>
          {s.body}
        </Section>
      ))}
    </CompanyPage>
  );
}
