import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";

import { U } from "../u";

/** {@link openspec/specs/site-shell/spec.md#scenario-dual-unit-text-follows-the-choice} */
it("writes a length in both units, each in its own span", () => {
  expect(renderToStaticMarkup(<U in="8 in" cm="20 cm" />)).toBe(
    '<span class="u-in">8 in</span><span class="u-cm">20 cm</span>',
  );
});
