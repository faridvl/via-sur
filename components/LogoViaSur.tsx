interface LogoViaSurProps {
  className?: string;
  size?: number;
}

/**
 * Isotipo de VíaSur: tres picos de montaña con arco/valle hueco en el
 * centro, sobre tres olas de agua segmentadas. Vectorizado a mano a
 * partir del logo de referencia (public/Gemini_Generated_Image_...).
 * Relleno sólido en currentColor para heredar el color de marca.
 */
export default function LogoViaSur({ className, size = 28 }: LogoViaSurProps) {
  const idBase = `logo-viasur-mask-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <mask id={idBase} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect x="0" y="0" width="100" height="100" fill="white" />
          <circle cx="50" cy="60" r="7" fill="black" />
        </mask>
      </defs>

      <g mask={`url(#${idBase})`}>
        <path
          d="M50 15
             C54 15 57 19 62 28
             C66 35.5 69.5 44 72.5 51.5
             C76 45 79.5 39 82 35
             C83.5 32.6 86.5 32.4 88 34.7
             C92 41 96 49 98.5 57
             C99.3 59.5 97.6 62 95 62
             C89 62 82 61.7 75 61.2
             L75 55
             C75 52 72.8 50 70 50
             C67.2 50 65 52 65 55
             L65 60.7
             C60 60.4 55 60.2 50 60.2
             C45 60.2 40 60.4 35 60.7
             L35 55
             C35 52 32.8 50 30 50
             C27.2 50 25 52 25 55
             L25 61.2
             C18 61.7 11 62 5 62
             C2.4 62 0.7 59.5 1.5 57
             C4 49 8 41 12 34.7
             C13.5 32.4 16.5 32.6 18 35
             C20.5 39 24 45 27.5 51.5
             C30.5 44 34 35.5 38 28
             C43 19 46 15 50 15 Z"
          fill="currentColor"
        />
        <path
          d="M50 44
             C55 51 58.5 58 60 63.5
             C57 64.3 53.6 64.7 50 64.7
             C46.4 64.7 43 64.3 40 63.5
             C41.5 58 45 51 50 44 Z"
          fill="currentColor"
        />
      </g>

      <path
        d="M2 68Q13 62 24 68T46 68T68 68T90 68T98 65"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M2 78Q13 72 24 78T46 78T68 78T90 78T98 75"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M8 88Q17 83 26 88T44 88T62 88T80 88T92 85"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
    </svg>
  );
}
