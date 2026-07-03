"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Categoria, Localidad, ServicioLocal } from "@/types/viasur";
import { normalizarWhatsapp } from "@/lib/whatsapp";
import LocationSelector from "@/components/LocationSelector";
import { iconoDeCategoria } from "@/lib/categoriaIconos";

type EstadoCarga = "idle" | "cargando" | "listo" | "error";

const CLAVE_CATEGORIA = "viasur:categoria_id";
const CLAVE_LOCALIDAD = "viasur:localidad_id";

export default function HomePage() {
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [localidadId, setLocalidadId] = useState<number | null>(null);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);

  const categoriaBotonRef = useRef<Map<number, HTMLButtonElement>>(new Map());
  const restauroCategoriaInicial = useRef(false);
  const [restauracionLista, setRestauracionLista] = useState(false);

  const [servicios, setServicios] = useState<ServicioLocal[]>([]);
  const [estadoServicios, setEstadoServicios] = useState<EstadoCarga>("idle");

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

        const localidadGuardada = Number(
          sessionStorage.getItem(CLAVE_LOCALIDAD)
        );
        const localidadValida = dataLocalidades.localidades?.some(
          (l) => l.id === localidadGuardada
        );

        if (localidadValida) {
          setLocalidadId(localidadGuardada);
        } else if (dataLocalidades.localidades?.length) {
          setLocalidadId(dataLocalidades.localidades[0].id);
        }

        const categoriaGuardada = Number(
          sessionStorage.getItem(CLAVE_CATEGORIA)
        );
        const categoriaValida = dataCategorias.categorias?.some(
          (c) => c.id === categoriaGuardada
        );

        if (categoriaValida) {
          setCategoriaId(categoriaGuardada);
        }
      } catch {
        // Silencioso: los selectores simplemente quedarán vacíos.
      } finally {
        if (!cancelado) {
          setRestauracionLista(true);
        }
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

  // Persiste la selección para sobrevivir a la navegación de ida y vuelta
  // a la pantalla de detalle (sessionStorage: vive mientras dure la pestaña).
  // Espera a que termine la restauración inicial: si escribimos antes,
  // el valor `null` con el que arrancan los estados pisaría lo guardado
  // de la sesión anterior antes de que cargarFiltros() llegue a leerlo.
  useEffect(() => {
    if (!restauracionLista) return;

    if (localidadId !== null) {
      sessionStorage.setItem(CLAVE_LOCALIDAD, String(localidadId));
    }
  }, [restauracionLista, localidadId]);

  useEffect(() => {
    if (!restauracionLista) return;

    if (categoriaId !== null) {
      sessionStorage.setItem(CLAVE_CATEGORIA, String(categoriaId));
    } else {
      sessionStorage.removeItem(CLAVE_CATEGORIA);
    }
  }, [restauracionLista, categoriaId]);

  // Al restaurar una categoría guardada, desplaza el carrusel hasta ella
  // para que el usuario no pierda el contexto al volver del detalle.
  useEffect(() => {
    if (
      restauroCategoriaInicial.current ||
      categoriaId === null ||
      categorias.length === 0
    ) {
      return;
    }

    restauroCategoriaInicial.current = true;
    const boton = categoriaBotonRef.current.get(categoriaId);
    boton?.scrollIntoView({
      behavior: "instant",
      inline: "center",
      block: "nearest",
    });
  }, [categoriaId, categorias]);

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
    <main className="flex min-h-screen w-full flex-col gap-5 px-5 pb-10 pt-6">
      {/* Header compacto */}
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight text-white">
          VíaSur
        </h1>

        <LocationSelector
          localidades={localidades}
          localidadId={localidadId}
          onSeleccionar={setLocalidadId}
        />
      </header>

      {/* Categorías — carrusel horizontal de burbujas */}
      <section className="no-scrollbar -mx-5 flex snap-x gap-5 overflow-x-auto px-5 pb-1">
        {categorias.map((categoria) => {
          const seleccionada = categoria.id === categoriaId;
          const Icono = iconoDeCategoria(categoria.nombre);

          return (
            <button
              key={categoria.id}
              ref={(el) => {
                if (el) {
                  categoriaBotonRef.current.set(categoria.id, el);
                } else {
                  categoriaBotonRef.current.delete(categoria.id);
                }
              }}
              type="button"
              onClick={() =>
                setCategoriaId(seleccionada ? null : categoria.id)
              }
              aria-pressed={seleccionada}
              className="flex shrink-0 snap-start flex-col items-center gap-1.5 transition-transform active:scale-95"
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
                  seleccionada ? "bg-gray-700" : "bg-gray-800/80"
                }`}
              >
                <Icono
                  className={seleccionada ? "text-white" : "text-gray-400"}
                  size={26}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </span>
              <span className="text-xs font-medium leading-tight text-white">
                {categoria.nombre}
              </span>
            </button>
          );
        })}
      </section>

      {/* Resultados */}
      {categoriaId && (
        <section className="mt-3 flex flex-col gap-8">
          {estadoServicios === "cargando" && (
            <div className="flex flex-col items-center gap-2 py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-700 border-t-emerald-400" />
              <p className="text-sm font-medium text-gray-400">
                Buscando servicios…
              </p>
            </div>
          )}

          {estadoServicios === "error" && (
            <p className="text-center text-sm font-medium text-red-400">
              No se pudieron cargar los servicios.
            </p>
          )}

          {estadoServicios === "listo" && servicios.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-xl bg-gray-800/60 px-6 py-12 text-center">
              {categoriaSeleccionada &&
                (() => {
                  const IconoVacio = iconoDeCategoria(
                    categoriaSeleccionada.nombre
                  );
                  return (
                    <IconoVacio
                      className="text-gray-500"
                      size={32}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  );
                })()}
              <p className="text-sm font-semibold text-gray-200">
                Todavía no hay servicios de {categoriaSeleccionada?.nombre} en
                esta localidad.
              </p>
              <p className="text-xs text-gray-400">
                ¿Tenés un negocio de esta categoría?
              </p>
              <Link
                href="/mis-servicios"
                className="mt-1 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95"
              >
                Sé el primero en registrarte
              </Link>
            </div>
          )}

          {destacados.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Destacados
              </h2>
              <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1">
                {destacados.map((servicio) => {
                  return (
                    <Link
                      key={servicio.id}
                      href={`/servicio/${servicio.id}`}
                      className="group block w-[82%] shrink-0 snap-start overflow-hidden rounded-2xl bg-gray-800"
                    >
                      {/* Imagen protagonista (placeholder con degradado sutil si no hay foto) */}
                      <div className="relative h-40 w-full bg-gradient-to-br from-gray-700 to-gray-900">
                        <span className="absolute left-3 top-3 rounded-lg bg-gray-950/70 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-white">
                          Destacado
                        </span>
                      </div>

                      {/* Info del negocio */}
                      <div className="flex flex-col gap-2 bg-gray-850 p-4">
                        <h3 className="text-base font-bold text-white">
                          {servicio.nombre_servicio}
                        </h3>

                        {servicio.descripcion && (
                          <p className="line-clamp-2 text-sm text-gray-400">
                            {servicio.descripcion}
                          </p>
                        )}

                        {servicio.whatsapp && (
                          <a
                            href={`https://wa.me/${normalizarWhatsapp(servicio.whatsapp)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1.5 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-95"
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
                  );
                })}
              </div>
            </div>
          )}

          {regulares.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Servicios
              </h2>
              {regulares.map((servicio) => (
                <Link
                  key={servicio.id}
                  href={`/servicio/${servicio.id}`}
                  className="flex flex-col gap-2 rounded-xl bg-gray-800 p-4 transition-transform active:scale-[0.98]"
                >
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    {servicio.nombre_servicio}
                  </h3>
                  {servicio.descripcion && (
                    <p className="text-xs leading-relaxed text-gray-400">
                      {servicio.descripcion}
                    </p>
                  )}
                  {servicio.direccion_exacta && (
                    <p className="text-[11px] font-medium text-gray-500">
                      📍 {servicio.direccion_exacta}
                    </p>
                  )}
                  {servicio.whatsapp && (
                    <a
                      href={`https://wa.me/${normalizarWhatsapp(servicio.whatsapp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 self-start rounded-xl border border-gray-700 px-3.5 py-2 text-xs font-semibold text-gray-300 transition-transform active:scale-95"
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
        <p className="text-center text-sm font-medium text-gray-500">
          Elegí una categoría para ver los servicios disponibles.
        </p>
      )}
    </main>
  );
}
