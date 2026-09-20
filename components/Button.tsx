import { ButtonHTMLAttributes } from "react";

type Variante = "primary" | "pill" | "ghost" | "ghost-primary" | "toggle";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  /** Solo aplica a variante="toggle": si el botón representa la opción elegida. */
  activo?: boolean;
}

const CLASES_BASE =
  "inline-flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50";

const CLASES_POR_VARIANTE: Record<Variante, string> = {
  primary:
    "rounded-xl bg-primary-600 px-4 py-4 text-sm font-bold tracking-tight text-white",
  pill: "w-fit rounded-full bg-gray-800 px-3.5 py-2 text-xs font-semibold text-gray-300",
  ghost:
    "w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm font-semibold text-gray-200",
  "ghost-primary":
    "w-full rounded-xl border border-primary-500 bg-transparent px-4 py-3 text-sm font-semibold text-primary-400",
  toggle: "rounded-xl border px-4 py-3 text-sm font-semibold",
};

const CLASES_TOGGLE = {
  activo: "border-primary-500 bg-primary-500 text-white",
  inactivo: "border-gray-700 bg-gray-800 text-gray-300",
};

/**
 * Botón genérico del proyecto. `variante` cubre los cuatro patrones
 * visuales que se repiten en toda la app (CTA principal, pill de
 * navegación, acción secundaria con borde, y opción seleccionable tipo
 * chip). Para "toggle", pasar `activo` y `aria-pressed` en el caller.
 */
export default function Button({
  variante = "primary",
  activo = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const clasesVariante =
    variante === "toggle"
      ? `${CLASES_POR_VARIANTE.toggle} ${activo ? CLASES_TOGGLE.activo : CLASES_TOGGLE.inactivo}`
      : CLASES_POR_VARIANTE[variante];

  return (
    <button
      type={type}
      className={[CLASES_BASE, clasesVariante, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
