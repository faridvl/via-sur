"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  CategoriaServicio,
  FormRegistroServicio,
  Localidad,
  TipoCobertura,
} from "@/types/viasur";

const CATEGORIAS: CategoriaServicio[] = Object.values(CategoriaServicio);
const COBERTURAS: TipoCobertura[] = Object.values(TipoCobertura);

const FORM_INICIAL: FormRegistroServicio = {
  nombre_servicio: "",
  tipo_categoria: CategoriaServicio.Otros,
  localidad_id: 0,
  cobertura: TipoCobertura.Local,
  direccion_exacta: "",
  whatsapp: "",
  descripcion: "",
};

type EstadoEnvio = "idle" | "enviando" | "exito" | "error";

export default function RegistrarServicioPage() {
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [cargandoLocalidades, setCargandoLocalidades] = useState<boolean>(true);
  const [errorLocalidades, setErrorLocalidades] = useState<string | null>(null);

  const [form, setForm] = useState<FormRegistroServicio>(FORM_INICIAL);
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvio>("idle");
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarLocalidades() {
      try {
        const res = await fetch("/api/localidades");

        if (!res.ok) {
          throw new Error("Respuesta no exitosa del servidor.");
        }

        const data: { localidades: Localidad[] } = await res.json();

        if (!cancelado) {
          setLocalidades(data.localidades);
        }
      } catch {
        if (!cancelado) {
          setErrorLocalidades("No se pudieron cargar las localidades.");
        }
      } finally {
        if (!cancelado) {
          setCargandoLocalidades(false);
        }
      }
    }

    cargarLocalidades();

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

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!form.localidad_id) {
      setEstadoEnvio("error");
      setErrorEnvio("Seleccioná una localidad.");
      return;
    }

    setEstadoEnvio("enviando");
    setErrorEnvio(null);

    try {
      const res = await fetch("/api/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo registrar el servicio.");
      }

      setEstadoEnvio("exito");
      setForm(FORM_INICIAL);
    } catch (err) {
      setEstadoEnvio("error");
      setErrorEnvio(
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      );
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">
          Registrar servicio
        </h1>
        <p className="text-sm text-slate-500">
          Publicá tu negocio o servicio en VíaSur.
        </p>
      </header>

      <form onSubmit={manejarEnvio} className="flex flex-col gap-6">
        {/* Localidad — selección dinámica */}
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-slate-700">
            Localidad
          </legend>

          {cargandoLocalidades && (
            <p className="text-sm text-slate-400">Cargando localidades…</p>
          )}

          {errorLocalidades && (
            <p className="text-sm text-red-500">{errorLocalidades}</p>
          )}

          {!cargandoLocalidades && !errorLocalidades && (
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
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                      seleccionada
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 active:bg-slate-50"
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
          <span className="text-sm font-semibold text-slate-700">
            Nombre del servicio
          </span>
          <input
            type="text"
            required
            value={form.nombre_servicio}
            onChange={(e) =>
              actualizarCampo("nombre_servicio", e.target.value)
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600"
            placeholder="Ej. Soda Doña Marta"
          />
        </label>

        {/* Categoría */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Categoría
          </span>
          <select
            value={form.tipo_categoria}
            onChange={(e) =>
              actualizarCampo(
                "tipo_categoria",
                e.target.value as CategoriaServicio
              )
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600"
          >
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </label>

        {/* Cobertura */}
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-slate-700">
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
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    seleccionada
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 active:bg-slate-50"
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
          <span className="text-sm font-semibold text-slate-700">
            Dirección exacta
          </span>
          <input
            type="text"
            value={form.direccion_exacta}
            onChange={(e) =>
              actualizarCampo("direccion_exacta", e.target.value)
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600"
            placeholder="Ej. 100m sur del parque central"
          />
        </label>

        {/* WhatsApp */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">
            WhatsApp
          </span>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={(e) => actualizarCampo("whatsapp", e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600"
            placeholder="Ej. 8888-8888"
          />
        </label>

        {/* Descripción */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Descripción
          </span>
          <textarea
            value={form.descripcion}
            onChange={(e) => actualizarCampo("descripcion", e.target.value)}
            rows={4}
            className="resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600"
            placeholder="Contale a la gente qué ofrecés"
          />
        </label>

        {errorEnvio && <p className="text-sm text-red-500">{errorEnvio}</p>}

        {estadoEnvio === "exito" && (
          <p className="text-sm text-emerald-600">
            ¡Servicio registrado con éxito!
          </p>
        )}

        <button
          type="submit"
          disabled={estadoEnvio === "enviando"}
          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors active:bg-emerald-700 disabled:opacity-50"
        >
          {estadoEnvio === "enviando" ? "Enviando…" : "Registrar servicio"}
        </button>
      </form>
    </main>
  );
}
