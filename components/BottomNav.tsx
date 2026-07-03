"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", etiqueta: "Inicio", icono: "🏠" },
  { href: "/buscar", etiqueta: "Buscar", icono: "🔍" },
  { href: "/mis-servicios", etiqueta: "Mis Servicios", icono: "🏪" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 border-t border-zinc-200 bg-white/90 backdrop-blur-md sm:rounded-b-[2.5rem]">
      {ITEMS.map((item) => {
        const activo =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-transform active:scale-95"
          >
            <span
              className={`text-xl transition-opacity ${
                activo ? "opacity-100" : "opacity-50"
              }`}
            >
              {item.icono}
            </span>
            <span
              className={`text-[10px] font-semibold tracking-tight ${
                activo ? "text-indigo-600" : "text-zinc-400"
              }`}
            >
              {item.etiqueta}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
