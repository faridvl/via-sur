import { ElementType, HTMLAttributes } from "react";

export enum VarianteTypography {
  TituloPagina = "titulo-pagina",
  TituloSeccion = "titulo-seccion",
  TituloCard = "titulo-card",
  Label = "label",
  Cuerpo = "cuerpo",
  Caption = "caption",
  Error = "error",
}

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variante: VarianteTypography;
  as?: ElementType;
}

const CLASES_POR_VARIANTE: Record<VarianteTypography, string> = {
  [VarianteTypography.TituloPagina]: "text-2xl font-bold tracking-tight text-white",
  [VarianteTypography.TituloSeccion]:
    "text-[11px] font-bold uppercase tracking-widest text-gray-500",
  [VarianteTypography.TituloCard]: "text-lg font-bold tracking-tight text-white",
  [VarianteTypography.Label]: "text-sm font-semibold text-gray-200",
  [VarianteTypography.Cuerpo]: "text-sm leading-relaxed text-gray-400",
  [VarianteTypography.Caption]: "text-xs font-medium text-gray-500",
  [VarianteTypography.Error]: "text-sm font-medium text-red-400",
};

const ETIQUETA_POR_DEFECTO: Record<VarianteTypography, ElementType> = {
  [VarianteTypography.TituloPagina]: "h1",
  [VarianteTypography.TituloSeccion]: "h2",
  [VarianteTypography.TituloCard]: "h3",
  [VarianteTypography.Label]: "span",
  [VarianteTypography.Cuerpo]: "p",
  [VarianteTypography.Caption]: "p",
  [VarianteTypography.Error]: "p",
};

/**
 * Texto genérico del proyecto. `variante` cubre los roles tipográficos
 * que se repiten en toda la app (título de página, título de sección
 * en mayúsculas, título de card, label de campo, cuerpo, caption/meta,
 * error). Reemplaza los <p>/<span>/<h1> sueltos con clases repetidas.
 */
export default function Typography({
  variante,
  as,
  className,
  ...props
}: TypographyProps) {
  const Elemento = as ?? ETIQUETA_POR_DEFECTO[variante];

  return (
    <Elemento
      className={[CLASES_POR_VARIANTE[variante], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
