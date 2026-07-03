"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { Localidad } from "@/types/viasur";

interface LocationSelectorProps {
  localidades: Localidad[];
  localidadId: number | null;
  onSeleccionar: (id: number) => void;
}

export default function LocationSelector({
  localidades,
  localidadId,
  onSeleccionar,
}: LocationSelectorProps) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const actual = localidades.find((l) => l.id === localidadId);

  useEffect(() => {
    function manejarClickFuera(evento: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(evento.target as Node)
      ) {
        setAbierto(false);
      }
    }

    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        aria-expanded={abierto}
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors active:scale-95 ${
          abierto
            ? "border-gray-600 bg-gray-800 text-white"
            : "border-gray-800 bg-gray-900 text-gray-200"
        }`}
      >
        <MapPin size={14} strokeWidth={2} className="shrink-0 text-emerald-400" />
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

      {abierto && (
        <>
          {/* Backdrop sutil para enfocar el menú sin bordes ni sombras duras */}
          <div
            className="fixed inset-0 z-10 bg-gray-950/40"
            onClick={() => setAbierto(false)}
            aria-hidden="true"
          />

          <div
            role="listbox"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-20 flex w-52 origin-top-right flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 py-1.5 shadow-2xl shadow-black/50"
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
                    <Check size={16} strokeWidth={2.5} className="text-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
