"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Search } from "lucide-react";
import { Categoria, Localidad, ServicioLocal } from "@/types/viasur";
import { normalizarWhatsapp } from "@/lib/whatsapp";
import { iconoDeCategoria } from "@/lib/categoriaIconos";

type EstadoCarga = "cargando" | "listo" | "no-encontrado" | "error";

export default function DetalleServicioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [servicio, setServicio] = useState<ServicioLocal | null>(null);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>("cargando");

  useEffect(() => {
    let cancelado = false;

    async function cargarDetalle() {
      setEstado("cargando");

      try {
        const [resServicio, resLocalidades, resCategorias] =
          await Promise.all([
            fetch(`/api/servicios/${params.id}`),
            fetch("/api/localidades"),
            fetch("/api/categorias"),
          ]);

        if (resServicio.status === 404) {
          if (!cancelado) setEstado("no-encontrado");
          return;
        }

        if (!resServicio.ok || !resLocalidades.ok || !resCategorias.ok) {
          throw new Error("Respuesta no exitosa del servidor.");
        }

        const dataServicio: { servicio: ServicioLocal } =
          await resServicio.json();
        const dataLocalidades: { localidades: Localidad[] } =
          await resLocalidades.json();
        const dataCategorias: { categorias: Categoria[] } =
          await resCategorias.json();

        if (!cancelado) {
          setServicio(dataServicio.servicio);
          setLocalidades(dataLocalidades.localidades ?? []);
          setCategorias(dataCategorias.categorias ?? []);
          setEstado("listo");
        }
      } catch {
        if (!cancelado) {
          setEstado("error");
        }
      }
    }

    if (params.id) {
      cargarDetalle();
    }

    return () => {
      cancelado = true;
    };
  }, [params.id]);

  const localidad = localidades.find((l) => l.id === servicio?.localidad_id);
  const categoria = categorias.find((c) => c.id === servicio?.categoria_id);
  const IconoCategoria = categoria ? iconoDeCategoria(categoria.nombre) : Search;

  return (
    <main className="relative min-h-screen w-full bg-gray-950">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Volver"
        className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-950/60 text-white backdrop-blur-md transition-transform active:scale-95"
      >
        <ArrowLeft size={18} strokeWidth={2} />
      </button>

      {estado === "cargando" && (
        <div className="flex flex-col items-center gap-2 py-16">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-700 border-t-emerald-400" />
          <p className="text-sm font-medium text-gray-500">Cargando…</p>
        </div>
      )}

      {estado === "error" && (
        <p className="px-5 pt-20 text-center text-sm font-medium text-red-400">
          No se pudo cargar la información del negocio.
        </p>
      )}

      {estado === "no-encontrado" && (
        <div className="mx-5 mt-20 flex flex-col items-center gap-3 rounded-xl bg-gray-800/60 px-6 py-14 text-center">
          <Search className="text-gray-500" size={32} strokeWidth={1.5} />
          <p className="text-sm font-semibold text-gray-200">
            Este servicio ya no está disponible.
          </p>
          <Link
            href="/"
            className="mt-1 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95"
          >
            Volver al inicio
          </Link>
        </div>
      )}

      {estado === "listo" && servicio && (
        <div className="flex flex-col pb-32">
          {/* Cabecera: imagen protagonista del negocio (placeholder por categoría) */}
          <div className="relative flex h-56 w-full shrink-0 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-950">
            <IconoCategoria
              className="text-gray-600"
              size={64}
              strokeWidth={1.25}
              aria-hidden="true"
            />

            {servicio.es_destacado && (
              <span className="absolute right-4 top-4 rounded-md bg-gray-950/70 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                Destacado
              </span>
            )}
          </div>

          {/* Información jerárquica del negocio */}
          <div className="flex flex-col gap-5 px-5 pt-6">
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-gray-500">
                {categoria?.nombre} · {localidad?.nombre}
              </p>
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-white">
                {servicio.nombre_servicio}
              </h1>
            </div>

            {servicio.descripcion && (
              <p className="text-sm leading-relaxed text-gray-400">
                {servicio.descripcion}
              </p>
            )}

            <div className="flex flex-col gap-4 border-t border-gray-800 pt-5">
              {servicio.direccion_exacta && (
                <div className="flex items-start gap-3">
                  <MapPin
                    className="mt-0.5 shrink-0 text-gray-500"
                    size={18}
                    strokeWidth={1.75}
                  />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-500">
                      Ubicación
                    </p>
                    <p className="text-sm font-medium text-gray-200">
                      {servicio.direccion_exacta}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-0.5">
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-500">
                  Cobertura
                </p>
                <p className="text-sm font-medium text-gray-200">
                  {servicio.cobertura}
                </p>
              </div>
            </div>
          </div>

          {/* Contacto: card fija en la parte inferior, alto impacto */}
          {servicio.whatsapp && (
            <div className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md border-t border-gray-800 bg-gray-950/95 px-5 py-4 backdrop-blur-md sm:max-w-lg">
              <a
                href={`https://wa.me/${normalizarWhatsapp(servicio.whatsapp)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-4 text-sm font-bold text-white transition-transform active:scale-95"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current"
                  aria-hidden="true"
                >
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2zm5.8 14.15c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2.01.89 2.16.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.28-.12.56.16.28.71 1.17 1.53 1.89 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.26.13.43.19.5.3.06.11.06.62-.18 1.3z" />
                </svg>
                Escribir por WhatsApp
              </a>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
