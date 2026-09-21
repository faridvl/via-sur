interface FondoMontanasProps {
  className?: string;
}

/**
 * Fondo decorativo tipo paisaje del Pacífico Sur (Golfito/isla) en azules
 * de marca. SVG inline en vez de PNG: escala nítido a cualquier tamaño de
 * tarjeta y hereda los mismos tonos primary/gray que el resto de la UI.
 */
export default function FondoMontanas({ className }: FondoMontanasProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cieloFondoMontanas" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a4f9c" />
          <stop offset="55%" stopColor="#0c1f3d" />
          <stop offset="100%" stopColor="#050b17" />
        </linearGradient>
        <linearGradient id="marFondoMontanas" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1279e6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0a4f9c" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <rect width="400" height="300" fill="url(#cieloFondoMontanas)" />

      {/* luna / sol tenue */}
      <circle cx="320" cy="55" r="26" fill="#3b9eff" opacity="0.18" />
      <circle cx="320" cy="55" r="14" fill="#3b9eff" opacity="0.3" />

      {/* cordillera lejana */}
      <path
        d="M0 165 L40 120 L75 150 L110 95 L150 145 L190 110 L230 150 L270 100 L310 155 L350 115 L400 160 L400 300 L0 300 Z"
        fill="#0a4f9c"
        opacity="0.45"
      />

      {/* isla / volcán principal */}
      <path
        d="M-10 210 L60 130 L95 175 L140 100 L185 170 L230 135 L270 190 L410 210 L410 300 L-10 300 Z"
        fill="#0c63c2"
        opacity="0.75"
      />

      {/* cresta con detalle tipo volcán */}
      <path
        d="M110 105 L140 100 L152 122 L168 108 L185 170 L95 175 Z"
        fill="#1279e6"
        opacity="0.55"
      />

      {/* primer plano de montañas costeras */}
      <path
        d="M-10 260 L50 200 L90 235 L130 180 L175 245 L220 205 L260 250 L410 260 L410 300 L-10 300 Z"
        fill="#3b9eff"
        opacity="0.9"
      />

      {/* mar en el frente */}
      <rect x="0" y="255" width="400" height="45" fill="url(#marFondoMontanas)" />
      <path
        d="M0 268Q20 264 40 268T80 268T120 268T160 268T200 268T240 268T280 268T320 268T360 268T400 268"
        stroke="#eef6ff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.25"
        fill="none"
      />
      <path
        d="M0 280Q20 276 40 280T80 280T120 280T160 280T200 280T240 280T280 280T320 280T360 280T400 280"
        stroke="#eef6ff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.15"
        fill="none"
      />
    </svg>
  );
}
