import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { ServicioLocal } from "@/types/viasur";

// Depende de la base de datos en cada request; nunca debe prerenderizarse.
export const dynamic = "force-dynamic";

/**
 * GET /api/servicios/:id
 * Devuelve el detalle completo de un servicio puntual, para la vista
 * de detalle del negocio.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const sql = getDb();

  try {
    const [servicio] = (await sql`
      select *
      from servicios_locales
      where id = ${id}
    `) as ServicioLocal[];

    if (!servicio) {
      return NextResponse.json(
        { error: "No se encontró el servicio." },
        { status: 404 }
      );
    }

    return NextResponse.json({ servicio });
  } catch {
    return NextResponse.json(
      { error: "No se pudo obtener el servicio." },
      { status: 500 }
    );
  }
}
