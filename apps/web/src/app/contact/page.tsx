import { CompanyPage, Section } from "@/components/company/company-page";
import { addressLine, COMPANY } from "@/lib/company";
import { pageMetadata } from "@/lib/seo";
import { livePage } from "@/lib/site-map";

export const metadata = pageMetadata(livePage("A2"));

const MAILTO = `mailto:${COMPANY.email}`;

/**
 * A2: the email and the postal address. No form: the site has no backend.
 * {@link openspec/specs/company-pages/spec.md#requirement-the-contact-page-gives-the-email-and-the-postal-address}
 * {@link openspec/specs/company-pages/spec.md#scenario-the-about-and-contact-pages-show-the-same-details}
 */
export default function ContactPage() {
  return (
    <CompanyPage
      id="A2"
      schema="ContactPage"
      lead={
        <p className="max-w-prose md:body-lg">
          Email us at <a href={MAILTO}>{COMPANY.email}</a> about a wrong size, a bug, the Gallery
          Wall Layout Generator extension or your data.
        </p>
      }
    >
      <Section title="A wrong size or a bug">
        <p>So we can find it quickly, please include:</p>
        <ul className="list-disc pl-6">
          <li>the page address, or the extension if that is where it happened</li>
          <li>the size you expected and the size we showed, in inches or centimetres</li>
          <li>your browser and device, for example Chrome on a Windows laptop</li>
          <li>a screenshot, if you can take one</li>
        </ul>
      </Section>

      <Section title="Privacy requests">
        <p>
          To ask what we hold about you, or to have it corrected or deleted, email{" "}
          <a href={MAILTO}>{COMPANY.email}</a> with &ldquo;Privacy&rdquo; in the subject. Say which
          site or extension you used. We keep no accounts, so we will never ask for a password.
        </p>
      </Section>

      <Section title="Postal address">
        <address className="not-italic">
          {COMPANY.legalName}
          <br />
          {addressLine()}
        </address>
      </Section>
    </CompanyPage>
  );
}
