"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import Button from "@/components/Button";

type Estado = "idle" | "enviando" | "enviado" | "error";

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
    <main className="flex min-h-screen w-full flex-col gap-6 px-5 pb-10 pt-6">
      <Button variante="pill" onClick={() => router.back()}>
        ← Volver
      </Button>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Iniciar sesión
        </h1>
        <p className="text-sm text-gray-400">
          Ingresá tu correo y te mandamos un enlace para entrar, sin
          contraseña.
        </p>
      </header>

      {estado === "enviado" ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-gray-800/60 px-6 py-12 text-center">
          <MailCheck className="text-success-400" size={32} strokeWidth={1.5} />
          <p className="text-sm font-semibold text-gray-200">
            Te enviamos un enlace a {email}
          </p>
          <p className="text-xs text-gray-400">
            Abrilo desde este mismo dispositivo para iniciar sesión. Vence en
            15 minutos.
          </p>
        </div>
      ) : (
        <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-200">
              Correo electrónico
            </span>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-primary-400"
              placeholder="tu@correo.com"
            />
          </label>

          {enlaceInvalido && (
            <p className="text-sm text-red-400">
              Ese enlace ya no es válido o venció. Solicitá uno nuevo.
            </p>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" disabled={estado === "enviando"}>
            {estado === "enviando" ? "Enviando…" : "Enviar enlace de acceso"}
          </Button>

          <p className="text-center text-xs text-gray-500">
            ¿Sos dueño de un negocio? Iniciá sesión para publicarlo o
            editarlo.{" "}
            <Link href="/" className="text-gray-300 underline">
              Volver al inicio
            </Link>
          </p>
        </form>
      )}
    </main>
  );
}
