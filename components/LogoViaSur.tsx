interface LogoViaSurProps {
  className?: string;
  size?: number;
}

/**
 * Isotipo de VíaSur: montaña (Pacífico Sur/Golfito) sobre ondas de agua.
 * SVG inline para heredar los tokens de color de marca vía currentColor
 * en vez de depender de un PNG/gradiente fijo.
 */
export default function LogoViaSur({ className, size = 28 }: LogoViaSurProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 20L11 8L15 15L18 10L28 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 24Q6 21 10 24T18 24T26 24T30 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M2 28Q6 25.5 10 28T18 28T26 28T30 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}
