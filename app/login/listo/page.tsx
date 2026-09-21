import Link from "next/link";
import { Check } from "lucide-react";
import Button from "@/components/Button";
import LogoTicoRed from "@/components/LogoTicoRed";

/**
 * Pantalla mostrada tras consumir el enlace mágico en el navegador (no en
 * la PWA instalada: los sistemas operativos abren el link del correo con
 * el navegador por defecto, no con la app instalada, salvo que existan
 * Android App Links / iOS Universal Links configurados). La sesión ya
 * quedó activa vía cookie; solo falta que el usuario vuelva a la PWA.
 */
export default function EnlaceVerificadoPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-gray-950">
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
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-500">
            <Check className="text-white" size={28} strokeWidth={2.5} aria-hidden="true" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Ya iniciaste sesión
            </h2>
            <p className="max-w-xs text-sm text-gray-300">
              Este enlace se abrió en el navegador. Si instalaste TicoRed
              como app, volvé a abrirla desde el ícono en tu pantalla de
              inicio — la sesión ya te va a estar esperando ahí.
            </p>
          </div>

          <div className="flex w-full max-w-xs flex-col gap-3 pt-2">
            <Link href="/mis-servicios" className="w-full">
              <Button className="w-full">Continuar en el navegador</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
