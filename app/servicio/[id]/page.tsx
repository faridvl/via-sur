"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Clock, Globe2, MapPin, Search, Share, Star, User } from "lucide-react";
import {
  Categoria,
  DIAS_SEMANA_ORDEN,
  ImagenServicio,
  Localidad,
  ServicioLocal,
} from "@/types/viasur";
import { iconoDeCategoria } from "@/lib/categoriaIconos";
import { registrarEvento } from "@/lib/eventos";
import WhatsAppButton from "@/components/WhatsAppButton";
import LlamarButton from "@/components/LlamarButton";
import FavoritoBoton from "@/components/FavoritoBoton";
import FondoMontanas from "@/components/FondoMontanas";
import Typography, { VarianteTypography } from "@/components/Typography";

type EstadoCarga = "cargando" | "listo" | "no-encontrado" | "error";

/**
 * Agrupa los días seleccionados en rangos consecutivos según el orden
 * de la semana (ej. ["Lun","Mar","Mié","Sáb"] → "Lun - Mié, Sáb"), para
 * no listar cada día suelto como hace el mockup ("Lun - Dom").
 */
function formatearDiasAtencion(dias: string[]): string {
  const ordenados = DIAS_SEMANA_ORDEN.filter((d) => dias.includes(d));

  if (ordenados.length === 0) return "";

  const rangos: string[] = [];
  let inicioRango = ordenados[0];
  let anterior = ordenados[0];

  for (let i = 1; i <= ordenados.length; i++) {
    const actual = ordenados[i];
    const esConsecutivo =
      actual &&
      DIAS_SEMANA_ORDEN.indexOf(actual) === DIAS_SEMANA_ORDEN.indexOf(anterior) + 1;

    if (!esConsecutivo) {
      rangos.push(
        inicioRango === anterior ? inicioRango : `${inicioRango} - ${anterior}`
      );
      inicioRango = actual;
    }

    anterior = actual;
  }

  return rangos.join(", ");
}

