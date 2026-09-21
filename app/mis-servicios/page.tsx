"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  Star,
  Eye,
  MessageCircle,
  Phone,
  MoreVertical,
  Camera,
  Settings,
  MapPin,
} from "lucide-react";
import {
  Categoria,
  EstadisticasServicio,
  FormRegistroServicio,
  ImagenServicio,
  Localidad,
  ServicioLocal,
  TipoCobertura,
} from "@/types/viasur";
import { iconoDeCategoria } from "@/lib/categoriaIconos";
import Button from "@/components/Button";
import Typography, { VarianteTypography } from "@/components/Typography";
import LogoViaSur from "@/components/LogoViaSur";
import FondoMontanas from "@/components/FondoMontanas";

const COBERTURAS: TipoCobertura[] = Object.values(TipoCobertura);

const FORM_INICIAL: FormRegistroServicio = {
  nombre_servicio: "",
  categoria_id: 0,
  localidad_id: 0,
  cobertura: TipoCobertura.Local,
  direccion_exacta: "",
  whatsapp: "",
  nombre_contacto: "",
  telefono_alternativo: "",
  descripcion: "",
};

type EstadoEnvio = "idle" | "enviando" | "exito" | "error";
type EstadoServicioActual = "cargando" | "listo" | "error";
type EstadoSesion = "cargando" | "autenticado" | "no-autenticado";

