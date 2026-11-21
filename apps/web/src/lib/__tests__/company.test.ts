import { describe, expect, it } from "vitest";

import { addressLine, COMPANY } from "../company";
import { livePage } from "../site-map";

/** {@link openspec/specs/company-pages/spec.md#requirement-the-company-details-are-declared-once} */
describe("COMPANY", () => {
  it("holds the operator's brand, legal name, email and country", () => {
    expect(COMPANY.brand).toBe("Frame Sizes");
    expect(COMPANY.legalName).toBe("Soft Divisions Limited");
    expect(COMPANY.email).toBe("care@framesizes.app");
    expect(COMPANY.address.countryCode).toBe("HK");
  });

  it("reads as one address line", () => {
    expect(addressLine()).toBe("B, G/F, 322 Shanghai Street, Yau Ma Tei, Kowloon, Hong Kong");
  });
});

/** {@link openspec/specs/company-pages/spec.md#requirement-the-company-details-are-declared-once} */
describe("the company pages' descriptions", () => {
  it("name the operator and the email exactly as COMPANY holds them", () => {
    expect(livePage("A1").seo.description).toContain(COMPANY.legalName);
    expect(livePage("A2").seo.description).toContain(COMPANY.email);
  });
});
