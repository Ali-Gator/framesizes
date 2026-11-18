import type { AnchorHTMLAttributes } from "react";

/** `next/link` for the extension's Vite build: a plain link. */
export default function Link({
  href,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={href} {...rest} />;
}