export default function MisServiciosPage() {
  const router = useRouter();

  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [estadoSesion, setEstadoSesion] = useState<EstadoSesion>("cargando");

  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargandoFiltros, setCargandoFiltros] = useState<boolean>(true);
  const [errorFiltros, setErrorFiltros] = useState<string | null>(null);

  const [servicioActual, setServicioActual] = useState<ServicioLocal | null>(
    null
  );
  const [estadoServicioActual, setEstadoServicioActual] =
    useState<EstadoServicioActual>("cargando");
  const [estadisticas, setEstadisticas] = useState<EstadisticasServicio | null>(
    null
  );

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [form, setForm] = useState<FormRegistroServicio>(FORM_INICIAL);
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvio>("idle");
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const [imagenes, setImagenes] = useState<ImagenServicio[]>([]);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState<string | null>(null);
  const inputImagenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelado = false;

    async function verificarSesion() {
      try {
        const res = await fetch("/api/auth/sesion");

        if (!res.ok) {
          if (!cancelado) {
            setEstadoSesion("no-autenticado");
            router.replace("/login");
          }
          return;
        }

        const data: { usuario_id: string } = await res.json();

        if (!cancelado) {
          setUsuarioId(data.usuario_id);
          setEstadoSesion("autenticado");
        }
      } catch {
        if (!cancelado) {
          setEstadoSesion("no-autenticado");
          router.replace("/login");
        }
      }
    }

    verificarSesion();

    return () => {
      cancelado = true;
    };
  }, [router]);

  useEffect(() => {
    let cancelado = false;

    async function cargarFiltros() {
      try {
        const [resLocalidades, resCategorias] = await Promise.all([
          fetch("/api/localidades"),
          fetch("/api/categorias"),
        ]);

        if (!resLocalidades.ok || !resCategorias.ok) {
          throw new Error("Respuesta no exitosa del servidor.");
        }

        const dataLocalidades: { localidades: Localidad[] } =
          await resLocalidades.json();
        const dataCategorias: { categorias: Categoria[] } =
          await resCategorias.json();

        if (!cancelado) {
          setLocalidades(dataLocalidades.localidades);
          setCategorias(dataCategorias.categorias);
        }
      } catch {
        if (!cancelado) {
          setErrorFiltros("No se pudieron cargar los datos del formulario.");
        }
      } finally {
        if (!cancelado) {
          setCargandoFiltros(false);
        }
      }
    }

    cargarFiltros();

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!usuarioId) return;

    let cancelado = false;

    async function cargarServicioActual() {
      setEstadoServicioActual("cargando");

      try {
        const res = await fetch(`/api/servicios?usuario_id=${usuarioId}`);

        if (!res.ok) {
          throw new Error("Respuesta no exitosa del servidor.");
        }

        const data: {
          servicios: ServicioLocal[];
          estadisticas?: Record<string, EstadisticasServicio>;
          imagenes?: Record<string, ImagenServicio[]>;
        } = await res.json();

        const servicio = data.servicios?.[0] ?? null;

        if (!cancelado) {
          setServicioActual(servicio);
          setImagenes(servicio ? data.imagenes?.[servicio.id] ?? [] : []);
          setEstadisticas(
            servicio ? data.estadisticas?.[servicio.id] ?? null : null
          );
          setEstadoServicioActual("listo");
        }
      } catch {
        if (!cancelado) {
          setEstadoServicioActual("error");
        }
      }
    }

    cargarServicioActual();

    return () => {
      cancelado = true;
    };
  }, [usuarioId]);

  function actualizarCampo<K extends keyof FormRegistroServicio>(
    campo: K,
    valor: FormRegistroServicio[K]
  ) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function abrirDrawerNuevo() {
    setModoEdicion(false);
    setForm({
      ...FORM_INICIAL,
      categoria_id: categorias[0]?.id ?? 0,
    });
    setEstadoEnvio("idle");
    setErrorEnvio(null);
    setDrawerAbierto(true);
  }

  function abrirDrawerEdicion() {
    if (!servicioActual) return;

    setMenuAbierto(false);
    setModoEdicion(true);
    setForm({
      nombre_servicio: servicioActual.nombre_servicio,
      categoria_id: servicioActual.categoria_id,
      localidad_id: servicioActual.localidad_id,
      cobertura: servicioActual.cobertura,
      direccion_exacta: servicioActual.direccion_exacta ?? "",
      whatsapp: servicioActual.whatsapp ?? "",
      nombre_contacto: servicioActual.nombre_contacto ?? "",
      telefono_alternativo: servicioActual.telefono_alternativo ?? "",
      descripcion: servicioActual.descripcion ?? "",
    });
    setEstadoEnvio("idle");
    setErrorEnvio(null);
    setDrawerAbierto(true);
  }

  async function agregarImagen(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0] ?? null;
    evento.target.value = "";

    if (!archivo || !servicioActual) return;

    setSubiendoImagen(true);
    setErrorImagen(null);

    try {
      const formDataImagen = new FormData();
      formDataImagen.append("file", archivo);

      const resUpload = await fetch("/api/upload", {
        method: "POST",
        body: formDataImagen,
      });

      if (!resUpload.ok) {
        const dataUpload: { error?: string } = await resUpload
          .json()
          .catch(() => ({}));
        throw new Error(dataUpload.error ?? "No se pudo subir la imagen.");
      }

      const { url }: { url: string } = await resUpload.json();

      const resImagen = await fetch(
        `/api/servicios/${servicioActual.id}/imagenes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }
      );

      if (!resImagen.ok) {
        throw new Error("No se pudo agregar la imagen al servicio.");
      }

      const { imagen }: { imagen: ImagenServicio } = await resImagen.json();
      setImagenes((prev) => [...prev, imagen]);
    } catch (err) {
      setErrorImagen(
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      );
    } finally {
      setSubiendoImagen(false);
    }
  }

  async function eliminarImagen(imagen: ImagenServicio) {
    if (!servicioActual) return;

    try {
      const res = await fetch(
        `/api/servicios/${servicioActual.id}/imagenes/${imagen.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error("No se pudo eliminar la imagen.");
      }

      setImagenes((prev) => prev.filter((img) => img.id !== imagen.id));
    } catch {
      setErrorImagen("No se pudo eliminar la imagen. Intentá de nuevo.");
    }
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!usuarioId) return;

    if (!form.localidad_id) {
      setEstadoEnvio("error");
      setErrorEnvio("Seleccioná una localidad.");
      return;
    }

    if (!form.categoria_id) {
      setEstadoEnvio("error");
      setErrorEnvio("Seleccioná una categoría.");
      return;
    }

    setEstadoEnvio("enviando");
    setErrorEnvio(null);

    try {
      const res = await fetch("/api/servicios", {
        method: modoEdicion ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...(modoEdicion ? { id: servicioActual?.id } : {}),
          usuario_id: usuarioId,
        }),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(
          data.error ??
            (modoEdicion
              ? "No se pudo actualizar el servicio."
              : "No se pudo registrar el servicio.")
        );
      }

      const data: { servicio: ServicioLocal } = await res.json();

      setEstadoEnvio("exito");
      setServicioActual(data.servicio);
      setTimeout(() => setDrawerAbierto(false), 900);
    } catch (err) {
      setEstadoEnvio("error");
      setErrorEnvio(
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      );
    }
  }

  async function eliminarServicio() {
    if (!servicioActual) return;

    const confirmado = window.confirm(
      "¿Seguro que querés eliminar este servicio? Esta acción no se puede deshacer."
    );

    if (!confirmado) return;

    setEliminando(true);

    try {
      const res = await fetch("/api/servicios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: servicioActual.id }),
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar el servicio.");
      }

      setServicioActual(null);
      setEstadisticas(null);
      setMenuAbierto(false);
    } catch {
      window.alert("No se pudo eliminar el servicio. Intentá de nuevo.");
    } finally {
      setEliminando(false);
    }
  }

  const localidadActual = localidades.find(
    (l) => l.id === servicioActual?.localidad_id
  );
  const categoriaActual = categorias.find(
    (c) => c.id === servicioActual?.categoria_id
  );
  const IconoCategoriaActual = categoriaActual
    ? iconoDeCategoria(categoriaActual.nombre)
    : Store;

  async function cerrarSesion() {
    await fetch("/api/auth/cerrar-sesion", { method: "POST" });
    router.replace("/login");
  }

  if (estadoSesion !== "autenticado") {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center gap-2 px-5">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-700 border-t-primary-400" />
        <Typography variante={VarianteTypography.Caption}>Verificando sesión…</Typography>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col gap-6 px-5 pb-10 pt-6">
      <div className="flex items-center justify-between gap-3">
        <Button variante="pill" onClick={() => router.back()}>
          ← Volver
        </Button>

        <Button variante="pill" onClick={cerrarSesion}>
          Cerrar sesión
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LogoViaSur className="text-primary-400" size={26} />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">Vía</span>
            <span className="text-primary-400">Sur</span>
          </span>
        </div>

        {/* Placeholder sin función: no existe pantalla de ajustes todavía. */}
        <button
          type="button"
          disabled
          aria-label="Ajustes (próximamente)"
          title="Ajustes — próximamente"
          className="flex h-9 w-9 items-center justify-center rounded-full text-primary-400 opacity-50"
        >
          <Settings size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <header className="flex flex-col gap-1">
        <Typography variante={VarianteTypography.TituloPagina}>Mis Servicios</Typography>
        <Typography variante={VarianteTypography.Cuerpo}>
          Administrá tu negocio publicado en VíaSur.
        </Typography>
      </header>

      {estadoServicioActual === "cargando" && (
        <div className="flex flex-col items-center gap-2 py-10">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-700 border-t-primary-400" />
          <Typography variante={VarianteTypography.Caption}>Cargando…</Typography>
        </div>
      )}

      {estadoServicioActual === "error" && (
        <Typography variante={VarianteTypography.Error} className="text-center">
          No se pudo cargar tu información.
        </Typography>
      )}

      {estadoServicioActual === "listo" && servicioActual && (
        <section className="flex flex-col gap-3">
          <Typography variante={VarianteTypography.TituloSeccion}>Tu servicio actual</Typography>

          <article className="relative rounded-xl border border-gray-700/60 bg-gray-800 p-4 shadow-lg shadow-black/20 ring-1 ring-inset ring-primary-500/10">
            <div className="flex gap-3">
              <div
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-900 bg-cover bg-center"
                style={
                  imagenes[0]
                    ? { backgroundImage: `url(${imagenes[0].url})` }
                    : undefined
                }
              >
                {!imagenes[0] && (
                  <>
                    <FondoMontanas className="absolute inset-0 h-full w-full" />
                    <div className="relative flex h-full w-full items-center justify-center">
                      <IconoCategoriaActual
                        className="text-white/70"
                        size={28}
                        strokeWidth={1.25}
                        aria-hidden="true"
                      />
                    </div>
                  </>
                )}

                {servicioActual.es_destacado && (
                  <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-accent-500 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white shadow-sm">
                    <Star size={8} strokeWidth={2.5} fill="currentColor" aria-hidden="true" />
                    Destacado
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <Typography variante={VarianteTypography.TituloCard} className="text-base">
                    {servicioActual.nombre_servicio}
                  </Typography>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setMenuAbierto((prev) => !prev)}
                      aria-label="Más opciones"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors active:bg-gray-700"
                    >
                      <MoreVertical size={16} strokeWidth={2} aria-hidden="true" />
                    </button>

                    {menuAbierto && (
                      <div className="absolute right-0 top-8 z-10 w-44 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-xl">
                        <button
                          type="button"
                          onClick={eliminarServicio}
                          disabled={eliminando}
                          className="w-full px-4 py-3 text-left text-sm font-semibold text-red-400 transition-colors active:bg-gray-700 disabled:opacity-50"
                        >
                          {eliminando ? "Eliminando…" : "Eliminar servicio"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <Typography
                  variante={VarianteTypography.Caption}
                  className="flex items-center gap-1.5"
                >
                  <IconoCategoriaActual size={12} strokeWidth={1.75} aria-hidden="true" />
                  {categoriaActual?.nombre}
                </Typography>

                <Typography
                  variante={VarianteTypography.Caption}
                  className="flex items-center gap-1.5"
                >
                  <MapPin size={12} strokeWidth={1.75} aria-hidden="true" />
                  {localidadActual?.nombre}
                </Typography>

                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {/* Placeholder sin función: no hay estados pausado/inactivo en el modelo hoy. */}
                  <span
                    title="Placeholder — sin estados pausado/inactivo todavía"
                    className="flex items-center gap-1 rounded-full bg-success-500/10 px-2 py-0.5 text-[9.5px] font-semibold text-success-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-success-400" />
                    Activo
                  </span>
                  <span className="rounded-full bg-gray-700 px-2 py-0.5 text-[9.5px] font-semibold text-gray-300">
                    Cobertura: {servicioActual.cobertura}
                  </span>
                </div>
              </div>
            </div>

            {servicioActual.descripcion && (
              <Typography variante={VarianteTypography.Cuerpo} className="mt-3">
                {servicioActual.descripcion}
              </Typography>
            )}

            <Button variante="ghost-primary" onClick={abrirDrawerEdicion} className="mt-4">
              Editar
            </Button>
          </article>

          {estadisticas && (
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1 rounded-xl bg-gray-800 p-4 text-center">
                <Eye className="text-primary-400" size={18} strokeWidth={1.75} aria-hidden="true" />
                <Typography variante={VarianteTypography.TituloCard} as="span">
                  {estadisticas.visitas}
                </Typography>
                <Typography variante={VarianteTypography.Caption} className="text-[10px]">
                  Visitas al perfil
                </Typography>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-gray-800 p-4 text-center">
                <MessageCircle className="text-success-400" size={18} strokeWidth={1.75} aria-hidden="true" />
                <Typography variante={VarianteTypography.TituloCard} as="span">
                  {estadisticas.contactos}
                </Typography>
                <Typography variante={VarianteTypography.Caption} className="text-[10px]">
                  Contactos
                </Typography>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-gray-800 p-4 text-center">
                <Phone className="text-primary-400" size={18} strokeWidth={1.75} aria-hidden="true" />
                <Typography variante={VarianteTypography.TituloCard} as="span">
                  {estadisticas.llamadas}
                </Typography>
                <Typography variante={VarianteTypography.Caption} className="text-[10px]">
                  Llamadas
                </Typography>
              </div>
            </div>
          )}
        </section>
      )}

      {estadoServicioActual === "listo" && !servicioActual && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-gray-800/60 px-6 py-12 text-center">
          <Store className="text-gray-500" size={32} strokeWidth={1.5} />
          <Typography variante={VarianteTypography.Label} as="p">
            Todavía no tenés ningún servicio registrado.
          </Typography>
          <Typography variante={VarianteTypography.Caption}>
            Publicá tu negocio para que la gente te encuentre.
          </Typography>
        </div>
      )}

      {estadoServicioActual === "listo" && servicioActual && (
        <div className="relative overflow-hidden rounded-xl bg-gray-950">
          <FondoMontanas className="absolute inset-0 h-full w-full" />
          <div className="relative flex flex-col items-center gap-3 px-6 py-10 text-center">
            <button
              type="button"
              onClick={abrirDrawerNuevo}
              disabled={cargandoFiltros}
              aria-label="Registrar otro servicio"
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary-500 text-primary-400 transition-transform active:scale-95 disabled:opacity-50"
            >
              <span className="text-lg leading-none">+</span>
            </button>
            <Typography variante={VarianteTypography.Label} as="p">
              ¿Querés registrar otro servicio?
            </Typography>
            <Typography variante={VarianteTypography.Caption}>
              Si tenés más de un negocio o servicio, podés agregarlo desde aquí.
            </Typography>
            <Button
              variante="primary"
              onClick={abrirDrawerNuevo}
              disabled={cargandoFiltros}
              className="mt-1"
            >
              Registrar Nuevo Servicio
            </Button>
          </div>
        </div>
      )}

      {(!servicioActual || estadoServicioActual === "listo") &&
        !servicioActual && (
          <Button
            variante="primary"
            onClick={abrirDrawerNuevo}
            disabled={cargandoFiltros}
          >
            Registrar Nuevo Servicio
          </Button>
        )}

      {/* Drawer móvil */}
      {drawerAbierto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setDrawerAbierto(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-[2rem] bg-gray-900 shadow-2xl sm:max-w-lg">
            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
              <h2 className="text-base font-bold tracking-tight text-white">
                {modoEdicion ? "Editar servicio" : "Nuevo servicio"}
              </h2>
              <Button variante="pill" onClick={() => setDrawerAbierto(false)}>
                Cerrar
              </Button>
            </div>

            {modoEdicion && servicioActual && (
              <div className="flex flex-col gap-2 border-b border-gray-800 px-5 py-5">
                <span className="text-sm font-semibold text-gray-200">
                  Fotos del negocio
                </span>
                <div className="flex flex-wrap gap-2">
                  {imagenes.map((imagen) => (
                    <div
                      key={imagen.id}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-800"
                    >
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${imagen.url})` }}
                      />
                      <button
                        type="button"
                        onClick={() => eliminarImagen(imagen)}
                        aria-label="Quitar imagen"
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-950/80 text-white"
                      >
                        <span className="text-xs leading-none">×</span>
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => inputImagenRef.current?.click()}
                    disabled={subiendoImagen}
                    className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-700 text-gray-500 transition-colors active:bg-gray-800 disabled:opacity-50"
                  >
                    <Camera size={18} strokeWidth={1.75} aria-hidden="true" />
                    <span className="text-[10px] font-medium">
                      {subiendoImagen ? "Subiendo…" : "Agregar"}
                    </span>
                  </button>
                  <input
                    ref={inputImagenRef}
                    type="file"
                    accept="image/*"
                    onChange={agregarImagen}
                    className="hidden"
                  />
                </div>
                {errorImagen && (
                  <p className="text-xs text-red-400">{errorImagen}</p>
                )}
              </div>
            )}

            <form
              onSubmit={manejarEnvio}
              className="flex flex-col gap-6 overflow-y-auto px-5 py-6"
            >
              {/* Localidad */}
              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-semibold text-gray-200">
                  Localidad
                </legend>

                {cargandoFiltros && (
                  <p className="text-sm text-gray-500">
                    Cargando localidades…
                  </p>
                )}

                {errorFiltros && (
                  <p className="text-sm text-red-400">{errorFiltros}</p>
                )}

                {!cargandoFiltros && !errorFiltros && (
                  <div className="grid grid-cols-2 gap-2">
                    {localidades.map((localidad) => {
                      const seleccionada = form.localidad_id === localidad.id;

                      return (
                        <Button
                          key={localidad.id}
                          variante="toggle"
                          activo={seleccionada}
                          onClick={() =>
                            actualizarCampo("localidad_id", localidad.id)
                          }
                          aria-pressed={seleccionada}
                        >
                          {localidad.nombre}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </fieldset>

              {/* Nombre del servicio */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-200">
                  Nombre del servicio
                </span>
                <input
                  type="text"
                  required
                  value={form.nombre_servicio}
                  onChange={(e) =>
                    actualizarCampo("nombre_servicio", e.target.value)
                  }
                  className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-primary-400"
                  placeholder="Ej. Soda Doña Marta"
                />
              </label>

              {/* Categoría — grid de botones */}
              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-semibold text-gray-200">
                  Categoría
                </legend>
                <div className="grid grid-cols-4 gap-2">
                  {categorias.map((categoria) => {
                    const seleccionada = form.categoria_id === categoria.id;
                    const IconoCategoria = iconoDeCategoria(categoria.nombre);

                    return (
                      <button
                        key={categoria.id}
                        type="button"
                        onClick={() =>
                          actualizarCampo("categoria_id", categoria.id)
                        }
                        aria-pressed={seleccionada}
                        className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-all active:scale-95 ${
                          seleccionada
                            ? "border-primary-500/40 bg-primary-500/10"
                            : "border-gray-700 bg-gray-800"
                        }`}
                      >
                        <IconoCategoria
                          className={seleccionada ? "text-primary-400" : "text-gray-400"}
                          size={20}
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        <span className="text-[9.5px] font-semibold leading-tight text-gray-400">
                          {categoria.nombre}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Cobertura */}
              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-semibold text-gray-200">
                  Cobertura
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {COBERTURAS.map((cobertura) => {
                    const seleccionada = form.cobertura === cobertura;

                    return (
                      <Button
                        key={cobertura}
                        variante="toggle"
                        activo={seleccionada}
                        onClick={() => actualizarCampo("cobertura", cobertura)}
                        aria-pressed={seleccionada}
                      >
                        {cobertura}
                      </Button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Dirección exacta */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-200">
                  Dirección exacta
                </span>
                <input
                  type="text"
                  value={form.direccion_exacta}
                  onChange={(e) =>
                    actualizarCampo("direccion_exacta", e.target.value)
                  }
                  className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-primary-400"
                  placeholder="Ej. 100m sur del parque central"
                />
              </label>

              {/* WhatsApp */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-200">
                  WhatsApp
                </span>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => actualizarCampo("whatsapp", e.target.value)}
                  className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-primary-400"
                  placeholder="Ej. 8888-8888"
                />
              </label>

              {/* Nombre de contacto */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-200">
                  Nombre de contacto
                </span>
                <input
                  type="text"
                  value={form.nombre_contacto}
                  onChange={(e) =>
                    actualizarCampo("nombre_contacto", e.target.value)
                  }
                  className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-primary-400"
                  placeholder="Ej. Doña Marta"
                />
              </label>

              {/* Teléfono para llamadas */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-200">
                  Teléfono para llamadas
                </span>
                <input
                  type="tel"
                  value={form.telefono_alternativo}
                  onChange={(e) =>
                    actualizarCampo("telefono_alternativo", e.target.value)
                  }
                  className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-primary-400"
                  placeholder="Ej. 8888-8888 (si es distinto del WhatsApp)"
                />
              </label>

              {/* Descripción */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-200">
                  Descripción
                </span>
                <textarea
                  value={form.descripcion}
                  onChange={(e) =>
                    actualizarCampo("descripcion", e.target.value)
                  }
                  rows={4}
                  className="resize-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-primary-400"
                  placeholder="Contale a la gente qué ofrecés"
                />
              </label>

              {errorEnvio && (
                <p className="text-sm text-red-400">{errorEnvio}</p>
              )}

              {estadoEnvio === "exito" && (
                <p className="text-sm font-medium text-success-400">
                  {modoEdicion
                    ? "¡Servicio actualizado con éxito!"
                    : "¡Servicio registrado con éxito!"}
                </p>
              )}

              <Button type="submit" disabled={estadoEnvio === "enviando"}>
                {estadoEnvio === "enviando"
                  ? "Enviando…"
                  : modoEdicion
                    ? "Guardar cambios"
                    : "Registrar servicio"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
