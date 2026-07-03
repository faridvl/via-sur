"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Categoria, Localidad, ServicioLocal } from "@/types/viasur";
import { normalizarWhatsapp } from "@/lib/whatsapp";

type EstadoBusqueda = "idle" | "cargando" | "listo" | "error";

export default function BuscarPage() {
  const router = useRouter();

  const [texto, setTexto] = useState("");
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [resultados, setResultados] = useState<ServicioLocal[]>([]);
  const [estado, setEstado] = useState<EstadoBusqueda>("idle");

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
        // Silencioso: solo afecta los metadatos mostrados en resultados.
      }
    }

    cargarFiltros();

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    const consulta = texto.trim();

    if (consulta.length < 2) {
      setResultados([]);
      setEstado("idle");
      return;
    }

    let cancelado = false;
    setEstado("cargando");

    const temporizador = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/buscar?q=${encodeURIComponent(consulta)}`
        );

        if (!res.ok) {
          throw new Error("Respuesta no exitosa del servidor.");
        }

        const data: { servicios: ServicioLocal[] } = await res.json();

        if (!cancelado) {
          setResultados(data.servicios ?? []);
          setEstado("listo");
        }
      } catch {
        if (!cancelado) {
          setEstado("error");
        }
      }
    }, 350);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [texto]);

  return (
    <main className="flex min-h-screen w-full flex-col gap-6 px-5 pb-10 pt-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex w-fit items-center gap-1.5 rounded-full bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-zinc-600 transition-transform active:scale-95"
      >
        ← Volver
      </button>

      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Buscar
        </h1>

        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            🔍
          </span>
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscá un negocio por nombre…"
            autoFocus
            className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm text-zinc-900 outline-none focus:border-indigo-600"
          />
        </div>
      </header>

      {estado === "idle" && (
        <p className="text-center text-sm font-medium text-zinc-400">
          Escribí al menos 2 letras para empezar a buscar.
        </p>
      )}

      {estado === "cargando" && (
        <div className="flex flex-col items-center gap-2 py-10">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-zinc-400">Buscando…</p>
        </div>
      )}

      {estado === "error" && (
        <p className="text-center text-sm font-medium text-red-500">
          No se pudo completar la búsqueda.
        </p>
      )}

      {estado === "listo" && resultados.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-zinc-300 bg-white/60 px-6 py-12 text-center">
          <span className="text-3xl">🔎</span>
          <p className="text-sm font-semibold text-zinc-700">
            No encontramos negocios con ese nombre.
          </p>
        </div>
      )}

      {estado === "listo" && resultados.length > 0 && (
        <section className="flex flex-col gap-3">
          {resultados.map((servicio) => {
            const localidad = localidades.find(
              (l) => l.id === servicio.localidad_id
            );
            const categoria = categorias.find(
              (c) => c.id === servicio.categoria_id
            );

            return (
              <Link
                key={servicio.id}
                href={`/servicio/${servicio.id}`}
                className={`flex flex-col gap-1.5 rounded-2xl border p-4 transition-transform active:scale-[0.98] ${
                  servicio.es_destacado
                    ? "border-amber-300/70 bg-gradient-to-br from-amber-50 via-white to-white"
                    : "border-zinc-200/80 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-zinc-900">
                    {servicio.nombre_servicio}
                  </h3>
                  {servicio.es_destacado && (
                    <span className="shrink-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
                      ✦ Destacado
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-zinc-400">
                  {categoria?.icono} {categoria?.nombre} · {localidad?.nombre}
                </p>
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
            );
          })}
        </section>
      )}
    </main>
  );
}
