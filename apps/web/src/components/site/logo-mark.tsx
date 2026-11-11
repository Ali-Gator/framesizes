/** The nested-frames mark (design system "Logo"): outlines in the text colour, the print in tape. Decorative. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <rect x="6" y="34" width="20" height="24" fill="#ffc21a" />
      <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinejoin="round">
        <rect x="6" y="6" width="52" height="52" />
        <rect x="6" y="18" width="36" height="40" />
        <rect x="6" y="34" width="20" height="24" />
      </g>
    </svg>
  );
}
