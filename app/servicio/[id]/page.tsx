"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Categoria, Localidad, ServicioLocal } from "@/types/viasur";
import { normalizarWhatsapp } from "@/lib/whatsapp";

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

  return (
    <main className="flex min-h-screen w-full flex-col gap-6 px-5 pb-10 pt-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex w-fit items-center gap-1.5 rounded-full bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-zinc-600 transition-transform active:scale-95"
      >
        ← Volver
      </button>

      {estado === "cargando" && (
        <div className="flex flex-col items-center gap-2 py-16">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-zinc-400">Cargando…</p>
        </div>
      )}

      {estado === "error" && (
        <p className="text-center text-sm font-medium text-red-500">
          No se pudo cargar la información del negocio.
        </p>
      )}

      {estado === "no-encontrado" && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-zinc-300 bg-white/60 px-6 py-14 text-center">
          <span className="text-3xl">🔎</span>
          <p className="text-sm font-semibold text-zinc-700">
            Este servicio ya no está disponible.
          </p>
          <Link
            href="/"
            className="mt-1 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-transform active:scale-95"
          >
            Volver al inicio
          </Link>
        </div>
      )}

      {estado === "listo" && servicio && (
        <section className="flex flex-col gap-6">
          <div
            className={`relative overflow-hidden rounded-3xl border p-6 shadow-sm ${
              servicio.es_destacado
                ? "border-amber-300/70 bg-gradient-to-br from-amber-50 via-white to-white shadow-amber-900/5"
                : "border-zinc-200/80 bg-white"
            }`}
          >
            {servicio.es_destacado && (
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-300/20 animate-brillo" />
            )}

            <div className="relative flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-4xl">{categoria?.icono}</span>
                  <h1 className="text-xl font-bold leading-tight tracking-tight text-zinc-900">
                    {servicio.nombre_servicio}
                  </h1>
                  <p className="text-xs font-semibold text-zinc-400">
                    {categoria?.nombre} · {localidad?.nombre}
                  </p>
                </div>

                {servicio.es_destacado && (
                  <span className="shrink-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-white shadow-sm">
                    ✦ Destacado
                  </span>
                )}
              </div>

              {servicio.descripcion && (
                <p className="text-sm leading-relaxed text-zinc-600">
                  {servicio.descripcion}
                </p>
              )}

              <dl className="flex flex-col gap-3 border-t border-zinc-100 pt-4">
                {servicio.direccion_exacta && (
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[10.5px] font-bold uppercase tracking-widest text-zinc-400">
                      Ubicación
                    </dt>
                    <dd className="text-sm font-medium text-zinc-700">
                      📍 {servicio.direccion_exacta}
                    </dd>
                  </div>
                )}

                <div className="flex flex-col gap-0.5">
                  <dt className="text-[10.5px] font-bold uppercase tracking-widest text-zinc-400">
                    Cobertura
                  </dt>
                  <dd className="text-sm font-medium text-zinc-700">
                    {servicio.cobertura}
                  </dd>
                </div>
              </dl>

              {servicio.whatsapp && (
                <a
                  href={`https://wa.me/${normalizarWhatsapp(servicio.whatsapp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3.5 text-sm font-bold text-white shadow-sm shadow-[#25D366]/30 transition-transform active:scale-95"
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
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
