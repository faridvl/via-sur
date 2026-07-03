"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Categoria, Localidad, ServicioLocal } from "@/types/viasur";
import { normalizarWhatsapp } from "@/lib/whatsapp";

type EstadoCarga = "idle" | "cargando" | "listo" | "error";

const FORMATEADOR_FECHA = new Intl.DateTimeFormat("es-CR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function HomePage() {
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [localidadId, setLocalidadId] = useState<number | null>(null);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);

  const [servicios, setServicios] = useState<ServicioLocal[]>([]);
  const [estadoServicios, setEstadoServicios] = useState<EstadoCarga>("idle");

  const fechaHoy = useMemo(
    () => capitalizar(FORMATEADOR_FECHA.format(new Date())),
    []
  );

  // Carga inicial: localidades y categorías en paralelo.
  useEffect(() => {
    let cancelado = false;

    async function cargarFiltros() {
      try {
        const [resLocalidades, resCategorias] = await Promise.all([
          fetch("/api/localidades"),
          fetch("/api/categorias"),
        ]);

        const dataLocalidades: { localidades: Localidad[] } =
          await resLocalidades.json();
        const dataCategorias: { categorias: Categoria[] } =
          await resCategorias.json();

        if (cancelado) return;

        setLocalidades(dataLocalidades.localidades ?? []);
        setCategorias(dataCategorias.categorias ?? []);

        if (dataLocalidades.localidades?.length) {
          setLocalidadId(dataLocalidades.localidades[0].id);
        }
      } catch {
        // Silencioso: los selectores simplemente quedarán vacíos.
      }
    }

    cargarFiltros();

    return () => {
      cancelado = true;
    };
  }, []);

  // Carga de servicios cada vez que cambia localidad y/o categoría.
  useEffect(() => {
    if (!localidadId || !categoriaId) {
      setServicios([]);
      return;
    }

    let cancelado = false;
    setEstadoServicios("cargando");

    async function cargarServicios() {
      try {
        const params = new URLSearchParams({
          localidad_id: String(localidadId),
          categoria_id: String(categoriaId),
        });

        const res = await fetch(`/api/servicios?${params.toString()}`);

        if (!res.ok) {
          throw new Error("Respuesta no exitosa del servidor.");
        }

        const data: { servicios: ServicioLocal[] } = await res.json();

        if (!cancelado) {
          setServicios(data.servicios ?? []);
          setEstadoServicios("listo");
        }
      } catch {
        if (!cancelado) {
          setEstadoServicios("error");
        }
      }
    }

    cargarServicios();

    return () => {
      cancelado = true;
    };
  }, [localidadId, categoriaId]);

  const destacados = useMemo(
    () => servicios.filter((s) => s.es_destacado),
    [servicios]
  );
  const regulares = useMemo(
    () => servicios.filter((s) => !s.es_destacado),
    [servicios]
  );

  const categoriaSeleccionada = categorias.find((c) => c.id === categoriaId);

  return (
    <main className="flex min-h-screen w-full flex-col gap-7 px-5 pb-10 pt-6">
      {/* Cabecera */}
      <header className="flex flex-col gap-5">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            VíaSur
          </h1>
          <p className="text-xs font-medium text-zinc-400">{fechaHoy}</p>
        </div>

        {/* Selector de localidad — píldoras horizontales */}
        <div className="no-scrollbar -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1">
          {localidades.map((localidad) => {
            const seleccionada = localidad.id === localidadId;

            return (
              <button
                key={localidad.id}
                type="button"
                onClick={() => setLocalidadId(localidad.id)}
                aria-pressed={seleccionada}
                className={`shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-semibold tracking-tight transition-all active:scale-95 ${
                  seleccionada
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
                    : "border-zinc-200 bg-white text-zinc-500"
                }`}
              >
                {localidad.nombre}
              </button>
            );
          })}
        </div>
      </header>

      {/* Grid de categorías — bento minimalista */}
      <section className="grid grid-cols-4 gap-2.5">
        {categorias.map((categoria) => {
          const seleccionada = categoria.id === categoriaId;

          return (
            <button
              key={categoria.id}
              type="button"
              onClick={() =>
                setCategoriaId(seleccionada ? null : categoria.id)
              }
              aria-pressed={seleccionada}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3.5 text-center transition-all active:scale-95 ${
                seleccionada
                  ? "border-indigo-600/40 bg-indigo-50/80 shadow-sm"
                  : "border-zinc-200/70 bg-white/70 backdrop-blur-sm"
              }`}
            >
              <span className="text-xl">{categoria.icono}</span>
              <span className="text-[10.5px] font-semibold leading-tight tracking-tight text-zinc-500">
                {categoria.nombre}
              </span>
            </button>
          );
        })}
      </section>

      {/* Resultados */}
      {categoriaId && (
        <section className="flex flex-col gap-6">
          {estadoServicios === "cargando" && (
            <div className="flex flex-col items-center gap-2 py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-600" />
              <p className="text-sm font-medium text-zinc-400">
                Buscando servicios…
              </p>
            </div>
          )}

          {estadoServicios === "error" && (
            <p className="text-center text-sm font-medium text-red-500">
              No se pudieron cargar los servicios.
            </p>
          )}

          {estadoServicios === "listo" && servicios.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-zinc-300 bg-white/60 px-6 py-12 text-center">
              <span className="text-3xl">{categoriaSeleccionada?.icono}</span>
              <p className="text-sm font-semibold text-zinc-700">
                Todavía no hay servicios de {categoriaSeleccionada?.nombre} en
                esta localidad.
              </p>
              <p className="text-xs text-zinc-400">
                ¿Tenés un negocio de esta categoría?
              </p>
              <Link
                href="/mis-servicios"
                className="mt-1 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-transform active:scale-95"
              >
                Sé el primero en registrarte
              </Link>
            </div>
          )}

          {destacados.length > 0 && (
            <div className="flex flex-col gap-3.5">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
                Destacados
              </h2>
              {destacados.map((servicio) => (
                <Link
                  key={servicio.id}
                  href={`/servicio/${servicio.id}`}
                  className="group relative block overflow-hidden rounded-3xl border border-amber-300/70 bg-gradient-to-br from-amber-50 via-white to-white p-4 shadow-md shadow-amber-900/5 transition-transform active:scale-[0.98]"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-300/20 animate-brillo" />

                  <div className="relative flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold tracking-tight text-zinc-900">
                        {servicio.nombre_servicio}
                      </h3>
                      <span className="shrink-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-white shadow-sm">
                        ✦ Destacado
                      </span>
                    </div>

                    {servicio.descripcion && (
                      <p className="text-sm leading-relaxed text-zinc-500">
                        {servicio.descripcion}
                      </p>
                    )}

                    {servicio.direccion_exacta && (
                      <p className="text-xs font-medium text-zinc-400">
                        📍 {servicio.direccion_exacta}
                      </p>
                    )}

                    {servicio.whatsapp && (
                      <a
                        href={`https://wa.me/${normalizarWhatsapp(servicio.whatsapp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1.5 flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-[#25D366]/30 transition-transform active:scale-95"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4 fill-current"
                          aria-hidden="true"
                        >
                          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2zm5.8 14.15c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2.01.89 2.16.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.28-.12.56.16.28.71 1.17 1.53 1.89 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.26.13.43.19.5.3.06.11.06.62-.18 1.3z" />
                        </svg>
                        WhatsApp
                      </a>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {regulares.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                Servicios
              </h2>
              {regulares.map((servicio) => (
                <Link
                  key={servicio.id}
                  href={`/servicio/${servicio.id}`}
                  className="flex flex-col gap-2 rounded-2xl border border-zinc-200/80 bg-white p-4 transition-transform active:scale-[0.98]"
                >
                  <h3 className="text-sm font-bold tracking-tight text-zinc-900">
                    {servicio.nombre_servicio}
                  </h3>
                  {servicio.descripcion && (
                    <p className="text-xs leading-relaxed text-zinc-500">
                      {servicio.descripcion}
                    </p>
                  )}
                  {servicio.direccion_exacta && (
                    <p className="text-[11px] font-medium text-zinc-400">
                      📍 {servicio.direccion_exacta}
                    </p>
                  )}
                  {servicio.whatsapp && (
                    <a
                      href={`https://wa.me/${normalizarWhatsapp(servicio.whatsapp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 self-start rounded-xl border border-zinc-200 px-3.5 py-2 text-xs font-semibold text-zinc-600 transition-transform active:scale-95"
                    >
                      WhatsApp
                    </a>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {!categoriaId && (
        <p className="text-center text-sm font-medium text-zinc-400">
          Elegí una categoría para ver los servicios disponibles.
        </p>
      )}
    </main>
  );
}
