"use client";

import { useCallback, useEffect, useState } from "react";

const CLAVE_FAVORITOS = "viasur:favoritos";
const EVENTO_CAMBIO = "viasur:favoritos-cambio";

/**
 * Favoritos anónimos: viven solo en localStorage del dispositivo, sin
 * cuenta ni sesión. Se guardan como array de IDs de `servicios_locales`.
 * El evento custom `EVENTO_CAMBIO` sincroniza a los demás componentes
 * montados en la misma pestaña (el evento nativo "storage" del browser
 * no dispara en la pestaña que hizo el cambio).
 */
function leerFavoritos(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const crudo = window.localStorage.getItem(CLAVE_FAVORITOS);
    const ids = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

function guardarFavoritos(ids: string[]): void {
  try {
    window.localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(EVENTO_CAMBIO));
  } catch {
    // Silencioso: si localStorage no está disponible (privado/bloqueado),
    // los favoritos simplemente no persisten en esta sesión.
  }
}

/**
 * Hook de favoritos anónimos. Devuelve la lista actual de IDs y las
 * acciones para alternar/consultar un servicio puntual.
 */
export function useFavoritos() {
  const [favoritos, setFavoritos] = useState<string[]>([]);

  useEffect(() => {
    setFavoritos(leerFavoritos());

    function sincronizar() {
      setFavoritos(leerFavoritos());
    }

    window.addEventListener(EVENTO_CAMBIO, sincronizar);
    window.addEventListener("storage", sincronizar);

    return () => {
      window.removeEventListener(EVENTO_CAMBIO, sincronizar);
      window.removeEventListener("storage", sincronizar);
    };
  }, []);

  const esFavorito = useCallback(
    (servicioId: string) => favoritos.includes(servicioId),
    [favoritos]
  );

  const alternarFavorito = useCallback((servicioId: string) => {
    const actuales = leerFavoritos();
    const yaEsFavorito = actuales.includes(servicioId);

    const nuevos = yaEsFavorito
      ? actuales.filter((id) => id !== servicioId)
      : [...actuales, servicioId];

    guardarFavoritos(nuevos);
    setFavoritos(nuevos);
  }, []);

  return { favoritos, esFavorito, alternarFavorito };
}
