import type { ReactNode } from "react";

/** Design system WidgetCard: a titled card (`h2`) with an optional footer; untitled in a place that already names it. */
export function WidgetCard({
  title,
  actions,
  footer,
  children,
  className,
}: {
  title?: string;
  /** Controls beside the title. */
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`fs-widget${className ? ` ${className}` : ""}`} aria-label={title}>
      <header className="fs-widget-head">
        {title ? <h2 className="fs-widget-title">{title}</h2> : null}
        {actions}
      </header>
      <div className="fs-widget-body">{children}</div>
      {footer ? <footer className="fs-widget-foot">{footer}</footer> : null}
    </section>
  );
}
