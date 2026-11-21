import { CompanyPage, Section } from "@/components/company/company-page";
import { COMPANY } from "@/lib/company";
import { pageMetadata } from "@/lib/seo";
import { livePage } from "@/lib/site-map";

export const metadata = pageMetadata(livePage("A5"));

const MAILTO = `mailto:${COMPANY.email}`;

/**
 * A5: nothing is charged; a future paid feature gets a 14-day full refund, no reason needed.
 * {@link openspec/specs/company-pages/spec.md#requirement-the-refund-policy-covers-a-free-product-and-a-future-paid-feature}
 */
export default function RefundPolicyPage() {
  return (
    <CompanyPage
      id="A5"
      updated
      lead={
        <p className="max-w-prose md:body-lg">
          Frame Sizes and the Gallery Wall Layout Generator extension are free. We charge nothing,
          so there is nothing to refund.
        </p>
      }
    >
      <Section title="If someone charged you">
        <p>
          Anyone who asks you to pay for Frame Sizes or the extension is not us. The only official
          sources are framesizes.app and the extension&apos;s page in the Chrome Web Store. If you
          paid someone, ask your bank or card issuer about a chargeback, and tell us at{" "}
          <a href={MAILTO}>{COMPANY.email}</a>.
        </p>
      </Section>

      <Section title="If we add a paid feature">
        <p>
          If we ever add a paid feature, you get a full refund within 14 days of purchase, for any
          reason. Email <a href={MAILTO}>{COMPANY.email}</a> with the email address you paid with,
          and we will refund the full amount to the way you paid.
        </p>
      </Section>
    </CompanyPage>
  );
}
