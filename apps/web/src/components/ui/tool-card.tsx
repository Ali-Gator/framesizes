import Link from "next/link";

/** Design system ToolCard: a link to a tool page with a frame thumbnail in the page's ratio. */
export function ToolCard({
  title,
  question,
  href,
  ratio,
}: {
  title: string;
  question?: string;
  href: string;
  ratio: readonly [number, number];
}) {
  const big = Math.max(ratio[0], ratio[1]);
  const width = Math.round((30 * ratio[0]) / big);
  const height = Math.round((30 * ratio[1]) / big);
  return (
    <Link href={href} className="fs-tool">
      <span className="fs-tool-thumb" aria-hidden="true">
        <i style={{ width, height }} />
      </span>
      <span className="fs-tool-text">
        <span className="fs-tool-title">{title}</span>
        {question ? <span className="fs-tool-q">{question}</span> : null}
      </span>
    </Link>
  );
}
