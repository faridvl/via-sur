import { normalizarWhatsapp } from "@/lib/whatsapp";

type Variante = "solido" | "sutil";

interface WhatsAppButtonProps {
  numero: string;
  label?: string;
  variante?: Variante;
  className?: string;
  /** Tamaño del ícono en px. Subirlo cuando el botón es un círculo sin
   * label (ej. "h-11 w-11 p-0"), para que no quede perdido en el centro. */
  iconSize?: number;
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
  iconSize = 16,
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
      <svg
        viewBox="0 0 32 32"
        width={iconSize}
        height={iconSize}
        className="shrink-0 fill-current"
        aria-hidden="true"
      >
        <path d="M16.004 3C9.35 3 3.96 8.36 3.96 14.98c0 2.16.58 4.28 1.68 6.14L3 29l8.06-2.58a13.1 13.1 0 0 0 4.94.96h.01c6.65 0 12.04-5.36 12.04-11.98C28.05 8.79 22.66 3 16 3zm0 21.94h-.01c-1.55 0-3.07-.4-4.4-1.15l-.31-.18-4.78 1.53 1.56-4.62-.2-.32a9.83 9.83 0 0 1-1.53-5.24c0-5.45 4.47-9.89 9.97-9.89 2.66 0 5.16 1.03 7.04 2.91a9.8 9.8 0 0 1 2.91 6.97c0 5.46-4.47 9.99-9.25 9.99zm5.47-7.42c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.35.22-.65.07-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.51-1.79-1.69-2.09-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.24-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.07-.8.38-.28.3-1.05 1.03-1.05 2.5 0 1.47 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
      </svg>
      {label}
    </a>
  );
}
