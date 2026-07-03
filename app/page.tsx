import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold text-slate-900">VíaSur</h1>
      <p className="text-sm text-slate-500">
        Servicios locales del sur de Costa Rica.
      </p>
      <Link
        href="/registrar"
        className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white active:bg-emerald-700"
      >
        Registrar mi servicio
      </Link>
    </main>
  );
}
