// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it } from "vitest";

import { replaceSearch, useSearch } from "../url-state";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Probe() {
  return <output>{useSearch()}</output>;
}

afterEach(() => window.history.replaceState(null, "", "/"));

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-choice-is-written-to-the-url} */
it("delivers a replaceState write to a subscriber without a history entry", async () => {
  const host = document.createElement("div");
  const root = createRoot(host);
  await act(async () => root.render(<Probe />));
  const length = window.history.length;
  await act(async () => replaceSearch("size=11x14&ref=door"));
  expect(host.textContent).toBe("?size=11x14&ref=door");
  expect(window.location.search).toBe("?size=11x14&ref=door");
  expect(window.history.length).toBe(length);
  await act(async () => replaceSearch(""));
  expect(host.textContent).toBe("");
  expect(window.location.href.endsWith("/")).toBe(true);
  await act(async () => root.unmount());
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-default-state-in-the-server-html} */
it("renders the empty query string on the server", () => {
  window.history.replaceState(null, "", "/?size=10x8");
  expect(renderToString(<Probe />)).toBe("<output></output>");
});
