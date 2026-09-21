import { Phone } from "lucide-react";

type Variante = "caja" | "pastilla";

interface LlamarButtonProps {
  numero: string;
  label?: string;
  variante?: Variante;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const CLASES_BASE =
  "flex items-center justify-center gap-2 font-semibold transition-transform active:scale-95";

const CLASES_POR_VARIANTE: Record<Variante, string> = {
  caja: "rounded-xl border border-gray-700 bg-gray-800 text-gray-200",
  pastilla: "rounded-full border border-primary-400 text-primary-400",
};

/**
 * Botón de contacto por llamada telefónica. Estilo neutro (no verde,
 * no color de marca): es la acción secundaria junto a WhatsAppButton y
 * no debe competir visualmente con él. `variante="caja"` (default) para
 * cards de listado; `"pastilla"` (rounded-full, borde primary) para el
 * detalle del servicio, junto al WhatsAppButton en variante "pastilla".
 */
export default function LlamarButton({
  numero,
  label = "Llamar",
  variante = "caja",
  className = "px-4 py-3 text-sm",
  onClick,
}: LlamarButtonProps) {
  return (
    <a
      href={`tel:${numero.replace(/\D/g, "")}`}
      onClick={onClick}
      className={`${CLASES_BASE} ${CLASES_POR_VARIANTE[variante]} ${className}`}
    >
      <Phone size={16} strokeWidth={2} aria-hidden="true" />
      {label}
    </a>
  );
}
