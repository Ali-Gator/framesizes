"use client";

import { useEffect, useState } from "react";

import { askExtensions, EDGE_EXTENSION_ID, knownIds, STORES } from "@/lib/extension";

import { ByStore } from "./by-store";
import { applyStore, type SiteStore } from "./store";

const C = STORES.chrome.section;
const E = STORES.edge.section;

/**
 * The section's call to action: "Add to Chrome" (or, on a touch phone, the computer line) and the
 * "You have it" line share one grid cell (widgets.css `ext-sec-cta`). The hidden one is
 * `visibility: hidden`, never removed, so the cell keeps the taller line's height when the
 * extension answers that it is installed. Asks every known store id once after hydration, and
 * sets `<html data-ext-store>` from the browser for a client-side visit. Edge's lines are built
 * only with Edge's id.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-section-knows-when-the-extension-is-installed}
 * {@link openspec/specs/extension-site/spec.md#requirement-the-section-tells-phone-visitors-to-use-a-computer}
 */
export function ExtensionStatus({
  extensionId,
  edgeId = EDGE_EXTENSION_ID,
}: {
  extensionId: string;
  edgeId?: string;
}) {
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    let live = true;
    applyStore(false);
    void askExtensions(knownIds(extensionId, edgeId)).then((status) => {
      if (live) setInstalled(status.installed);
    });
    return () => {
      live = false;
    };
  }, [extensionId, edgeId]);
  const stores: SiteStore[] = edgeId ? ["chrome", "edge"] : ["chrome"];
  const add = (href: string, label: string) => (
    <a className="fs-btn fs-btn-primary" href={href} target="_blank" rel="noopener">
      {label}
    </a>
  );
  return (
    <div className="ext-sec-cta">
      <div style={installed ? { visibility: "hidden" } : undefined}>
        <span className="ext-sec-add">
          <ByStore
            stores={stores}
            chrome={add(STORES.chrome.pageUrl(extensionId), C.add)}
            edge={add(STORES.edge.pageUrl(edgeId), E.add)}
          />
          <span className="small text-ink-muted">
            <ByStore stores={stores} chrome={C.opens} edge={E.opens} />
          </span>
        </span>
        <p className="ext-sec-phone">
          <ByStore stores={stores} chrome={C.phone} edge={E.phone} />
        </p>
      </div>
      <p className="ext-sec-have" style={installed ? undefined : { visibility: "hidden" }}>
        <ByStore stores={stores} chrome={C.have} edge={E.have} />
      </p>
    </div>
  );
}
