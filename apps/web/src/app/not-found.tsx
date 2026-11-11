import type { Metadata } from "next";
import Link from "next/link";

import { liveHubHeads } from "@/lib/site-map";

export const metadata: Metadata = { title: "Page not found" };

/**
 * Next answers 404 and adds `noindex` itself; the root layout gives the page the shell.
 * {@link openspec/specs/site-shell/spec.md#requirement-unknown-paths-answer-with-a-real-404}
 */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-content px-4 pt-8 md:px-8 md:pt-16">
      <h1 className="display">Page not found</h1>
      <p className="mt-4 body-lg max-w-prose text-ink-muted">
        This page does not exist. Start from one of these:
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {liveHubHeads().map((hub) => (
          <li key={hub.id}>
            <Link
              href={hub.path}
              className="body-lg text-ink underline decoration-line-strong underline-offset-[3px] hover:decoration-tape hover:decoration-2"
            >
              {hub.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