/** Convierte "HH:MM:SS" (formato `time` de Postgres) a "h:mm a.m./p.m." */
function formatearHora(hora: string): string {
  const [horasStr, minutosStr] = hora.split(":");
  const horas = Number(horasStr);
  const minutos = minutosStr;
  const periodo = horas >= 12 ? "p.m." : "a.m.";
  const horas12 = horas % 12 === 0 ? 12 : horas % 12;

  return `${horas12}:${minutos} ${periodo}`;
}

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

  // Si el negocio solo cargó uno de los dos números, se asume que también
  // sirve para el otro medio de contacto — no debería quedar sin botón de
  // WhatsApp o de llamada por haber completado un solo campo.
  const numeroWhatsapp = servicio?.whatsapp || servicio?.telefono_alternativo;
  const numeroLlamada = servicio?.telefono_alternativo || servicio?.whatsapp;

  return (
    <main className="relative min-h-screen w-full">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Volver"
        className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-950/60 text-white backdrop-blur-md transition-transform active:scale-95"
      >
        <ArrowLeft size={18} strokeWidth={2} />
      </button>

      {estado === "listo" && servicio && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: servicio.nombre_servicio,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard?.writeText(window.location.href);
              }
            }}
            aria-label="Compartir"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950/60 text-white backdrop-blur-md transition-transform active:scale-95"
          >
            <Share size={16} strokeWidth={2} />
          </button>
          <FavoritoBoton
            servicioId={servicio.id}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950/60 backdrop-blur-md"
          />
        </div>
      )}

      {estado === "cargando" && (
        <div className="flex flex-col items-center gap-2 py-16">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-700 border-t-primary-400" />
          <Typography variante={VarianteTypography.Caption}>Cargando…</Typography>
        </div>
      )}

      {estado === "error" && (
        <Typography
          variante={VarianteTypography.Error}
          className="px-5 pt-20 text-center"
        >
          No se pudo cargar la información del negocio.
        </Typography>
      )}

      {estado === "no-encontrado" && (
        <div className="mx-5 mt-20 flex flex-col items-center gap-3 rounded-xl bg-gray-800/60 px-6 py-14 text-center">
          <Search className="text-gray-500" size={32} strokeWidth={1.5} />
          <Typography variante={VarianteTypography.Label} as="p">
            Este servicio ya no está disponible.
          </Typography>
          <Link
            href="/"
            className="mt-1 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95"
          >
            Volver al inicio
          </Link>
        </div>
      )}

      {estado === "listo" && servicio && (
        <div className="flex flex-col pb-44">
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
              <div className="relative h-full w-full overflow-hidden bg-gray-900">
                <FondoMontanas className="absolute inset-0 h-full w-full" />
                <div className="relative flex h-full w-full items-center justify-center">
                  <IconoCategoria
                    className="text-white/70"
                    size={56}
                    strokeWidth={1.25}
                    aria-hidden="true"
                  />
                </div>
              </div>
            )}

            {/* Degradado inferior: da profundidad y asegura contraste con el contenido que sigue */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-950 to-transparent" />

            {servicio.es_destacado && (
              <span className="pointer-events-none absolute left-4 top-4 flex items-center gap-1 rounded-lg bg-accent-500 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-white shadow-lg shadow-accent-500/30">
                <Star size={10} strokeWidth={2.5} fill="currentColor" aria-hidden="true" />
                Destacado
              </span>
            )}
          </div>

          {/* Información jerárquica del negocio */}
          <div className="flex flex-col gap-6 px-5 pt-6">
            <div className="flex flex-col gap-2">
              <Typography
                variante={VarianteTypography.Label}
                as="p"
                className="flex items-center gap-1.5 text-gray-400"
              >
                <IconoCategoria size={16} strokeWidth={1.75} aria-hidden="true" />
                {categoria?.nombre}
              </Typography>
              <Typography variante={VarianteTypography.TituloPagina}>
                {servicio.nombre_servicio}
              </Typography>
              <Typography
                variante={VarianteTypography.Label}
                as="p"
                className="flex items-center gap-1.5 text-primary-400"
              >
                <MapPin size={15} strokeWidth={1.75} aria-hidden="true" />
                {localidad?.nombre}
              </Typography>
            </div>

            {servicio.descripcion && (
              <Typography variante={VarianteTypography.Cuerpo}>
                {servicio.descripcion}
              </Typography>
            )}

            <div className="flex flex-col gap-5">
              {servicio.direccion_exacta && (
                <div className="flex items-center gap-3">
                  <MapPin className="shrink-0 text-primary-400" size={22} strokeWidth={2} aria-hidden="true" />
                  <div className="flex flex-col gap-0.5">
                    <Typography variante={VarianteTypography.Label}>
                      Dirección
                    </Typography>
                    <Typography variante={VarianteTypography.Cuerpo} className="leading-snug">
                      {servicio.direccion_exacta}
                    </Typography>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Globe2 className="shrink-0 text-primary-400" size={22} strokeWidth={2} aria-hidden="true" />
                <div className="flex flex-col gap-0.5">
                  <Typography variante={VarianteTypography.Label}>
                    Cobertura
                  </Typography>
                  <Typography variante={VarianteTypography.Cuerpo} className="leading-snug">
                    {servicio.cobertura}
                  </Typography>
                </div>
              </div>

              {servicio.nombre_contacto && (
                <div className="flex items-center gap-3">
                  <User className="shrink-0 text-primary-400" size={22} strokeWidth={2} aria-hidden="true" />
                  <div className="flex flex-col gap-0.5">
                    <Typography variante={VarianteTypography.Label}>
                      Contacto
                    </Typography>
                    <Typography variante={VarianteTypography.Cuerpo} className="leading-snug">
                      {servicio.nombre_contacto}
                    </Typography>
                  </div>
                </div>
              )}
            </div>

            {servicio.dias_atencion?.length && servicio.hora_apertura && servicio.hora_cierre && (
              <button
                type="button"
                className="flex flex-col gap-1.5 rounded-xl border border-primary-700/40 bg-primary-950/50 px-4 py-3.5 text-left shadow-md shadow-black/20 transition-transform active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <Typography
                    variante={VarianteTypography.Label}
                    as="p"
                    className="flex items-center gap-1.5"
                  >
                    <Clock size={15} strokeWidth={1.75} aria-hidden="true" />
                    Horarios
                  </Typography>
                  <ChevronRight size={16} strokeWidth={2} className="text-gray-600" aria-hidden="true" />
                </div>
                <Typography variante={VarianteTypography.Cuerpo} className="pl-[24px] leading-snug">
                  {formatearDiasAtencion(servicio.dias_atencion)}
                  {"  "}
                  {formatearHora(servicio.hora_apertura)} - {formatearHora(servicio.hora_cierre)}
                </Typography>
              </button>
            )}
          </div>

          {/* Contacto: card fija en la parte inferior, alto impacto */}
          {(numeroWhatsapp || numeroLlamada) && (
            <div className="fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-md flex-col gap-3 border-t border-gray-800 bg-gray-950/95 px-5 py-4 backdrop-blur-md sm:max-w-lg">
              {numeroWhatsapp && (
                <WhatsAppButton
                  numero={numeroWhatsapp}
                  variante="pastilla"
                  label="Escribir por WhatsApp"
                  onClick={() => registrarEvento(servicio.id, "contacto")}
                  className="w-full px-4 py-4 text-sm font-bold"
                />
              )}
              {numeroLlamada && (
                <LlamarButton
                  numero={numeroLlamada}
                  variante="pastilla"
                  onClick={() => registrarEvento(servicio.id, "llamada")}
                  className="w-full px-4 py-4 text-sm font-bold"
                />
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
