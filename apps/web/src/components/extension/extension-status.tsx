"use client";

import { useEffect, useState } from "react";

import { askExtension, storeUrl } from "@/lib/extension";

/**
 * The section's call to action: "Add to Chrome" (or, on a touch phone, the computer line) and the
 * "You have it" line share one grid cell (widgets.css `ext-sec-cta`). The hidden one is
 * `visibility: hidden`, never removed, so the cell keeps the taller line's height when the
 * extension answers that it is installed. Asks once after hydration.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-section-knows-when-the-extension-is-installed}
 * {@link openspec/specs/extension-site/spec.md#requirement-the-section-tells-phone-visitors-to-use-a-computer}
 */
export function ExtensionStatus({ extensionId }: { extensionId: string }) {
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    let live = true;
    void askExtension(extensionId).then((status) => {
      if (live) setInstalled(status.installed);
    });
    return () => {
      live = false;
    };
  }, [extensionId]);
  return (
    <div className="ext-sec-cta">
      <div style={installed ? { visibility: "hidden" } : undefined}>
        <span className="ext-sec-add">
          <a
            className="fs-btn fs-btn-primary"
            href={storeUrl(extensionId)}
            target="_blank"
            rel="noopener"
          >
            Add to Chrome
          </a>
          <span className="small text-ink-muted">Opens the Chrome Web Store</span>
        </span>
        <p className="ext-sec-phone">
          Chrome on phones doesn&apos;t run extensions. Open this page on a computer to add it.
        </p>
      </div>
      <p className="ext-sec-have" style={installed ? undefined : { visibility: "hidden" }}>
        You have it. Click its button in Chrome&apos;s toolbar to open the side panel.
      </p>
    </div>
  );
}
