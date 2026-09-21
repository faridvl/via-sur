import {
  UtensilsCrossed,
  Scissors,
  CarTaxiFront,
  Bike,
  Stethoscope,
  Music,
  Store,
  Wrench,
  LucideIcon,
} from "lucide-react";

/**
 * Mapa de nombre de categoría (tal cual vive en la tabla `categorias`)
 * a un ícono outline de lucide-react. `Store` es el genérico de reserva
 * para categorías futuras que no estén en este mapa.
 */
const ICONOS_POR_NOMBRE: Record<string, LucideIcon> = {
  "Comida / Sodas": UtensilsCrossed,
  "Barbería y Estética": Scissors,
  "Taxis y Fletes": CarTaxiFront,
  "Mandados / Express": Bike,
  "Enfermería y Salud": Stethoscope,
  "Música y Shows": Music,
  "Tiendas y Minisupers": Store,
  "Otros Oficios": Wrench,
};

/**
 * Color de marca por categoría (clase Tailwind), solo para el fondo del
 * círculo del carrusel de categorías — le da identidad visual a cada
 * rubro en vez de un gris uniforme. `bg-primary-700` es el genérico de
 * reserva para categorías futuras que no estén en este mapa.
 */
const COLOR_POR_NOMBRE: Record<string, string> = {
  "Comida / Sodas": "bg-accent-500",
  "Barbería y Estética": "bg-primary-400",
  "Taxis y Fletes": "bg-warning-500",
  "Mandados / Express": "bg-primary-500",
  "Enfermería y Salud": "bg-primary-400",
  "Música y Shows": "bg-violet-500",
  "Tiendas y Minisupers": "bg-pink-500",
  "Otros Oficios": "bg-primary-700",
};

export function iconoDeCategoria(nombre: string): LucideIcon {
  return ICONOS_POR_NOMBRE[nombre] ?? Store;
}

export function colorDeCategoria(nombre: string): string {
  return COLOR_POR_NOMBRE[nombre] ?? "bg-primary-700";
}
