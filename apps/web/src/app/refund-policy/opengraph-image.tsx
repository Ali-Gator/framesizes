import { companyOgImage } from "@/components/company/og-image";

// The page's h1 (the guide's alt for the company pages).
export const alt = "Refund Policy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** {@link openspec/specs/company-pages/spec.md#requirement-each-company-page-has-its-own-social-image} */
export default function Image() {
  return companyOgImage("A5");
}
