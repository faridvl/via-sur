import { normalizarWhatsapp } from "@/lib/whatsapp";

type Variante = "solido" | "sutil";

interface WhatsAppButtonProps {
  numero: string;
  label?: string;
  variante?: Variante;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const CLASES_BASE =
  "flex items-center justify-center gap-2 rounded-xl font-semibold transition-transform active:scale-95";

const CLASES_POR_VARIANTE: Record<Variante, string> = {
  solido: "bg-success-500 text-white",
  sutil: "border border-success-500/30 bg-success-500/10 text-success-400",
};

/**
 * Botón de contacto por WhatsApp. El verde es intencional y fijo: es el
 * color de la marca WhatsApp (token `success`, no `primary`), no debe
 * seguir el color de marca de VíaSur. `variante="sutil"` es para cards
 * de listado ya cargadas de información; `"solido"` (default) para
 * cuando es la acción principal, como el detalle del servicio.
 */
export default function WhatsAppButton({
  numero,
  label = "WhatsApp",
  variante = "solido",
  className = "px-4 py-3 text-sm",
  onClick,
}: WhatsAppButtonProps) {
  return (
    <a
      href={`https://wa.me/${normalizarWhatsapp(numero)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`${CLASES_BASE} ${CLASES_POR_VARIANTE[variante]} ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2zm5.8 14.15c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2.01.89 2.16.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.28-.12.56.16.28.71 1.17 1.53 1.89 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.26.13.43.19.5.3.06.11.06.62-.18 1.3z" />
      </svg>
      {label}
    </a>
  );
}
