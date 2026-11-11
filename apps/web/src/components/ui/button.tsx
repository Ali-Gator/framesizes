import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { ArrowRightIcon } from "./icons";

type Variant = "primary" | "secondary" | "ghost";

/** Design system Button: a link when it has `href`, else a `type="button"` button. */
export function Button({
  variant = "primary",
  href,
  arrow,
  children,
  className,
  ...rest
}: {
  variant?: Variant;
  href?: string;
  /** An arrow after the label. */
  arrow?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = `fs-btn fs-btn-${variant}${className ? ` ${className}` : ""}`;
  const body = (
    <>
      {children}
      {arrow ? <ArrowRightIcon /> : null}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" {...rest} className={classes}>
      {body}
    </button>
  );
}
