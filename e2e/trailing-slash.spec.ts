import { expect, test } from "@playwright/test";

/** {@link openspec/specs/seo-base/spec.md#scenario-a-path-with-a-trailing-slash} */
test("a trailing slash redirects once, keeping the query", async ({ request }) => {
  const response = await request.get("/no-such-page/?a=1", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  const location = new URL(response.headers().location ?? "", "http://localhost");
  expect(location.pathname + location.search).toBe("/no-such-page?a=1");
  const next = await request.get(location.pathname + location.search, { maxRedirects: 0 });
  expect(next.status()).not.toBe(308);
  expect(next.status()).not.toBe(307);
});

test("the home page does not redirect", async ({ request }) => {
  expect((await request.get("/", { maxRedirects: 0 })).status()).toBe(200);
});

/** {@link openspec/specs/seo-base/spec.md#requirement-a-trailing-slash-redirects-to-the-clean-path-in-one-hop} */
test("a doubled leading slash never redirects off the site", async ({ request, baseURL }) => {
  const response = await request.get(`${baseURL}//evil.example/`, { maxRedirects: 0 });
  expect(response.headers().location ?? "").not.toMatch(/^\/\/|^https?:\/\/evil/);
});
