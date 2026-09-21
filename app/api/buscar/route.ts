import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { ImagenServicio, ServicioLocal } from "@/types/viasur";

// Depende del query param 'q' en cada request; nunca debe prerenderizarse.
export const dynamic = "force-dynamic";

const LIMITE_RESULTADOS = 30;

/**
 * GET /api/buscar?q=texto&localidad_id=1
 * Busca servicios por nombre: coincidencia parcial, insensible a
 * mayúsculas y a tildes/diacríticos (vía `unaccent`, ej. "barberia"
 * encuentra "Barbería") en categorías activas. Si se pasa 'localidad_id',
 * restringe la búsqueda a esa localidad. Sin 'localidad_id', busca en
 * todas las localidades activas. Los destacados se listan primero.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const localidadIdParam = request.nextUrl.searchParams.get("localidad_id");
  const localidadId = localidadIdParam ? Number(localidadIdParam) : null;

  if (q.length < 2) {
    return NextResponse.json({ servicios: [], imagenes: {} });
  }

  const sql = getDb();

  try {
    const servicios = (await sql`
      select sl.*
      from servicios_locales sl
      join localidades l on l.id = sl.localidad_id
      join categorias c on c.id = sl.categoria_id
      where l.activa = true
        and c.activa = true
        and unaccent(sl.nombre_servicio) ilike unaccent(${`%${q}%`})
        and (${localidadId}::int is null or sl.localidad_id = ${localidadId})
      order by sl.es_destacado desc, sl.nombre_servicio asc
      limit ${LIMITE_RESULTADOS}
    `) as ServicioLocal[];

    const imagenes: Record<string, ImagenServicio[]> = {};

    if (servicios.length > 0) {
      const ids = servicios.map((s) => s.id);
      const filasImagenes = (await sql`
        select *
        from imagenes_servicio
        where servicio_id = any(${ids})
        order by servicio_id, orden asc
      `) as ImagenServicio[];

      for (const img of filasImagenes) {
        (imagenes[img.servicio_id] ??= []).push(img);
      }
    }

    return NextResponse.json({ servicios, imagenes });
  } catch {
    return NextResponse.json(
      { error: "No se pudo completar la búsqueda." },
      { status: 500 }
    );
  }
}
