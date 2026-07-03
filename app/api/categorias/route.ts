import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { Categoria } from "@/types/viasur";

// Sin esto, Next.js intenta prerenderizar esta ruta en build time (no lee
// request ni cookies, así que no hay señal automática de que es dinámica),
// y falla porque DATABASE_URL todavía no existe en ese momento del build.
export const dynamic = "force-dynamic";

/**
 * GET /api/categorias
 * Devuelve las categorías activas, ordenadas alfabéticamente.
 */
export async function GET() {
  const sql = getDb();

  try {
    const categorias = (await sql`
      select id, nombre, icono, activa
      from categorias
      where activa = true
      order by nombre asc
    `) as Categoria[];

    return NextResponse.json({ categorias });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron obtener las categorías." },
      { status: 500 }
    );
  }
}
