"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Search, User } from "lucide-react";
import { Categoria, ImagenServicio, Localidad, ServicioLocal } from "@/types/viasur";
import { iconoDeCategoria } from "@/lib/categoriaIconos";
import { registrarEvento } from "@/lib/eventos";
import WhatsAppButton from "@/components/WhatsAppButton";
import LlamarButton from "@/components/LlamarButton";
import FavoritoBoton from "@/components/FavoritoBoton";

type EstadoCarga = "cargando" | "listo" | "no-encontrado" | "error";

export default function DetalleServicioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [servicio, setServicio] = useState<ServicioLocal | null>(null);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagenes, setImagenes] = useState<ImagenServicio[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>("cargando");
  const visitaRegistrada = useRef(false);

  useEffect(() => {
    let cancelado = false;

    async function cargarDetalle() {
      setEstado("cargando");

      try {
        const [resServicio, resLocalidades, resCategorias, resImagenes] =
          await Promise.all([
            fetch(`/api/servicios/${params.id}`),
            fetch("/api/localidades"),
            fetch("/api/categorias"),
            fetch(`/api/servicios/${params.id}/imagenes`),
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
        const dataImagenes: { imagenes: ImagenServicio[] } = resImagenes.ok
          ? await resImagenes.json()
          : { imagenes: [] };

        if (!cancelado) {
          setServicio(dataServicio.servicio);
          setLocalidades(dataLocalidades.localidades ?? []);
          setCategorias(dataCategorias.categorias ?? []);
          setImagenes(dataImagenes.imagenes ?? []);
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

  useEffect(() => {
    if (estado === "listo" && servicio && !visitaRegistrada.current) {
      visitaRegistrada.current = true;
      registrarEvento(servicio.id, "visita");
    }
  }, [estado, servicio]);

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

      {estado === "listo" && servicio && (
        <FavoritoBoton
          servicioId={servicio.id}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-950/60 backdrop-blur-md"
        />
      )}

      {estado === "cargando" && (
        <div className="flex flex-col items-center gap-2 py-16">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-700 border-t-primary-400" />
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
            className="mt-1 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95"
          >
            Volver al inicio
          </Link>
        </div>
      )}

      {estado === "listo" && servicio && (
        <div className="flex flex-col pb-32">
          {/* Cabecera: carrusel de fotos reales del negocio, o ícono de categoría como fallback */}
          <div className="relative h-56 w-full shrink-0">
            {imagenes.length > 0 ? (
              <div className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto">
                {imagenes.map((imagen) => (
                  <div
                    key={imagen.id}
                    className="h-full w-full shrink-0 snap-start bg-cover bg-center"
                    style={{ backgroundImage: `url(${imagen.url})` }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-950">
                <IconoCategoria
                  className="text-gray-600"
                  size={64}
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
              </div>
            )}

            {servicio.es_destacado && (
              <span className="pointer-events-none absolute right-4 top-4 rounded-md bg-gray-950/70 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
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

              {servicio.nombre_contacto && (
                <div className="flex items-start gap-3">
                  <User
                    className="mt-0.5 shrink-0 text-gray-500"
                    size={18}
                    strokeWidth={1.75}
                  />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-500">
                      Contacto
                    </p>
                    <p className="text-sm font-medium text-gray-200">
                      {servicio.nombre_contacto}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contacto: card fija en la parte inferior, alto impacto */}
          {(servicio.whatsapp || servicio.telefono_alternativo) && (
            <div className="fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-md gap-2 border-t border-gray-800 bg-gray-950/95 px-5 py-4 backdrop-blur-md sm:max-w-lg">
              {servicio.whatsapp && (
                <WhatsAppButton
                  numero={servicio.whatsapp}
                  label="Escribir por WhatsApp"
                  onClick={() => registrarEvento(servicio.id, "contacto")}
                  className="flex-[2] px-4 py-4 text-sm font-bold"
                />
              )}
              {servicio.telefono_alternativo && (
                <LlamarButton
                  numero={servicio.telefono_alternativo}
                  onClick={() => registrarEvento(servicio.id, "llamada")}
                  className="flex-1 px-4 py-4 text-sm font-bold"
                />
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
