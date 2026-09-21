"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Mail, Send } from "lucide-react";
import Button from "@/components/Button";
import LogoViaSur from "@/components/LogoViaSur";

type Estado = "idle" | "enviando" | "enviado" | "error";

export default function IniciarSesionPage() {
  return (
    <Suspense fallback={null}>
      <FormularioIniciarSesion />
    </Suspense>
  );
}

function FormularioIniciarSesion() {
  const searchParams = useSearchParams();
  const enlaceInvalido = searchParams.get("error") === "enlace-invalido";

  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [error, setError] = useState<string | null>(null);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEstado("enviando");
    setError(null);

    try {
      const res = await fetch("/api/auth/solicitar-enlace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo enviar el enlace.");
      }

      setEstado("enviado");
    } catch (err) {
      setEstado("error");
      setError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      );
    }
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-gray-950">
      {/* Foto: bahía de Uvita, Puntarenas (Pacífico Sur CR) — Bernd Dittrich / Unsplash License */}
      <div
        className="absolute inset-0 h-full w-full bg-cover bg-center"
        style={{ backgroundImage: "url(/login-fondo-uvita.jpg)" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/55 via-gray-950/50 to-gray-950/85" />

      <div className="relative flex min-h-screen w-full flex-col gap-10 px-6 pb-10 pt-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <LogoViaSur className="text-primary-400" size={40} />
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-white">Vía</span>
            <span className="text-primary-400">Sur</span>
          </h1>
          <p className="text-sm text-gray-200">
            Servicios y negocios locales del sur de Costa Rica
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-4">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Iniciar sesión
          </h2>
          <p className="-mt-2 text-sm text-gray-300">
            Te enviamos un enlace a tu correo y listo. Sin contraseñas.
          </p>

          <form onSubmit={manejarEnvio} className="flex flex-col gap-2 pt-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-200">
                Correo electrónico
              </span>
              <span className="relative flex items-center">
                <Mail
                  className="pointer-events-none absolute left-4 text-gray-500"
                  size={18}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={estado === "enviado"}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-primary-400 disabled:opacity-60"
                />
              </span>
            </label>

            {enlaceInvalido && (
              <p className="text-sm text-red-400">
                Ese enlace ya no es válido o venció. Solicitá uno nuevo.
              </p>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button
              type="submit"
              disabled={estado === "enviando" || estado === "enviado"}
            >
              {estado === "enviando" ? "Enviando…" : "Enviar enlace de acceso"}
            </Button>
          </form>

          {estado === "enviado" && (
            <div className="flex flex-col items-center gap-4 pt-6 text-center">
              <Send
                className="-rotate-12 text-primary-400"
                size={28}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <div className="flex w-full flex-col items-center gap-2 rounded-2xl border border-gray-700/70 bg-gray-900/70 px-6 py-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success-500">
                  <Check className="text-white" size={18} strokeWidth={2.5} aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-white">
                  Te enviamos un enlace a
                  <br />
                  {email}
                </p>
                <p className="text-xs text-gray-300">
                  Revisá tu bandeja de entrada
                  <br />y hacé clic en el enlace para entrar.
                </p>
              </div>
            </div>
          )}

          {estado !== "enviado" && (
            <p className="pt-2 text-xs text-gray-300">
              ¿Sos dueño de un negocio? Iniciá sesión para publicarlo o
              editarlo.{" "}
              <Link href="/" className="text-white underline">
                Volver al inicio
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
