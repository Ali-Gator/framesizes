/**
 * Who runs framesizes.app, declared once: the footer, the company pages and the JSON-LD read it.
 * {@link openspec/specs/company-pages/spec.md#requirement-the-company-details-are-declared-once}
 */
export const COMPANY = {
  brand: "Frame Sizes",
  legalName: "Soft Divisions Limited",
  email: "care@framesizes.app",
  address: {
    street: "B, G/F, 322 Shanghai Street",
    locality: "Yau Ma Tei",
    region: "Kowloon",
    country: "Hong Kong",
    countryCode: "HK",
  },
} as const;

/** The postal address on one line, comma-joined. */
export function addressLine(): string {
  const { street, locality, region, country } = COMPANY.address;
  return [street, locality, region, country].join(", ");
}
