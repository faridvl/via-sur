"use client";

import { Heart } from "lucide-react";
import { useFavoritos } from "@/lib/favoritos";

interface FavoritoBotonProps {
  servicioId: string;
  className?: string;
  size?: number;
}

/**
 * Corazón para marcar/desmarcar un servicio como favorito. El favorito
 * es anónimo (localStorage, sin cuenta) — ver `lib/favoritos.ts`.
 * `stopPropagation` porque este botón siempre vive dentro de una tarjeta
 * o cabecera que a su vez es (o contiene) un `<Link>` de navegación.
 */
export default function FavoritoBoton({
  servicioId,
  className = "flex h-9 w-9 items-center justify-center rounded-full bg-gray-950/60 backdrop-blur-md",
  size = 18,
}: FavoritoBotonProps) {
  const { esFavorito, alternarFavorito } = useFavoritos();
  const activo = esFavorito(servicioId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        alternarFavorito(servicioId);
      }}
      aria-pressed={activo}
      aria-label={activo ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`transition-transform active:scale-90 ${className}`}
    >
      <Heart
        size={size}
        strokeWidth={2}
        className={activo ? "text-accent-500" : "text-white"}
        fill={activo ? "currentColor" : "none"}
        aria-hidden="true"
      />
    </button>
  );
}
