"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { Categoria, ImagenServicio, Localidad, ServicioLocal } from "@/types/viasur";
import { iconoDeCategoria } from "@/lib/categoriaIconos";
import { useFavoritos } from "@/lib/favoritos";
import FondoMontanas from "@/components/FondoMontanas";
import FavoritoBoton from "@/components/FavoritoBoton";
import WhatsAppButton from "@/components/WhatsAppButton";

type EstadoCarga = "cargando" | "listo" | "error";

export default function FavoritosPage() {
  const { favoritos } = useFavoritos();

  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [servicios, setServicios] = useState<ServicioLocal[]>([]);
  const [imagenes, setImagenes] = useState<Record<string, ImagenServicio[]>>({});
  const [estado, setEstado] = useState<EstadoCarga>("cargando");

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

        if (!cancelado) {
          setLocalidades(dataLocalidades.localidades ?? []);
          setCategorias(dataCategorias.categorias ?? []);
        }
      } catch {
        // Silencioso: solo afecta el ícono/contexto mostrado en cada fila.
      }
    }

    cargarFiltros();

    return () => {
      cancelado = true;
    };
  }, []);

  // Resuelve cada ID guardado en localStorage contra su servicio real.
  // Sin endpoint batch: la cantidad esperada de favoritos es chica, igual
  // que el detalle del servicio ya resuelve sus datos con fetches en paralelo.
  useEffect(() => {
    let cancelado = false;
    setEstado("cargando");

    async function cargarFavoritos() {
      if (favoritos.length === 0) {
        if (!cancelado) {
          setServicios([]);
          setImagenes({});
          setEstado("listo");
        }
        return;
      }

      try {
        const resultados = await Promise.all(
          favoritos.map(async (id) => {
            const [resServicio, resImagenes] = await Promise.all([
              fetch(`/api/servicios/${id}`),
              fetch(`/api/servicios/${id}/imagenes`),
            ]);

            if (!resServicio.ok) return null;

            const dataServicio: { servicio: ServicioLocal } =
              await resServicio.json();
            const dataImagenes: { imagenes: ImagenServicio[] } = resImagenes.ok
              ? await resImagenes.json()
              : { imagenes: [] };

            return { servicio: dataServicio.servicio, imagenes: dataImagenes.imagenes ?? [] };
          })
        );

        if (cancelado) return;

        const encontrados = resultados.filter(
          (r): r is { servicio: ServicioLocal; imagenes: ImagenServicio[] } =>
            r !== null
        );

        setServicios(encontrados.map((r) => r.servicio));
        setImagenes(
          Object.fromEntries(encontrados.map((r) => [r.servicio.id, r.imagenes]))
        );
        setEstado("listo");
      } catch {
        if (!cancelado) {
          setEstado("error");
        }
      }
    }

    cargarFavoritos();

    return () => {
      cancelado = true;
    };
  }, [favoritos]);

  return (
    <main className="flex min-h-screen w-full flex-col gap-5 px-5 pb-10 pt-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Favoritos
        </h1>
        <p className="text-sm text-gray-400">
          Los negocios que guardaste, a mano para volver rápido.
        </p>
      </header>

      {estado === "cargando" && (
        <div className="flex flex-col items-center gap-2 py-10">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-700 border-t-primary-400" />
          <p className="text-sm font-medium text-gray-400">Cargando…</p>
        </div>
      )}

      {estado === "error" && (
        <p className="text-center text-sm font-medium text-red-400">
          No se pudieron cargar tus favoritos.
        </p>
      )}

      {estado === "listo" && servicios.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-gray-800/60 px-6 py-14 text-center">
          <Heart className="text-gray-500" size={32} strokeWidth={1.5} />
          <p className="text-sm font-semibold text-gray-200">
            Todavía no guardaste ningún negocio.
          </p>
          <p className="text-xs text-gray-400">
            Tocá el corazón en cualquier servicio para guardarlo acá.
          </p>
        </div>
      )}

      {estado === "listo" && servicios.length > 0 && (
        <section className="flex flex-col gap-3">
          {servicios.map((servicio) => {
            const localidad = localidades.find(
              (l) => l.id === servicio.localidad_id
            );
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
                className="flex items-center gap-3 rounded-xl border border-gray-700/60 bg-gray-800 p-3 shadow-md shadow-black/20 transition-transform active:scale-[0.98]"
              >
                <Link
                  href={`/servicio/${servicio.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <div
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-900 bg-cover bg-center"
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
                    <p className="truncate text-[11px] font-medium text-gray-500">
                      {categoria?.nombre} · {localidad?.nombre}
                    </p>
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
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900"
                />

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
            );
          })}
        </section>
      )}
    </main>
  );
}
