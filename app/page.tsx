"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, Search, Star, X } from "lucide-react";
import { Categoria, ImagenServicio, Localidad, ServicioLocal } from "@/types/viasur";
import LocationSelector from "@/components/LocationSelector";
import PanelBusqueda from "@/components/PanelBusqueda";
import { useBusquedasRecientes } from "@/lib/busquedasRecientes";
import { colorDeCategoria, iconoDeCategoria } from "@/lib/categoriaIconos";
import LogoViaSur from "@/components/LogoViaSur";
import FondoMontanas from "@/components/FondoMontanas";
import WhatsAppButton from "@/components/WhatsAppButton";
import FavoritoBoton from "@/components/FavoritoBoton";

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
  const inputBusquedaRef = useRef<HTMLInputElement>(null);

  // Destacados: siempre los de la localidad actual, sin filtrar por
  // categoría ni búsqueda — se cargan aparte de "servicios" (regulares).
  const [destacados, setDestacados] = useState<ServicioLocal[]>([]);
  const [imagenesDestacados, setImagenesDestacados] = useState<
    Record<string, ImagenServicio[]>
  >({});

  const [servicios, setServicios] = useState<ServicioLocal[]>([]);
  const [imagenes, setImagenes] = useState<Record<string, ImagenServicio[]>>({});
  const [estadoServicios, setEstadoServicios] = useState<EstadoCarga>("idle");

  // Búsqueda por texto: el panel (ver PanelBusqueda) se inserta en el
  // flujo normal de la página, debajo del input, mientras este está
  // enfocado o tiene texto — empuja Categorías/Destacados/Servicios hacia
  // abajo en vez de taparlos. Global, sin importar localidad ni categoría.
  const [buscadorEnfocado, setBuscadorEnfocado] = useState(false);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const panelBusquedaActivo = buscadorEnfocado || textoBusqueda.trim().length > 0;
  const { agregarBusqueda } = useBusquedasRecientes();
  const [resultadosBusqueda, setResultadosBusqueda] = useState<ServicioLocal[]>([]);
  const [imagenesBusqueda, setImagenesBusqueda] = useState<
    Record<string, ImagenServicio[]>
  >({});
  const [estadoBusqueda, setEstadoBusqueda] = useState<EstadoCarga>("idle");

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
        } else {
          const localidadRioClaro = dataLocalidades.localidades?.find(
            (l) => l.nombre === "Río Claro"
          );
          if (localidadRioClaro) {
            setLocalidadId(localidadRioClaro.id);
          } else if (dataLocalidades.localidades?.length) {
            setLocalidadId(dataLocalidades.localidades[0].id);
          }
        }

        // Sin categoría por defecto: al entrar se ven todos los servicios
        // de la localidad. Solo se restaura una categoría si el usuario
        // ya había elegido una en esta misma sesión.
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
  // La categoría es opcional: sin ella se traen todos los servicios
  // de la localidad.
  useEffect(() => {
    if (!localidadId) {
      setServicios([]);
      setImagenes({});
      return;
    }

    let cancelado = false;
    setEstadoServicios("cargando");

    async function cargarServicios() {
      try {
        const params = new URLSearchParams({
          localidad_id: String(localidadId),
        });

        if (categoriaId) {
          params.set("categoria_id", String(categoriaId));
        }

        const res = await fetch(`/api/servicios?${params.toString()}`);

        if (!res.ok) {
          throw new Error("Respuesta no exitosa del servidor.");
        }

        const data: {
          servicios: ServicioLocal[];
          imagenes?: Record<string, ImagenServicio[]>;
        } = await res.json();

        if (!cancelado) {
          setServicios(data.servicios ?? []);
          setImagenes(data.imagenes ?? {});
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

  // Carga de destacados por localidad, siempre sin filtro de categoría:
  // esta sección debe mostrarse igual sin importar qué categoría o texto
  // de búsqueda tenga seleccionado el usuario.
  useEffect(() => {
    if (!localidadId) {
      setDestacados([]);
      setImagenesDestacados({});
      return;
    }

    let cancelado = false;

    async function cargarDestacados() {
      try {
        const res = await fetch(
          `/api/servicios?localidad_id=${localidadId}`
        );

        if (!res.ok) {
          throw new Error("Respuesta no exitosa del servidor.");
        }

        const data: {
          servicios: ServicioLocal[];
          imagenes?: Record<string, ImagenServicio[]>;
        } = await res.json();

        if (!cancelado) {
          setDestacados((data.servicios ?? []).filter((s) => s.es_destacado));
          setImagenesDestacados(data.imagenes ?? {});
        }
      } catch {
        // Silencioso: la sección de destacados simplemente no aparece.
      }
    }

    cargarDestacados();

    return () => {
      cancelado = true;
    };
  }, [localidadId]);

  // Búsqueda por texto: global, sin importar localidad ni categoría
  // seleccionada. Los resultados se muestran en PanelBusqueda, sin
  // afectar las secciones Destacados/Servicios del Home.
  useEffect(() => {
    const consulta = textoBusqueda.trim();

    if (consulta.length < 2) {
      setResultadosBusqueda([]);
      setEstadoBusqueda("idle");
      return;
    }

    let cancelado = false;
    setEstadoBusqueda("cargando");

    const temporizador = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: consulta });
        const res = await fetch(`/api/buscar?${params.toString()}`);

        if (!res.ok) {
          throw new Error("Respuesta no exitosa del servidor.");
        }

        const data: {
          servicios: ServicioLocal[];
          imagenes?: Record<string, ImagenServicio[]>;
        } = await res.json();

        if (!cancelado) {
          setResultadosBusqueda(data.servicios ?? []);
          setImagenesBusqueda(data.imagenes ?? {});
          setEstadoBusqueda("listo");
        }
      } catch {
        if (!cancelado) {
          setEstadoBusqueda("error");
        }
      }
    }, 350);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [textoBusqueda]);

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

  // "Servicios" (sección regular, no destacados) de la categoría
  // seleccionada, o todos sin categoría. Nunca incluye destacados: esos
  // viven en su propia sección, siempre visible. La búsqueda por texto ya
  // no filtra esta sección — vive aparte, en PanelBusqueda.
  const regulares = useMemo(
    () => servicios.filter((s) => !s.es_destacado),
    [servicios]
  );

  const categoriaSeleccionada = categorias.find((c) => c.id === categoriaId);

  return (
    <main className="flex min-h-screen w-full flex-col pb-10">
      {/* Header hero: misma foto de fondo que /login (bahía de Uvita) detrás de marca, ubicación y buscador */}
      <header className="relative overflow-hidden px-5 pb-5 pt-6">
        <div
          className="absolute inset-0 h-48 w-full bg-cover bg-center"
          style={{ backgroundImage: "url(/login-fondo-uvita.jpg)" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 h-48 bg-gradient-to-b from-gray-950/10 via-gray-950/40 to-gray-950" />

        <div className="relative flex flex-col gap-4 pt-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <LogoViaSur className="text-primary-400" size={30} />
              <div className="flex flex-col leading-none">
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="text-white">Vía</span>
                  <span className="text-primary-400">Sur</span>
                </h1>
                <p className="mt-1 text-[10px] font-medium text-gray-300">
                  Servicios y negocios locales del sur de Costa Rica
                </p>
              </div>
            </div>

            <LocationSelector
              localidades={localidades}
              localidadId={localidadId}
              onSeleccionar={setLocalidadId}
            />
          </div>

          <label className="flex items-center gap-2.5 rounded-full border border-gray-700 bg-gray-900/80 px-4 py-3 backdrop-blur-sm">
            <Search
              className="shrink-0 text-gray-400"
              size={18}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <input
              ref={inputBusquedaRef}
              type="text"
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
              onFocus={() => setBuscadorEnfocado(true)}
              placeholder="Buscar servicios o negocios…"
              aria-label="Buscar servicios o negocios"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-400"
            />
            {panelBusquedaActivo && (
              <button
                type="button"
                onClick={() => {
                  setTextoBusqueda("");
                  setBuscadorEnfocado(false);
                  inputBusquedaRef.current?.blur();
                }}
                aria-label="Cerrar búsqueda"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-700 text-gray-300 transition-transform active:scale-90"
              >
                <X size={12} strokeWidth={2.5} aria-hidden="true" />
              </button>
            )}
          </label>
        </div>
      </header>

      {panelBusquedaActivo && (
        <div className="pt-5">
          <PanelBusqueda
            activo={panelBusquedaActivo}
            texto={textoBusqueda}
            onBuscarTexto={setTextoBusqueda}
            onSeleccionarResultado={() => {
              if (textoBusqueda.trim().length >= 2) {
                agregarBusqueda(textoBusqueda);
              }
              setBuscadorEnfocado(false);
            }}
            resultados={resultadosBusqueda}
            imagenes={imagenesBusqueda}
            estado={estadoBusqueda}
            categorias={categorias}
            localidades={localidades}
          />
        </div>
      )}

      <div className={`flex flex-col gap-5 px-5 pt-5 ${panelBusquedaActivo ? "hidden" : ""}`}>
        {/* Categorías — carrusel horizontal, con indicador de scroll */}
        <div className="relative -mx-5">
          <section className="no-scrollbar flex snap-x gap-5 overflow-x-auto px-5 pb-1">
            {categorias.map((categoria) => {
              const seleccionada = categoria.id === categoriaId;
              const Icono = iconoDeCategoria(categoria.nombre);
              const color = colorDeCategoria(categoria.nombre);

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
                  className="flex shrink-0 snap-start flex-col items-center gap-1.5 p-1.5 transition-transform active:scale-95"
                >
                  <span
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${color} transition-opacity ${
                      seleccionada
                        ? "opacity-100 ring-2 ring-white/70 ring-offset-2 ring-offset-gray-950"
                        : "opacity-90"
                    }`}
                  >
                    <Icono
                      className="text-white"
                      size={26}
                      strokeWidth={1.75}
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

          {/* Fade derecho: indica que hay más categorías fuera de pantalla */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-gray-950 to-transparent"
            aria-hidden="true"
          />
        </div>

        {/* Resultados */}
        {localidadId && (
          <section className="flex flex-col gap-8">
            {estadoServicios === "cargando" && (
              <div className="flex flex-col items-center gap-2 py-10">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-700 border-t-primary-400" />
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

            {estadoServicios === "listo" &&
              regulares.length === 0 &&
              destacados.length === 0 && (
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
                    {categoriaSeleccionada
                      ? `Todavía no hay servicios de ${categoriaSeleccionada.nombre} en esta localidad.`
                      : "Todavía no hay servicios registrados en esta localidad."}
                  </p>
                  <p className="text-xs text-gray-400">
                    ¿Tenés un negocio de esta categoría?
                  </p>
                  <Link
                    href="/mis-servicios"
                    className="mt-1 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95"
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
                    const portada = imagenesDestacados[servicio.id]?.[0];

                    return (
                      <div
                        key={servicio.id}
                        className="group block w-[85%] shrink-0 snap-start overflow-hidden rounded-2xl border border-primary-700/40 bg-primary-950/50 shadow-xl shadow-black/30"
                      >
                        <div className="relative">
                          <Link href={`/servicio/${servicio.id}`}>
                            <div
                              className="relative h-48 w-full overflow-hidden bg-gray-900 bg-cover bg-center"
                              style={
                                portada
                                  ? { backgroundImage: `url(${portada.url})` }
                                  : undefined
                              }
                            >
                              {!portada && (
                                <FondoMontanas className="absolute inset-0 h-full w-full" />
                              )}
                              <span className="absolute left-3 top-3 flex items-center gap-1 rounded-lg bg-accent-500 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-white">
                                <Star size={10} strokeWidth={2.5} fill="currentColor" aria-hidden="true" />
                                Destacado
                              </span>
                            </div>
                          </Link>

                          <FavoritoBoton
                            servicioId={servicio.id}
                            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-950/70 backdrop-blur-sm"
                            size={16}
                          />
                        </div>

                        <div className="flex items-center gap-3 p-4">
                          <Link
                            href={`/servicio/${servicio.id}`}
                            className="flex min-w-0 flex-1 flex-col gap-1"
                          >
                            <h3 className="truncate text-base font-bold text-white">
                              {servicio.nombre_servicio}
                            </h3>

                            {servicio.descripcion && (
                              <p className="line-clamp-1 text-sm text-gray-400">
                                {servicio.descripcion}
                              </p>
                            )}

                            {servicio.direccion_exacta && (
                              <p className="flex items-center gap-1 truncate text-[11px] font-medium text-gray-500">
                                <MapPin size={11} strokeWidth={1.75} aria-hidden="true" />
                                {servicio.direccion_exacta}
                              </p>
                            )}
                          </Link>

                          {servicio.whatsapp && (
                            <WhatsAppButton
                              numero={servicio.whatsapp}
                              variante="solido"
                              label=""
                              iconSize={21}
                              className="h-9 w-9 shrink-0 rounded-full p-0"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {regulares.length > 0 && (
              <div className="flex flex-col gap-3">
                {destacados.length > 0 && (
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-700/60 to-transparent" />
                )}
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Servicios
                </h2>
                {regulares.map((servicio) => {
                  const categoria = categorias.find(
                    (c) => c.id === servicio.categoria_id
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
                          {servicio.direccion_exacta && (
                            <p className="flex items-center gap-1 truncate text-[11px] font-medium text-gray-500">
                              <MapPin size={11} strokeWidth={1.75} aria-hidden="true" />
                              {servicio.direccion_exacta}
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
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
