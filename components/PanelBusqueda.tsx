"use client";

import Link from "next/link";
import { Clock, MapPin, SearchX, Trash2 } from "lucide-react";
import {
  Categoria,
  ImagenServicio,
  Localidad,
  ServicioLocal,
} from "@/types/viasur";
import { iconoDeCategoria } from "@/lib/categoriaIconos";
import { useBusquedasRecientes } from "@/lib/busquedasRecientes";
import FondoMontanas from "@/components/FondoMontanas";
import WhatsAppButton from "@/components/WhatsAppButton";
import FavoritoBoton from "@/components/FavoritoBoton";

type EstadoCarga = "idle" | "cargando" | "listo" | "error";

interface PanelBusquedaProps {
  activo: boolean;
  texto: string;
  onBuscarTexto: (texto: string) => void;
  onSeleccionarResultado: () => void;
  resultados: ServicioLocal[];
  imagenes: Record<string, ImagenServicio[]>;
  estado: EstadoCarga;
  categorias: Categoria[];
  localidades: Localidad[];
}

/**
 * Panel de búsqueda embebido en el flujo normal de la página (no overlay
 * ni modal): se inserta debajo del input de búsqueda del Home mientras
 * ese input está enfocado, empujando Categorías/Destacados/Servicios más
 * abajo en vez de taparlos. Sin texto muestra el historial de búsquedas
 * recientes (localStorage, anónimo); con 2+ caracteres muestra las
 * tarjetas de resultados. El input real vive en el Home — este
 * componente solo renderiza lo que va debajo.
 */
export default function PanelBusqueda({
  activo,
  texto,
  onBuscarTexto,
  onSeleccionarResultado,
  resultados,
  imagenes,
  estado,
  categorias,
  localidades,
}: PanelBusquedaProps) {
  const { busquedas, quitarBusqueda, vaciarBusquedas } =
    useBusquedasRecientes();

  if (!activo) return null;

  const buscando = texto.trim().length >= 2;

  return (
    <div className="flex flex-col gap-3 px-5">
      {!buscando && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Búsquedas recientes
            </h2>
            {busquedas.length > 0 && (
              <button
                type="button"
                onClick={vaciarBusquedas}
                className="text-xs font-semibold text-gray-500"
              >
                Borrar todo
              </button>
            )}
          </div>

          {busquedas.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              Todavía no tenés búsquedas recientes.
            </p>
          ) : (
            <ul className="flex flex-col">
              {busquedas.map((item) => (
                <li
                  key={item}
                  className="flex items-center justify-between gap-3 border-b border-gray-800/60 py-3"
                >
                  <button
                    type="button"
                    onClick={() => onBuscarTexto(item)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <Clock
                      className="shrink-0 text-gray-500"
                      size={16}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className="truncate text-sm text-gray-200">
                      {item}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quitarBusqueda(item)}
                    aria-label={`Quitar "${item}" del historial`}
                    className="shrink-0 p-1 text-gray-500 active:text-gray-300"
                  >
                    <Trash2 size={15} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {buscando && estado === "cargando" && (
        <div className="flex flex-col items-center gap-2 py-10">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-700 border-t-primary-400" />
          <p className="text-sm font-medium text-gray-400">Buscando…</p>
        </div>
      )}

      {buscando && estado === "error" && (
        <p className="text-center text-sm font-medium text-red-400">
          No se pudo completar la búsqueda.
        </p>
      )}

      {buscando && estado === "listo" && resultados.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-gray-800/60 px-6 py-12 text-center">
          <SearchX className="text-gray-500" size={32} strokeWidth={1.5} />
          <p className="text-sm font-semibold text-gray-200">
            No encontramos negocios con ese nombre.
          </p>
        </div>
      )}

      {buscando && estado === "listo" && resultados.length > 0 && (
        <section className="flex flex-col gap-3">
          {resultados.map((servicio) => {
            const categoria = categorias.find(
              (c) => c.id === servicio.categoria_id
            );
            const localidad = localidades.find(
              (l) => l.id === servicio.localidad_id
            );
            const IconoCategoria = categoria
              ? iconoDeCategoria(categoria.nombre)
              : null;
            const portada = imagenes[servicio.id]?.[0];

            return (
              <div
                key={servicio.id}
                className="flex items-center gap-3 rounded-xl border border-primary-700/40 bg-primary-950/50 p-3 shadow-md shadow-black/20 transition-transform active:scale-[0.98]"
              >
                <Link
                  href={`/servicio/${servicio.id}`}
                  onClick={onSeleccionarResultado}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <div
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-primary-700/40 bg-gray-900 bg-cover bg-center"
                    style={
                      portada
                        ? { backgroundImage: `url(${portada.url})` }
                        : undefined
                    }
                  >
                    {!portada && (
                      <>
                        <FondoMontanas className="absolute inset-0 h-full w-full" />
                        {IconoCategoria && (
                          <div className="relative flex h-full w-full items-center justify-center">
                            <IconoCategoria
                              className="text-white/70"
                              size={22}
                              strokeWidth={1.25}
                              aria-hidden="true"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <h3 className="truncate text-sm font-bold tracking-tight text-white">
                      {servicio.nombre_servicio}
                    </h3>
                    {servicio.descripcion && (
                      <p className="truncate text-xs text-gray-400">
                        {servicio.descripcion}
                      </p>
                    )}
                    {(servicio.direccion_exacta || localidad) && (
                      <p className="flex items-center gap-1 truncate text-[11px] font-medium text-gray-500">
                        <MapPin size={11} strokeWidth={1.75} aria-hidden="true" />
                        {localidad
                          ? servicio.direccion_exacta
                            ? `${servicio.direccion_exacta} · ${localidad.nombre}`
                            : localidad.nombre
                          : servicio.direccion_exacta}
                      </p>
                    )}
                  </div>
                </Link>

                <FavoritoBoton
                  servicioId={servicio.id}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-700/80 bg-gray-900"
                />

                {servicio.whatsapp && (
                  <WhatsAppButton
                    numero={servicio.whatsapp}
                    variante="solido"
                    label=""
                    iconSize={21}
                    className="h-10 w-10 shrink-0 rounded-full p-0"
                  />
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
