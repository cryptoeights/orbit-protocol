/**
 * ORBIT "Constellation" mark — two crossing tilted orbits, a central core,
 * and two nodes. Spec: ../../DESIGN.md §1. Gradient stroke on dark.
 */
export default function Logo({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="orbit-grad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="100" rx="88" ry="33" transform="rotate(25 100 100)" fill="none" stroke="url(#orbit-grad)" strokeWidth="8" />
      <ellipse cx="100" cy="100" rx="88" ry="33" transform="rotate(-25 100 100)" fill="none" stroke="url(#orbit-grad)" strokeWidth="8" />
      <circle cx="100" cy="100" r="16" fill="url(#orbit-grad)" />
      <circle cx="180" cy="63" r="11" fill="#fff" />
      <circle cx="20" cy="137" r="7" fill="#fff" />
    </svg>
  );
}
