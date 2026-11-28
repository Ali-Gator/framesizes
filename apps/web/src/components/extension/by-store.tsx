import type { ReactNode } from "react";

import type { SiteStore } from "./store";

/**
 * One store-dependent spot: each built store's variant side by side, and CSS on `<html
 * data-ext-store>` hides the others (extension.css, widgets.css). Equal variants, an `edge` of
 * `undefined`, or Edge not in `stores` render `chrome` once with no class. An `edge` of `null`
 * means Edge shows nothing here. Variants never carry an id: ids stay on the shared parent.
 * {@link openspec/specs/extension-site/spec.md#requirement-each-stores-lines-sit-in-the-html-once}
 */
export function ByStore({
  chrome,
  edge,
  stores,
  as: Tag = "span",
}: {
  chrome: ReactNode;
  edge?: ReactNode;
  stores: readonly SiteStore[];
  as?: "span" | "div";
}) {
  if (edge === undefined || edge === chrome || !stores.includes("edge")) return <>{chrome}</>;
  return (
    <>
      <Tag className="st-chrome">{chrome}</Tag>
      {edge !== null && <Tag className="st-edge">{edge}</Tag>}
    </>
  );
}
