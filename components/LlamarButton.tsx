import { Phone } from "lucide-react";

interface LlamarButtonProps {
  numero: string;
  label?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const CLASES_BASE =
  "flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800 font-semibold text-gray-200 transition-transform active:scale-95";

/**
 * Botón de contacto por llamada telefónica. Estilo neutro (no verde,
 * no color de marca): es la acción secundaria junto a WhatsAppButton y
 * no debe competir visualmente con él.
 */
export default function LlamarButton({
  numero,
  label = "Llamar",
  className = "px-4 py-3 text-sm",
  onClick,
}: LlamarButtonProps) {
  return (
    <a
      href={`tel:${numero.replace(/\D/g, "")}`}
      onClick={onClick}
      className={`${CLASES_BASE} ${className}`}
    >
      <Phone size={16} strokeWidth={2} aria-hidden="true" />
      {label}
    </a>
  );
}
