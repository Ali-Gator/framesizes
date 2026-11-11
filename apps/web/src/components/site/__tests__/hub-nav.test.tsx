// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";

import { navHubs } from "@/lib/site-map";

import { HubNav } from "../hub-nav";
import { withLive } from "./fixtures";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** {@link openspec/specs/site-shell/spec.md#scenario-the-visitor-opens-and-closes-the-menu} */
it("toggles aria-expanded on each press", async () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  await act(() => root.render(<HubNav links={navHubs(withLive("F1", "P1"))} />));
  const button = container.querySelector("button");
  if (!button) throw new Error("no menu button");
  expect(button.getAttribute("aria-expanded")).toBe("false");
  await act(() => button.click());
  expect(button.getAttribute("aria-expanded")).toBe("true");
  await act(() => button.click());
  expect(button.getAttribute("aria-expanded")).toBe("false");
  act(() => root.unmount());
});
