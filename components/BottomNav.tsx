"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Store } from "lucide-react";

const ITEMS = [
  { href: "/", etiqueta: "Inicio", Icono: Home },
  { href: "/buscar", etiqueta: "Buscar", Icono: Search },
  { href: "/mis-servicios", etiqueta: "Mis Servicios", Icono: Store },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/servicio/")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-gray-800 bg-gray-900/95 backdrop-blur-md">
      {ITEMS.map(({ href, etiqueta, Icono }) => {
        const activo = href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 py-4 transition-transform active:scale-95"
          >
            <Icono
              className={activo ? "text-white" : "text-gray-500"}
              size={22}
              strokeWidth={1.75}
            />
            <span
              className={`text-[10px] font-medium tracking-tight ${
                activo ? "text-white" : "text-gray-500"
              }`}
            >
              {etiqueta}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
