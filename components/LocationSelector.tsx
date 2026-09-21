"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { Localidad } from "@/types/viasur";

interface LocationSelectorProps {
  localidades: Localidad[];
  localidadId: number | null;
  onSeleccionar: (id: number) => void;
}

/**
 * El menú desplegable se renderiza en un portal a `document.body` en vez
 * de quedar anidado dentro del botón: el header que lo contiene tiene
 * `overflow-hidden` (para recortar la imagen de fondo), lo que recortaba
 * también este dropdown al abrirse. El portal lo saca de ese contexto de
 * recorte y lo posiciona con coordenadas absolutas calculadas desde el
 * botón.
 */
export default function LocationSelector({
  localidades,
  localidadId,
  onSeleccionar,
}: LocationSelectorProps) {
  const [abierto, setAbierto] = useState(false);
  const [posicion, setPosicion] = useState({ top: 0, right: 0 });
  const botonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const actual = localidades.find((l) => l.id === localidadId);

  useEffect(() => {
    function manejarClickFuera(evento: MouseEvent) {
      const objetivo = evento.target as Node;
      if (
        botonRef.current &&
        !botonRef.current.contains(objetivo) &&
        menuRef.current &&
        !menuRef.current.contains(objetivo)
      ) {
        setAbierto(false);
      }
    }

    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  function abrir() {
    const rect = botonRef.current?.getBoundingClientRect();
    if (rect) {
      setPosicion({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setAbierto((prev) => !prev);
  }

  return (
    <div className="relative">
      <button
        ref={botonRef}
        type="button"
        onClick={abrir}
        aria-expanded={abierto}
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors active:scale-95 ${
          abierto
            ? "border-gray-600 bg-gray-800 text-white"
            : "border-gray-800 bg-gray-900 text-gray-200"
        }`}
      >
        <MapPin size={14} strokeWidth={2} className="shrink-0 text-primary-400" />
        <span className="max-w-[6.5rem] truncate">
          {actual?.nombre ?? "Ubicación"}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2.25}
          className={`shrink-0 text-gray-500 transition-transform duration-200 ${
            abierto ? "rotate-180" : ""
          }`}
        />
      </button>

      {abierto &&
        createPortal(
          <>
            {/* Backdrop sutil para enfocar el menú sin bordes ni sombras duras */}
            <div
              className="fixed inset-0 z-40 bg-gray-950/40"
              onClick={() => setAbierto(false)}
              aria-hidden="true"
            />

            <div
              ref={menuRef}
              role="listbox"
              style={{ top: posicion.top, right: posicion.right }}
              className="fixed z-50 flex w-52 origin-top-right flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 py-1.5 shadow-2xl shadow-black/50"
            >
              <p className="px-4 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Elegí tu localidad
              </p>

              {localidades.map((localidad) => {
                const seleccionada = localidad.id === localidadId;

                return (
                  <button
                    key={localidad.id}
                    type="button"
                    role="option"
                    aria-selected={seleccionada}
                    onClick={() => {
                      onSeleccionar(localidad.id);
                      setAbierto(false);
                    }}
                    className={`flex items-center justify-between px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                      seleccionada
                        ? "text-white"
                        : "text-gray-300 active:bg-gray-800/80"
                    }`}
                  >
                    {localidad.nombre}
                    {seleccionada && (
                      <Check size={16} strokeWidth={2.5} className="text-primary-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
