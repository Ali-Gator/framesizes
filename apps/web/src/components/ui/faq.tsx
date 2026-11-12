import type { ReactNode } from "react";

/**
 * Design system FAQ: one `details` per question, the question an `h3` inside the `summary`
 * (a summary may hold one heading), the first open.
 */
export function FAQ({ items }: { items: readonly { q: string; a: ReactNode }[] }) {
  return (
    <div className="fs-faq">
      {items.map((item, index) => (
        <details key={item.q} open={index === 0}>
          <summary>
            <h3>{item.q}</h3>
          </summary>
          <div className="fs-faq-a">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
