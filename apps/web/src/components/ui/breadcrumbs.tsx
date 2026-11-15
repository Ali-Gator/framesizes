import Link from "next/link";

/** Design system Breadcrumbs: links up the trail, the last item the current page. */
export function Breadcrumbs({ items }: { items: readonly { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="fs-crumbs">
        {items.map((item, index) => (
          <li key={item.label}>
            {index === items.length - 1 || !item.href ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <Link className="link" href={item.href}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
