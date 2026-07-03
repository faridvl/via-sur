"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Categoria,
  FormRegistroServicio,
  Localidad,
  ServicioLocal,
  TipoCobertura,
  USUARIO_ACTUAL_ID,
} from "@/types/viasur";

const COBERTURAS: TipoCobertura[] = Object.values(TipoCobertura);

const FORM_INICIAL: FormRegistroServicio = {
  nombre_servicio: "",
  categoria_id: 0,
  localidad_id: 0,
  cobertura: TipoCobertura.Local,
  direccion_exacta: "",
  whatsapp: "",
  descripcion: "",
};

type EstadoEnvio = "idle" | "enviando" | "exito" | "error";
type EstadoServicioActual = "cargando" | "listo" | "error";

export default function MisServiciosPage() {
  const router = useRouter();

  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargandoFiltros, setCargandoFiltros] = useState<boolean>(true);
  const [errorFiltros, setErrorFiltros] = useState<string | null>(null);

  const [servicioActual, setServicioActual] = useState<ServicioLocal | null>(
    null
  );
  const [estadoServicioActual, setEstadoServicioActual] =
    useState<EstadoServicioActual>("cargando");

  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [form, setForm] = useState<FormRegistroServicio>(FORM_INICIAL);
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvio>("idle");
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

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
    let cancelado = false;

    async function cargarServicioActual() {
      setEstadoServicioActual("cargando");

      try {
        const res = await fetch(
          `/api/servicios?usuario_id=${USUARIO_ACTUAL_ID}`
        );

        if (!res.ok) {
          throw new Error("Respuesta no exitosa del servidor.");
        }

        const data: { servicios: ServicioLocal[] } = await res.json();

        if (!cancelado) {
          setServicioActual(data.servicios?.[0] ?? null);
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
  }, []);

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

    setModoEdicion(true);
    setForm({
      nombre_servicio: servicioActual.nombre_servicio,
      categoria_id: servicioActual.categoria_id,
      localidad_id: servicioActual.localidad_id,
      cobertura: servicioActual.cobertura,
      direccion_exacta: servicioActual.direccion_exacta ?? "",
      whatsapp: servicioActual.whatsapp ?? "",
      descripcion: servicioActual.descripcion ?? "",
    });
    setEstadoEnvio("idle");
    setErrorEnvio(null);
    setDrawerAbierto(true);
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

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
          usuario_id: USUARIO_ACTUAL_ID,
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

  const localidadActual = localidades.find(
    (l) => l.id === servicioActual?.localidad_id
  );
  const categoriaActual = categorias.find(
    (c) => c.id === servicioActual?.categoria_id
  );

  return (
    <main className="flex min-h-screen w-full flex-col gap-6 px-5 pb-10 pt-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex w-fit items-center gap-1.5 rounded-full bg-gray-800 px-3.5 py-2 text-xs font-semibold text-gray-300 transition-transform active:scale-95"
      >
        ← Volver
      </button>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Mis Servicios
        </h1>
        <p className="text-sm text-gray-400">
          Administrá tu negocio publicado en VíaSur.
        </p>
      </header>

      {estadoServicioActual === "cargando" && (
        <div className="flex flex-col items-center gap-2 py-10">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-700 border-t-emerald-400" />
          <p className="text-sm font-medium text-gray-500">Cargando…</p>
        </div>
      )}

      {estadoServicioActual === "error" && (
        <p className="text-center text-sm font-medium text-red-400">
          No se pudo cargar tu información.
        </p>
      )}

      {estadoServicioActual === "listo" && servicioActual && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
            Tu servicio actual
          </h2>

          <article
            className="relative overflow-hidden rounded-xl bg-gray-800 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold tracking-tight text-white">
                  {servicioActual.nombre_servicio}
                </h3>
                <p className="text-xs font-medium text-gray-400">
                  {categoriaActual?.icono} {categoriaActual?.nombre} ·{" "}
                  {localidadActual?.nombre}
                </p>
              </div>

              {servicioActual.es_destacado ? (
                <span className="shrink-0 rounded-full bg-amber-400 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-gray-950 shadow-sm">
                  ✦ Premium
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-gray-700 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-gray-300">
                  Gratuito
                </span>
              )}
            </div>

            {servicioActual.descripcion && (
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                {servicioActual.descripcion}
              </p>
            )}

            <button
              type="button"
              onClick={abrirDrawerEdicion}
              className="mt-4 w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm font-semibold text-gray-200 transition-transform active:scale-95"
            >
              Editar
            </button>
          </article>
        </section>
      )}

      {estadoServicioActual === "listo" && !servicioActual && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-gray-800/60 px-6 py-12 text-center">
          <span className="text-3xl">🏪</span>
          <p className="text-sm font-semibold text-gray-200">
            Todavía no tenés ningún servicio registrado.
          </p>
          <p className="text-xs text-gray-400">
            Publicá tu negocio para que la gente te encuentre.
          </p>
        </div>
      )}

      {(!servicioActual || estadoServicioActual === "listo") && (
        <button
          type="button"
          onClick={abrirDrawerNuevo}
          disabled={cargandoFiltros}
          className="rounded-xl bg-emerald-600 px-4 py-4 text-sm font-bold tracking-tight text-white transition-transform active:scale-95 disabled:opacity-50"
        >
          {servicioActual ? "✨ Registrar otro servicio" : "✨ Registrar Nuevo Servicio"}
        </button>
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
              <button
                type="button"
                onClick={() => setDrawerAbierto(false)}
                className="rounded-full bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-300 transition-transform active:scale-95"
              >
                Cerrar
              </button>
            </div>

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
                        <button
                          key={localidad.id}
                          type="button"
                          onClick={() =>
                            actualizarCampo("localidad_id", localidad.id)
                          }
                          aria-pressed={seleccionada}
                          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all active:scale-95 ${
                            seleccionada
                              ? "border-emerald-500 bg-emerald-500 text-gray-950"
                              : "border-gray-700 bg-gray-800 text-gray-300"
                          }`}
                        >
                          {localidad.nombre}
                        </button>
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
                  className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-emerald-400"
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
                            ? "border-emerald-500/40 bg-emerald-500/10"
                            : "border-gray-700 bg-gray-800"
                        }`}
                      >
                        <span className="text-lg">{categoria.icono}</span>
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
                      <button
                        key={cobertura}
                        type="button"
                        onClick={() => actualizarCampo("cobertura", cobertura)}
                        aria-pressed={seleccionada}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all active:scale-95 ${
                          seleccionada
                            ? "border-emerald-500 bg-emerald-500 text-gray-950"
                            : "border-gray-700 bg-gray-800 text-gray-300"
                        }`}
                      >
                        {cobertura}
                      </button>
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
                  className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-emerald-400"
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
                  className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-emerald-400"
                  placeholder="Ej. 8888-8888"
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
                  className="resize-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-emerald-400"
                  placeholder="Contale a la gente qué ofrecés"
                />
              </label>

              {errorEnvio && (
                <p className="text-sm text-red-400">{errorEnvio}</p>
              )}

              {estadoEnvio === "exito" && (
                <p className="text-sm font-medium text-emerald-400">
                  {modoEdicion
                    ? "¡Servicio actualizado con éxito!"
                    : "¡Servicio registrado con éxito!"}
                </p>
              )}

              <button
                type="submit"
                disabled={estadoEnvio === "enviando"}
                className="rounded-xl bg-emerald-600 px-4 py-4 text-sm font-bold tracking-tight text-white transition-transform active:scale-95 disabled:opacity-50"
              >
                {estadoEnvio === "enviando"
                  ? "Enviando…"
                  : modoEdicion
                    ? "Guardar cambios"
                    : "Registrar servicio"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
