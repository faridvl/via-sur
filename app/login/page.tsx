"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, Mail } from "lucide-react";
import Button from "@/components/Button";
import LogoTicoRed from "@/components/LogoTicoRed";

type Estado = "idle" | "enviando" | "enviado" | "verificando" | "error";

export default function IniciarSesionPage() {
  return (
    <Suspense fallback={null}>
      <FormularioIniciarSesion />
    </Suspense>
  );
}

function FormularioIniciarSesion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enlaceInvalido = searchParams.get("error") === "enlace-invalido";

  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [error, setError] = useState<string | null>(null);

  const enlaceEnviado = estado === "enviado" || estado === "verificando";

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
        throw new Error(data.error ?? "No se pudo enviar el código.");
      }

      setEstado("enviado");
    } catch (err) {
      setEstado("error");
      setError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      );
    }
  }

  async function manejarVerificarCodigo(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEstado("verificando");
    setError(null);

    try {
      const res = await fetch("/api/auth/verificar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo }),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Ese código no es válido.");
      }

      router.push("/mis-servicios");
    } catch (err) {
      setEstado("enviado");
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
          <LogoTicoRed size={40} />
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-white">Tico</span>
            <span className="text-primary-400">Red</span>
          </h1>
          <p className="text-sm text-gray-200">
            La red de comercios y servicios de Costa Rica
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-4">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Iniciar sesión
          </h2>
          <p className="-mt-2 text-sm text-gray-300">
            Te enviamos un código a tu correo y listo. Sin contraseñas.
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
                  disabled={enlaceEnviado}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-primary-400 disabled:opacity-60"
                />
              </span>
            </label>

            {enlaceInvalido && (
              <p className="text-sm text-red-400">
                Ese enlace ya no es válido o venció. Solicitá uno nuevo.
              </p>
            )}

            {error && !enlaceEnviado && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            {!enlaceEnviado && (
              <Button type="submit" disabled={estado === "enviando"}>
                {estado === "enviando" ? "Enviando…" : "Enviar código de acceso"}
              </Button>
            )}
          </form>

          {enlaceEnviado && (
            <div className="flex flex-col items-center gap-4 pt-4 text-center">
              <p className="text-sm text-gray-300">
                Te enviamos un código a
                <br />
                <span className="font-semibold text-white">{email}</span>
              </p>

              <form
                onSubmit={manejarVerificarCodigo}
                className="flex w-full flex-col gap-3 rounded-2xl border border-gray-700/70 bg-gray-900/70 px-6 py-6"
              >
                <label className="flex flex-col items-center gap-2">
                  <span className="text-sm font-semibold text-gray-200">
                    Código de 6 dígitos
                  </span>
                  <span className="relative flex w-full items-center justify-center">
                    <KeyRound
                      className="pointer-events-none absolute left-4 text-gray-500"
                      size={18}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      required
                      autoFocus
                      value={codigo}
                      onChange={(e) =>
                        setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3.5 pl-11 pr-4 text-center text-lg font-bold tracking-[0.5em] text-white outline-none focus:border-primary-400"
                    />
                  </span>
                </label>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={estado === "verificando" || codigo.length !== 6}
                >
                  {estado === "verificando" ? "Verificando…" : "Ingresar"}
                </Button>
              </form>

              <p className="text-xs text-gray-300">
                También podés hacer clic en el enlace del correo si estás
                en la computadora.
              </p>
            </div>
          )}

          {!enlaceEnviado && (
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
