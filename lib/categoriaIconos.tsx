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

export function iconoDeCategoria(nombre: string): LucideIcon {
  return ICONOS_POR_NOMBRE[nombre] ?? Store;
}
