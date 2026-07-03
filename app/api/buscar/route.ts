import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { ServicioLocal } from "@/types/viasur";

// Depende del query param 'q' en cada request; nunca debe prerenderizarse.
export const dynamic = "force-dynamic";

const LIMITE_RESULTADOS = 30;

/**
 * GET /api/buscar?q=texto
 * Busca servicios por nombre (coincidencia parcial, insensible a mayúsculas)
 * en todas las localidades y categorías activas. Los destacados se listan
 * primero.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ servicios: [] });
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
        and sl.nombre_servicio ilike ${`%${q}%`}
      order by sl.es_destacado desc, sl.nombre_servicio asc
      limit ${LIMITE_RESULTADOS}
    `) as ServicioLocal[];

    return NextResponse.json({ servicios });
  } catch {
    return NextResponse.json(
      { error: "No se pudo completar la búsqueda." },
      { status: 500 }
    );
  }
}
