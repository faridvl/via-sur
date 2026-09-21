"use client";

import { useCallback, useEffect, useState } from "react";

const CLAVE_BUSQUEDAS = "viasur:busquedas_recientes";
const EVENTO_CAMBIO = "viasur:busquedas_recientes-cambio";
const MAX_BUSQUEDAS = 8;

/**
 * Búsquedas recientes anónimas: viven solo en localStorage del
 * dispositivo, sin cuenta ni sesión. Se guardan como array de textos,
 * más reciente primero, sin duplicados. Mismo patrón que `favoritos.ts`.
 */
function leerBusquedas(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const crudo = window.localStorage.getItem(CLAVE_BUSQUEDAS);
    const textos = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(textos) ? textos : [];
  } catch {
    return [];
  }
}

function guardarBusquedas(textos: string[]): void {
  try {
    window.localStorage.setItem(CLAVE_BUSQUEDAS, JSON.stringify(textos));
    window.dispatchEvent(new CustomEvent(EVENTO_CAMBIO));
  } catch {
    // Silencioso: si localStorage no está disponible (privado/bloqueado),
    // el historial simplemente no persiste en esta sesión.
  }
}

/**
 * Hook de búsquedas recientes anónimas. Devuelve el historial actual
 * (más reciente primero) y las acciones para agregar/quitar/vaciar.
 */
export function useBusquedasRecientes() {
  const [busquedas, setBusquedas] = useState<string[]>([]);

  useEffect(() => {
    setBusquedas(leerBusquedas());

    function sincronizar() {
      setBusquedas(leerBusquedas());
    }

    window.addEventListener(EVENTO_CAMBIO, sincronizar);
    window.addEventListener("storage", sincronizar);

    return () => {
      window.removeEventListener(EVENTO_CAMBIO, sincronizar);
      window.removeEventListener("storage", sincronizar);
    };
  }, []);

  const agregarBusqueda = useCallback((texto: string) => {
    const limpio = texto.trim();
    if (!limpio) return;

    const actuales = leerBusquedas();
    const sinDuplicado = actuales.filter(
      (t) => t.toLowerCase() !== limpio.toLowerCase()
    );
    const nuevas = [limpio, ...sinDuplicado].slice(0, MAX_BUSQUEDAS);

    guardarBusquedas(nuevas);
    setBusquedas(nuevas);
  }, []);

  const quitarBusqueda = useCallback((texto: string) => {
    const actuales = leerBusquedas();
    const nuevas = actuales.filter((t) => t !== texto);

    guardarBusquedas(nuevas);
    setBusquedas(nuevas);
  }, []);

  const vaciarBusquedas = useCallback(() => {
    guardarBusquedas([]);
    setBusquedas([]);
  }, []);

  return { busquedas, agregarBusqueda, quitarBusqueda, vaciarBusquedas };
}
